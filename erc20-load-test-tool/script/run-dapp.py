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


# compiling securityToken source file
def compile_security_token():
    install_solc("0.6.0")
    global abi, bytecode
    compiled_sol = compile_files(
        ["../../hardhat/contracts/SecurityToken.sol"], solc_version='0.6.0', optimize=True)
    print("compiled sources ")
    bytecode = compiled_sol['../../hardhat/contracts/SecurityToken.sol:SecurityToken']['bin']
    abi = compiled_sol['../../hardhat/contracts/SecurityToken.sol:SecurityToken']['abi']


# function to validate tx hash and poll for receipt
def tx_receipt_poll(construct_txn, acc_priv_key):
    signed_txn = w3.eth.account.sign_transaction(
        construct_txn, acc_priv_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "tx hash mismatch"

    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("Transaction receipt: '{}'".format(tx_receipt))
    assert tx_receipt.status == 1, "transaction failed"
    return tx_receipt


# function to deploy contract address and distribute tokens among all senders
def deploy_contract(contract_deploy_account, contract_deploy_account_key, host):
    # connecting to end point
    url = "http://" + host + ":8545"
    compile_security_token()
    global w3
    w3 = Web3(Web3.HTTPProvider(url,
                                request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
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
    print("smart contract deploy success, contract address: '{}'".format(
        tx_receipt.contractAddress))

    contract_address = tx_receipt.contractAddress
    dapp_contract = w3.eth.contract(address=contract_address, abi=abi)
    acc_balance = dapp_contract.functions.balanceOf(
        contract_deploy_account).call()
    print("Account {} has balance of {} tokens \n".format(
        contract_deploy_account, acc_balance))

    return contract_address


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
    cmd = "cd ..; java -jar -Dserver.port=" + str(port) + " -Dtoken.private-key=" + priv_key + " " + jar

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
    aggregate_throughput = 0
    aggregate_latency = 0
    aggregate_tx = 0
    aggregate_loadfactor = 0
    aggregate_tx_status = {}
    aggregate_tx_errors = {}
    aggregate_receipt_status = {}
    aggregate_receipt_errors = {}
    for i in range(1, instance + 1):
        try:
            with open(filename + str(port + i) + '.json', 'r') as f:
                data = json.load(f)
                aggregate_tx += data['txTotal']
                aggregate_throughput += data['averageThroughput']
                aggregate_latency += data['averageLatency']
                aggregate_loadfactor += data['loadFactor']

                if data["txStatus"]:
                    tx_status_list = data["txStatus"].split(",")
                    list_to_kv(tx_status_list, aggregate_tx_status)

                if data["txErrors"]:
                    tx_errors_list = data["txErrors"].split("<br>")
                    list_to_kv(tx_errors_list, aggregate_tx_errors)

                if data["receiptStatus"]:
                    receipt_status_list = data["receiptStatus"].split(",")
                    list_to_kv(receipt_status_list, aggregate_receipt_status)

                if data["receiptErrors"]:
                    receipt_errors_list = data["receiptErrors"].split("<br>")
                    list_to_kv(receipt_errors_list, aggregate_receipt_errors)
        except IOError:
            print("result file not available for run {}".format(port + i))

    json_obj = {'aggregate_tx': aggregate_tx, 'aggregate_throughput': aggregate_throughput,
                'aggregate_latency': int(aggregate_latency / instance), 'aggregate_loadfactor': aggregate_loadfactor,
                'aggregate_txStatus': aggregate_tx_status, 'aggregate_txErrors': aggregate_tx_errors,
                'aggregate_receiptStatus': aggregate_receipt_status, 'aggregate_receiptErrors': aggregate_receipt_errors,
                'batch_size' : os.environ['WORKLOAD_BATCH_SIZE']
                }

    filename = "../output/result/aggregate-report.json"
    with open(filename, 'w') as f:
        json.dump(json_obj, f, indent=4)


# function to start wavefront proxy
def start_wavefront_proxy():
    wavefront_token = os.environ['WAVEFRONT_TOKEN']
    cmd = 'docker run -d -p 2878:2878 -e WAVEFRONT_URL=https://vmware.wavefront.com/api -e ' \
          'WAVEFRONT_TOKEN=' + wavefront_token + ' -e JAVA_HEAP_USAGE=4G -e JVM_USE_CONTAINER_OPTS=false --name ' \
                                                 'wavefront-proxy athena-docker-local.artifactory.eng.vmware.com' \
                                                 '/wavefront-proxy:10.12 '
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

    contract_address = None
    if share_contract:
        assert dapp_count > 1, "At least 2 instances should run to share contract."
        contract_address = deploy_contract(accts[0], priv_keys[0], host)
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
