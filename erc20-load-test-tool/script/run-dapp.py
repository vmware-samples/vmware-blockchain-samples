"""
PLease set following environment variables for this script to work properly

export DAPP_INSTANCES=<some integer>   default value=1
export WEB3J_ETHCLIENT_HOST=<ip address>   default value=None
export WEB3J_ETHCLIENT_PROTOCOL=<>   default value=http
export WEB3J_ETHCLIENT_PORT=<>   default value=8545
export SHARE_CONTRACT=<boolean>  default value=false

"""
import json
import os
import random
import subprocess
import threading
import time

import urllib3
from solcx import compile_files, install_solc
from web3 import Web3
from web3.auto import w3 as w3help
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

w3 = None
abi = None
bytecode = None
abi_permissioning = None
bytecode_permissioning = None

super_admins = ["0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8", "0xF4d5B303A15b04D7C6b7510b24c62D393805B8d7",
                "0x67C94d4a4fab02697513e4611A4742a98879aD56", "0x90Dc522189C4a368471C5AB3592f4789C21c560a"]
super_admins_key = ["5094f257d3462083bcbc02c61d98c038cfa71cdd497834c5f38cd75010ddb7a5",
                    "78785c4ab4ba44b83509296af86af56ff00db79ba26a292d0556a4b4e8cea87c",
                    "417fbb670417375f2916a4b0110dc7d68d81ea15aad3e6eb69f166b5bed6503f",
                    "9112ecbfc0a7c1fd7fdad5679dccec3b85b4ab32fe4268fe11f38cf8e5f44c39"]


# setup w3 http provider
def setup_w3(host, port, protocol):
    if protocol == "grpc":
        port = "8545"
    url = "http://" + host + ":" + port
    global w3
    w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)


# compiling securityToken source file
def compile_account_permissioning():
    install_solc("0.7.6")
    global abi_permissioning, bytecode_permissioning
    compiled_sol = compile_files(
        ["contracts/Permissioning.sol"], solc_version='0.7.6', optimize=True)
    print("compiled permissioning sources ")
    bytecode_permissioning = compiled_sol['contracts/Permissioning.sol:Permissioning']['bin']
    abi_permissioning = compiled_sol['contracts/Permissioning.sol:Permissioning']['abi']


# compiling securityToken source file
def compile_security_token():
    install_solc("0.6.0")
    global abi, bytecode
    compiled_sol = compile_files(
        ["../../hardhat/contracts/SecurityToken.sol"], solc_version='0.6.0', optimize=True)
    print("compiled sources ")
    bytecode = compiled_sol['../../hardhat/contracts/SecurityToken.sol:SecurityToken']['bin']
    abi = compiled_sol['../../hardhat/contracts/SecurityToken.sol:SecurityToken']['abi']


# function to deploy contract address and distribute tokens among all senders
def deploy_contract(contract_deploy_account, contract_deploy_account_key):
    compile_security_token()
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # deploying contract
    construct_txn = contract.constructor("ERC20", "ERC20", 1000000000000).buildTransaction(
        {
            "from": contract_deploy_account,
            "gas": 2000000,
            "gasPrice": 0,
            "nonce": w3.eth.get_transaction_count(contract_deploy_account),
            "chainId": 5000,
        }
    )
    tx_receipt = tx_receipt_poll(construct_txn, contract_deploy_account_key)
    print("Security token smart contract deploy success, contract address: '{}'".format(
      tx_receipt.contractAddress))

    contract_address = tx_receipt.contractAddress
    dapp_contract = w3.eth.contract(address=contract_address, abi=abi)
    acc_balance = dapp_contract.functions.balanceOf(
        contract_deploy_account).call()
    print("Account {} has balance of {} tokens \n".format(
        contract_deploy_account, acc_balance))

    return contract_address


# function to deploy contract address and distribute tokens among all senders
def deploy_contract_permissioning():
    compile_account_permissioning()
    permissioning_contract = w3.eth.contract(abi=abi_permissioning, bytecode=bytecode_permissioning)

    # deploying perm contract
    construct_perm_txn = permissioning_contract.constructor(super_admins).buildTransaction(
      {
        "from": super_admins[0],
        "gas": 2000000,
        "gasPrice": 0,
        "nonce": w3.eth.get_transaction_count(super_admins[0]),
        "chainId": 5000,
      }
    )

    tx_receipt_perm = tx_receipt_poll(construct_perm_txn, super_admins_key[0])
    print("\nAccount Permissioning smart contract deploy success, contract address: '{}'".format(
      tx_receipt_perm.contractAddress))

    perm_contract_address = tx_receipt_perm.contractAddress
    permissioning_dapp = w3.eth.contract(address=perm_contract_address, abi=abi_permissioning)

    return perm_contract_address, permissioning_dapp


