import os
import urllib3
import time
import threading
import subprocess
from web3 import Web3
from web3.auto import w3 as w3help
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

# global variables
ethrpcApiUrl = ""
w3 = None
chainid = 5000

# function to deploy contract address and distribute tokens among all senders
def deploy_contract(accts, priv_keys):

    # connecting to end point
    global w3
    w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl,
              request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    contract_deploy_status = False
    gas = 2000000
    gas_price = 0

    # opening abi files
    with open("SecurityToken.abi/SecurityToken.abi", "r") as f:
        abi1 = f.read()
    with open("SecurityToken.bin/SecurityToken.bin", "r") as f:
        bin1 = f.read()
    contract = w3.eth.contract(abi=abi1, bytecode=bin1)

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
    signed_txn = w3.eth.account.sign_transaction(
        construct_txn, contract_deploy_account_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "smart contract deploy transaction hash mismatch error"
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

    erc20_contract = w3.eth.contract(address=contractAddress, abi=abi1)

    erc20_item_count = erc20_contract.functions.balanceOf(
        contract_deploy_account).call()
    print("erc20_item_count account: {} {} \n".format(
        contract_deploy_account, erc20_item_count))

    
    # distributing tokens to all senders
    for i in range(1, len(accts)):
        construct_txn = erc20_contract.functions.transfer(accts[i], 10000000).buildTransaction({
            'from': contract_deploy_account,
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(contract_deploy_account),
            'chainId': chainid
        })
        signed_txn = w3.eth.account.sign_transaction(
            construct_txn, contract_deploy_account_key)
        # Validating transaction hash
        tx_hash_send = signed_txn.hash
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        assert tx_hash_send == tx_hash, "tx hash mismatch"
        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        erc20_item_count = erc20_contract.functions.balanceOf(accts[i]).call()
        print("erc20_item_count account: {} {} \n".format(
            accts[i], erc20_item_count))

    return contractAddress


def run_erc20(priv_key, contract_address):
    #run erc20 app
    print("start "+priv_key)
    mvn="cd .. ; mvn clean install"
    p = subprocess.Popen(mvn, shell=True, stdout = subprocess.PIPE)
    stdout, stderr = p.communicate()
    print(p.returncode) # is 0 if success
    print(stderr)
    print(priv_key+" completed")
        

def main():
    # parser = argparse.ArgumentParser()
    # parser.add_argument("-i", "--instances")
    # parser.add_argument("-u", "--url")
    # args = parser.parse_args()

    # if args.instances:
    #     instance = int(args.instances)
    #     print(instance)

    instance = int(os.getenv('DAPP_INSTANCES', 1))
    print(instance)

    global ethrpcApiUrl
    ethrpcApiUrl = os.getenv('WEB3J_ETHCLIENT_PROTOCOL', "http") + "://" + os.getenv(
        'WEB3J_ETHCLIENT_HOST', "localhost") + ":" + os.getenv('WEB3J_ETHCLIENT_PORT', "8545")
    print(ethrpcApiUrl)

    global share_contract
    share_contract = True if os.getenv('SHARE_CONTRACT', "false") == "true" else False
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
        print(contract_address)
        for i in range(1,len(accts)):
            run_erc20(priv_keys[i], contract_address)
    
    else:
        for i in range(1,len(accts)):
            t = threading.Thread(target=run_erc20, args=(priv_keys[i], None))
            threads.append(t)
            t.start()
        
            
    for t in threads:
        t.join()
        
    




if __name__ == "__main__":
    main()
