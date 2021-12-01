import json
import os
import subprocess
import threading
import urllib3
from web3 import Web3
from web3.auto import w3 as w3help
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

# global variables
ethrpcApiUrl = ""
w3 = None
chainid = 5000
port = 8080
gas = 2000000
gas_price = 0

# opening abi files
with open("SecurityToken.abi/SecurityToken.abi", "r") as f:
    abi = f.read()
with open("SecurityToken.bin/SecurityToken.bin", "r") as f:
    bin = f.read()


# function to deploy contract address and distribute tokens among all senders
def deploy_contract(accts, priv_keys):
    # connecting to end point
    global w3
    w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl,
              request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    contract_deploy_status = False

    contract = w3.eth.contract(abi=abi, bytecode=bin)

    for i in range(len(accts)):
        accts[i] = w3.toChecksumAddress(accts[i])

    # main deploying account
    contract_deploy_account = accts[0]
    contract_deploy_account_key = priv_keys[0]

    # deploying contract
    construct_txn = contract.constructor("ERC20", "ERC20", 1000000000000).buildTransaction(
        {
            "from": contract_deploy_account,
            "gas": gas,
            "gasPrice": gas_price,
            "nonce": w3.eth.get_transaction_count(contract_deploy_account),
            "chainId": chainid,
        }
    )
    tx_hash = tx_signing(construct_txn, contract_deploy_account_key)
    print("smart contract deploy transaction hash successfully validated")
    # Validating transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("smart contract deploy transaction receipt: '{}'".format(tx_receipt))
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

    erc20_contract = w3.eth.contract(address=contractAddress, abi=abi)

    erc20_item_count = erc20_contract.functions.balanceOf(
        contract_deploy_account).call()
    print("Account {} has balance of {} tokens \n".format(
        contract_deploy_account, erc20_item_count))

    return contractAddress


def distribute_tokes(accts, priv_keys, contractAddress):
    # distributing tokens to all senders
    erc20_contract = w3.eth.contract(address=contractAddress, abi=abi)
    for i in range(1, len(accts)):
        construct_txn = erc20_contract.functions.transfer(accts[i], 10000000).buildTransaction({
            'from': accts[0],
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(accts[0]),
            'chainId': chainid
        })
        tx_hash = tx_signing(construct_txn, priv_keys[0])
        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        erc20_item_count = erc20_contract.functions.balanceOf(accts[i]).call()
        print("Account {} has balance of {} tokens \n".format(
            accts[i], erc20_item_count))


def tx_signing(construct_txn, acc_priv_key):
    signed_txn = w3.eth.account.sign_transaction(
        construct_txn, acc_priv_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "tx hash mismatch"
    return tx_hash


# function to run new ERC20 dapp instance
def run_erc20(priv_key, contract_address, i):
    # run erc20 app
    global port
    print("start "+str(port+i))
    if(share_contract):
        os.system("export TOKEN_CONTRACT_ADDRESS"+contract_address)

    mvn = "cd .. ; mvn spring-boot:run -Dspring-boot.run.arguments='--server.port=" + \
        str(port+i) + " --token.private-key=" + priv_key + "'"

    p = subprocess.Popen(mvn, shell=True, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()
    print(stderr)
    # print(stdout)
    if(not p.returncode):
        print("Dapp with port {} completed with status code {}".format(p.returncode, (port+i))) # is 0 if success


# reads reports of all runs and write to final-report.json
def aggregate_report(instance):
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
            for obj in txStatus_list:
                obj_kv = obj.split("=")
                aggregate_txStatus[obj_kv[0]] = aggregate_txStatus.get(obj_kv[0],0) + obj_kv[1]
            
            txErrors_list = data["txErrors"].split(",")
            for obj in txErrors_list:
                obj_kv = obj.split("=")
                aggregate_txErrors[obj_kv[0]] = aggregate_txErrors.get(obj_kv[0],0) + obj_kv[1]

            receiptStatus_list = data["receiptStatus"].split(",")
            for obj in receiptStatus_list:
                obj_kv = obj.split("=")
                aggregate_receiptStatus[obj_kv[0]] = aggregate_receiptStatus.get(obj_kv[0],0) + obj_kv[1]
            
            receiptErrors_list = data["receiptErrors"].split(",")
            for obj in receiptErrors_list:
                obj_kv = obj.split("=")
                aggregate_receiptErrors[obj_kv[0]] = aggregate_receiptErrors.get(obj_kv[0],0) + obj_kv[1]

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
    print(instance)

    global ethrpcApiUrl
    ethrpcApiUrl = os.getenv('WEB3J_ETHCLIENT_PROTOCOL', "http") + "://" + os.getenv(
        'WEB3J_ETHCLIENT_HOST', "localhost") + ":" + os.getenv('WEB3J_ETHCLIENT_PORT', "8545")
    print(ethrpcApiUrl)

    global share_contract
    share_contract = True if os.getenv(
        'SHARE_CONTRACT', "false") == "true" else False
    print(share_contract)

    accts = []
    priv_keys = []
    for i in range(instance+1):
        acct = w3help.eth.account.create('KEYSMASH FJAFJKLDSKF7JKFDJ 1530')
        accts.append(acct.address[2:].lower())
        priv_keys.append(acct.privateKey.hex()[2:].lower())

    print(accts)
    print(priv_keys)

    threads = []

    if(share_contract):
        contract_address = deploy_contract(accts, priv_keys)
        print("Contract Address -",contract_address)
        distribute_tokes(accts, priv_keys, contract_address)
        print("tokens distributed among senders")

        for i in range(1, len(accts)):
            t = threading.Thread(target=run_erc20, args=(
                priv_keys[i], contract_address, i))
            threads.append(t)
            t.start()
    else:
        for i in range(1, len(accts)):
            t = threading.Thread(
                target=run_erc20, args=(priv_keys[i], None, i))
            threads.append(t)
            t.start()

    for t in threads:
        t.join()

    aggregate_report(instance)


if __name__ == "__main__":
    main()