# send tx to raise write read access from super_admin[0] account
def write_read_access(permissioning_dapp, accts):
    for acct in accts:
        print("\ngiving write and read access to", acct)
        construct_txn = permissioning_dapp.functions.addUser(acct, [2, 3]).buildTransaction(
            {
                'from': super_admins[0],
                'gas': 2000000,
                'gasPrice': 0,
                'nonce': w3.eth.get_transaction_count(super_admins[0]),
                'chainId': 5000
            })
        tx_receipt_poll(construct_txn, super_admins_key[0])

        for i in range(1, len(super_admins)-1):
            approve_access(permissioning_dapp, acct, super_admins[i], super_admins_key[i])


# approve read write access by 2 other super admins
def approve_access(perm_dapp_contract, acct, super_admin_addr, super_admin_key):
    print("\napproving access for", acct, "by", super_admin_addr)
    construct_txn = perm_dapp_contract.functions.approveUserRequest(acct, [2, 3]).buildTransaction(
        {
            'from': super_admin_addr,
            'gas': 2000000,
            'gasPrice': 0,
            'nonce': w3.eth.get_transaction_count(super_admin_addr),
            'chainId': 5000
        })
    tx_receipt_poll(construct_txn, super_admin_key)


# checks if the account has read write access
def check_write_read_access(perm_dapp_contract, accts):
    for acct in accts:
        is_writer = perm_dapp_contract.caller({'from': acct}).isWriter()
        is_reader = perm_dapp_contract.caller({'from': acct}).isViewer()
        print("\nAccount {} is_writer = {} and is_reader = {}".format(acct, is_writer, is_reader))


# distributing token to senders
def distribute_tokens(accts, priv_keys, contract_address):
    dapp_contract = w3.eth.contract(address=contract_address, abi=abi)
    for i in range(1, len(accts)):
        construct_txn = dapp_contract.functions.transfer(accts[i], 10000000000000000000).buildTransaction({
            'from': accts[0],
            'gas': 2000000,
            'gasPrice': 0,
            'nonce': w3.eth.get_transaction_count(accts[0]),
            'chainId': 5000
        })
        tx_receipt_poll(construct_txn, priv_keys[0])
        acc_balance = dapp_contract.functions.balanceOf(accts[i]).call()
        print("Account {} has balance of {} tokens \n".format(
            accts[i], acc_balance))


