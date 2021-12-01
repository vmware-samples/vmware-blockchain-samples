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
import subprocess
import threading
import urllib3
from solcx import compile_files, install_solc
from web3 import Web3
from web3.auto import w3 as w3help
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

w3 = None
abi = None
bin = None

# compiling securityToken source file
def compile_security_token():
    install_solc("0.6.0")
    global abi,bin
    compiled_sol = compile_files(["../../hardhat/contracts/SecurityToken.sol"], solc_version="0.6.0", optimize=True)
    print("compiled sources ")
    bin = compiled_sol['../../hardhat/contracts/SecurityToken.sol:SecurityToken']['bin']
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
    return tx_receipt


# function to deploy contract address and distribute tokens among all senders
def deploy_contract(contract_deploy_account, contract_deploy_account_key, ethrpcApiUrl):
    # connecting to end point
    compile_security_token()
    global w3
    w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl,
              request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    contract_deploy_status = False
    contract = w3.eth.contract(abi=abi, bytecode=bin)

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
    if tx_receipt.status == 1:
        print(
            "smart contract deploy success, contract address: '{}'".format(
                tx_receipt.contractAddress
            )
        )
        contract_deploy_status = True
    else:
        assert contract_deploy_status, "smart contract deploy failed"

    contractAddress = tx_receipt.contractAddress
    dapp_contract = w3.eth.contract(address=contractAddress, abi=abi)
    acc_balance = dapp_contract.functions.balanceOf(
        contract_deploy_account).call()
    print("Account {} has balance of {} tokens \n".format(
        contract_deploy_account, acc_balance))

    return contractAddress


# distributing token to senders
def distribute_tokens(accts, priv_keys, contractAddress):
    dapp_contract = w3.eth.contract(address=contractAddress, abi=abi)
    for i in range(1, len(accts)):
        construct_txn = dapp_contract.functions.transfer(accts[i], 10000000000000000000).buildTransaction({
            'from': accts[0],
            'gas': 2000000,
            'gasPrice': 0,
            'nonce': w3.eth.get_transaction_count(accts[0]),
            'chainId': 5000
        })

        tx_receipt = tx_receipt_poll(construct_txn, priv_keys[0])
        assert tx_receipt.status == 1, "transaction failed"

        acc_balance = dapp_contract.functions.balanceOf(accts[i]).call()
        print("Account {} has balance of {} tokens \n".format(
            accts[i], acc_balance))


# function to run new ERC20 dapp instance
def run_dapp(priv_key, contract_address, port):
    print("start "+str(port))
    if(contract_address):
        os.environ["TOKEN_CONTRACT_ADDRESS"] = contract_address

    mvn = "cd .. ; mvn spring-boot:run -Dspring-boot.run.arguments='--server.port=" + \
        str(port) + " --token.private-key=" + priv_key + "'"

    p = subprocess.Popen(mvn, shell=True, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()
    print(stderr)
    if(not p.returncode):
        print("Dapp with port {} completed with status code {}".format((port), p.returncode)) # is 0 if success
    
    return (not p.returncode)


# extract kv from list and adds them to dictionary
def list_to_kv(inp_list, inp_dict):
    for obj in inp_list:
        obj_kv = obj.split("=")
        inp_dict[obj_kv[0]] = inp_dict.get(obj_kv[0],0) + int(obj_kv[1])


# reads reports of all runs and write to aggregate-report.json
def aggregate_report(instance):
    port= 8080
    filename = "../output/result/report-"
    aggregate_throughput = 0
    aggregate_latency = 0
    aggregate_tx = 0
    aggregate_loadfactor = 0
    aggregate_txStatus = {}
    aggregate_txErrors = {}
    aggregate_receiptStatus = {}
    aggregate_receiptErrors = {}
    for i in range(1, instance+1):
        with open(filename+str(port+i)+'.json', 'r') as f:
            data = json.load(f)
            aggregate_tx += data['txTotal']
            aggregate_throughput += data['averageThroughput']
            aggregate_latency += data['averageLatency']
            aggregate_loadfactor += data['loadFactor']

            txStatus_list = data["txStatus"].split(",")
            list_to_kv(txStatus_list, aggregate_txStatus)
            
            if(data["txErrors"]):
                txErrors_list = data["txErrors"].split(",")
                list_to_kv(txErrors_list, aggregate_txErrors)

            if(data["receiptStatus"]):
                receiptStatus_list = data["receiptStatus"].split(",")
                list_to_kv(receiptStatus_list, aggregate_receiptStatus)
            
            if(data["receiptErrors"]):
                receiptErrors_list = data["receiptErrors"].split(",")
                list_to_kv(receiptErrors_list, aggregate_receiptErrors)
                
    json_obj = {}
    json_obj['aggregate_tx'] = aggregate_tx
    json_obj['aggregate_throughput'] = aggregate_throughput
    json_obj['aggregate_latency'] = int(aggregate_latency/instance)
    json_obj['aggregate_loadfactor'] = aggregate_loadfactor
    json_obj['aggregate_txStatus'] = aggregate_txStatus
    json_obj['aggregate_txErrors'] = aggregate_txErrors
    json_obj['aggregate_receiptStatus'] = aggregate_receiptStatus
    json_obj['aggregate_receiptErrors'] = aggregate_receiptErrors

    filename = "../output/result/aggregate-report.json"
    with open(filename, 'w') as f:
        json.dump(json_obj, f, indent=4)


def main():
    instance = int(os.getenv('DAPP_INSTANCES', 1))
    print("No of dapp Instances ",instance)

    if(not os.getenv('WEB3J_ETHCLIENT_HOST')):
        exit("Plz set WEB3J_ETHCLIENT_HOST env variable")

    ethrpcApiUrl = os.getenv('WEB3J_ETHCLIENT_PROTOCOL', "http") + "://" + os.getenv(
        'WEB3J_ETHCLIENT_HOST') + ":" + os.getenv('WEB3J_ETHCLIENT_PORT', "8545")
    print("Ethereum Endpoint ",ethrpcApiUrl)

    share_contract = os.getenv("SHARE_CONTRACT", 'False').lower() in ('true', '1', 't')

    accts = []
    priv_keys = []
    for i in range(instance+1):
        acct = w3help.eth.account.create('KEYSMASH FJAFJKLDSKF7JKFDJ 1530')
        accts.append(Web3.toChecksumAddress(acct.address[2:].lower()))
        priv_keys.append(acct.privateKey.hex()[2:].lower())

    print("Account address list = ", accts)

    threads = []
    port = 8080
    if(share_contract and instance>1):
        contract_address = deploy_contract(accts[0], priv_keys[0], ethrpcApiUrl)
        print("Contract Address -",contract_address)
        distribute_tokens(accts, priv_keys, contract_address)
        print("tokens distributed among senders")

        for i in range(1, len(accts)):
            t = threading.Thread(target=run_dapp, args=(
                priv_keys[i], contract_address, port+i))
            threads.append(t)
            t.start()
    else:
        for i in range(1, len(accts)):
            t = threading.Thread(
                target=run_dapp, args=(priv_keys[i], None, port+i))
            threads.append(t)
            t.start()

    for t in threads:
        t.join()

    aggregate_report(instance)


if __name__ == "__main__":
    main()