# function to validate tx hash and poll for receipt
def tx_receipt_poll(construct_txn, acc_priv_key):
    signed_txn = w3.eth.account.sign_transaction(
        construct_txn, acc_priv_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "tx hash mismatch"

    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("\nTransaction receipt: '{}'".format(tx_receipt))
    assert tx_receipt.status == 1, "transaction failed"
    return tx_receipt


# expose port on photon/linux machines
def expose_port(port):
    cmd = 'sudo iptables -A INPUT -p tcp --dport ' + str(port) + ' -j ACCEPT'
    subprocess.call(cmd, shell=True, stdout=subprocess.PIPE, stdin=subprocess.PIPE)


# function to run new ERC20 dapp instance
def run_dapp(priv_key, contract_address, port):
    print("start run on port " + str(port))
    if os.getenv('EXPOSE_UI_PORT_EXTERNALLY', 'False') in ('true', 'True', 'TRUE'):
        expose_port(port)
    if contract_address:
        os.environ["TOKEN_CONTRACT_ADDRESS"] = contract_address

    jar = "target/erc20-benchmark-1.0-SNAPSHOT.jar"
    cmd = "cd ..; java -jar -Dserver.port=" + str(port) + " -Dtoken.deployer-private-key=" + priv_key + " " + jar

    p = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    if not p.returncode:
        print("Dapp with port {} completed with status code {}".format(
            port, p.returncode))  # is 0 if success

    return not p.returncode


# extract kv from list and adds them to dictionary
def list_to_kv(inp_list, inp_dict):
    for obj in inp_list:
        obj_kv = obj.split("=")
        inp_dict[obj_kv[0]] = inp_dict.get(obj_kv[0], 0) + int(obj_kv[1])


# Read reports of all runs and write to aggregate-report.json
def aggregate_report(instance):
    port = 8000
    filename = "../output/result/report-"
    aggregate_write_throughput = 0
    aggregate_read_throughput = 0
    aggregate_write_latency = 0
    aggregate_read_latency = 0
    aggregate_tx = 0
    aggregate_concurrency = 0
    aggregate_write_req_status = {}
    aggregate_read_req_status = {}
    aggregate_write_req_errors = {}
    aggregate_read_req_errors = {}
    aggregate_receipt_status = {}
    aggregate_receipt_errors = {}
    for i in range(1, instance + 1):
        try:
            with open(filename + str(port + i) + '.json', 'r') as f:
                data = json.load(f)
                aggregate_tx += data['txTotal']
                aggregate_write_throughput += data['averageThroughput']
                aggregate_read_throughput += data['averageReadThroughput']
                aggregate_write_latency += data['averageLatency']
                aggregate_read_latency += data['averageReadLatency']
                aggregate_concurrency += data['concurrency']

                if data["txStatus"]:
                    tx_status_list = data["txStatus"].split(",")
                    list_to_kv(tx_status_list, aggregate_write_req_status)

                if data["txErrors"]:
                    tx_errors_list = data["txErrors"].split("<br>")
                    list_to_kv(tx_errors_list, aggregate_write_req_errors)

                if data["readStatus"]:
                    tx_status_list = data["readStatus"].split(",")
                    list_to_kv(tx_status_list, aggregate_read_req_status)

                if data["readErrors"]:
                    tx_errors_list = data["readErrors"].split("<br>")
                    list_to_kv(tx_errors_list, aggregate_read_req_errors)

                if data["receiptStatus"]:
                    receipt_status_list = data["receiptStatus"].split(",")
                    list_to_kv(receipt_status_list, aggregate_receipt_status)

                if data["receiptErrors"]:
                    receipt_errors_list = data["receiptErrors"].split("<br>")
                    list_to_kv(receipt_errors_list, aggregate_receipt_errors)
        except IOError:
            print("result file not available for run {}".format(port + i))

    json_obj = {'aggregate_tx': aggregate_tx, 'aggregate_write_throughput': aggregate_write_throughput,
                'aggregate_read_throughput': aggregate_read_throughput,
                'aggregate_write_latency': int(aggregate_write_latency / instance),
                'aggregate_read_latency': int(aggregate_read_latency / instance),
                'aggregate_concurrency': aggregate_concurrency,
                'aggregate_write_req_status': aggregate_write_req_status,
                'aggregate_read_req_status': aggregate_read_req_status,
                'aggregate_write_req_errors': aggregate_write_req_errors,
                'aggregate_read_req_errors': aggregate_read_req_errors,
                'aggregate_receiptStatus': aggregate_receipt_status,
                'aggregate_receiptErrors': aggregate_receipt_errors,
                'batch_size': os.environ['WORKLOAD_BATCH_SIZE']
                }

    filename = "../output/result/aggregate-report.json"
    with open(filename, 'w') as f:
        json.dump(json_obj, f, indent=4)
    print("Aggregated Result - \n"+json.dumps(json_obj, indent=4))


# function to start wavefront proxy
def start_wavefront_proxy():
    wavefront_token = os.environ['WAVEFRONT_TOKEN']

    cmd = 'docker run -d -p 2878:2878 -e WAVEFRONT_URL=https://vmware.wavefront.com/api -e ' \
          'WAVEFRONT_TOKEN=' + wavefront_token + ' -e JAVA_HEAP_USAGE=2G -e JVM_USE_CONTAINER_OPTS=false --name ' \
          'wavefront-proxy vmwaresaas.jfrog.io/vmwblockchain/blockbench-wavefront-proxy:10.9 '
    subprocess.call(cmd, shell=True, stdout=subprocess.PIPE)


# set environment variables inside .env
def set_env_var():
    cmd = 'source ./.env'
    subprocess.call(cmd, shell=True, stdout=subprocess.PIPE)


def main():
    set_env_var()
    host = os.environ['WEB3J_ETHCLIENT_HOST']
    client_port = os.getenv('WEB3J_ETHCLIENT_PORT', 8545)
    protocol = os.getenv('WEB3J_ETHCLIENT_PROTOCOL', "http")
    dapp_count = int(os.getenv('DAPP_INSTANCES', 1))
    share_contract = os.getenv('SHARE_CONTRACT', 'False') in ('true', 'True', 'TRUE')
    ethrpc_url = "{0}://{1}:{2}/".format(protocol, host, client_port)
    wavefront_enabled = os.getenv('MANAGEMENT_METRICS_EXPORT_WAVEFRONT_ENABLED', 'False') in ('true', 'True', 'TRUE')
    max_sleep_time = int(os.getenv('MAX_SLEEP_TIME', 5))

    print("No of dapp Instances ", dapp_count)
    print("Ethereum Endpoint ", ethrpc_url)

    if wavefront_enabled:
        start_wavefront_proxy()

    accts = []
    priv_keys = []
    for i in range(dapp_count + 1):
        acct = w3help.eth.account.create('KEYSMASH FJAFJKLDSKF7JKFDJ 1530')
        accts.append(Web3.toChecksumAddress(acct.address[2:].lower()))
        priv_keys.append(acct.privateKey.hex()[2:].lower())
    print("Account address list = ", accts)
    print("Account Private Keys = ", priv_keys)

    # setup w3 config
    setup_w3(host, client_port, protocol)

    # deploy permissioning contract
    perm_contract_addr, perm_dapp_contract = deploy_contract_permissioning()

    # give writer acccess to all the generated sender accts
    write_read_access(perm_dapp_contract, accts)

    # check if all sender has the writer access
    check_write_read_access(perm_dapp_contract, accts)

    contract_address = None
    if share_contract and dapp_count>1:
        contract_address = deploy_contract(accts[0], priv_keys[0])
        print("Contract Address -", contract_address)
        distribute_tokens(accts, priv_keys, contract_address)
        print("tokens distributed among senders")

    threads = []
    port = 8000
    for i in range(1, len(accts)):
        time.sleep(random.randint(1, max_sleep_time))
        t = threading.Thread(target=run_dapp, args=(
            priv_keys[i], contract_address, port + i))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    aggregate_report(dapp_count)


if __name__ == "__main__":
    main()
