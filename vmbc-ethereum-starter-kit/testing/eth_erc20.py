import sys

import urllib3
from web3 import Web3
from web3.middleware import geth_poa_middleware
import logging 

#logging.basicConfig(filename='erc20.log', encoding='utf-8', level=logging.DEBUG)
urllib3.disable_warnings()


# CONTAINER_LIST = ["docker_ethrpc1_1", "docker_concord1_1", "docker_concord2_1", "docker_concord3_1", "docker_concord4_1", "docker_clientservice_1"]
ethrpcApiUrl = ""
w3 = None
chainid = 5000
ethrpcApiUrl =  'http://ethrpc1.vmbc-client1.svc.cluster.local:8545'
w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl, request_kwargs={"verify": False}))

#ethrpcApiUrl =  'https://ethrpc1.vmbc-client1.svc.cluster.local:8545'
#w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl, request_kwargs={"verify": "ethrpc.cert"}))

# Test isConnected ?
def test_isConnected():
    conn = w3.isConnected()
    logging.debug("Blockchain is connected? {}".format(conn))

# Test the latest block
def test_latestBlock():
    block = w3.eth.get_block('latest')
    logging.debug("Latest Block is {}".format(block))


# Test all erc-20 token transfers
def test_erc20():
    
    contract_deploy_status = False
    gas = 2000000
    gas_price = 0

    with open("./SecurityToken.abi", "r") as f:
        abi1 = f.read()
    with open("./SecurityToken.bin", "r") as f:
        bin1 = f.read()
    contract = w3.eth.contract(abi=abi1, bytecode=bin1)

    contract_deploy_account = "f17f52151EbEF6C7334FAD080c5704D77216b732"
    contract_deploy_account = contract_deploy_account.lower()
    contract_deploy_account = w3.toChecksumAddress(contract_deploy_account)
    contract_deploy_account_key = "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"

    account1_str = "fe3b557e8fb62b89f4916b721be55ceb828dbd73"
    account1_str = account1_str.lower()
    account1 = w3.toChecksumAddress(account1_str)
    account1_key = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"

    account2_str = "627306090abaB3A6e1400e9345bC60c78a8BEf57"
    account2_str = account2_str.lower()
    account2 = w3.toChecksumAddress(account2_str)
    account2_key = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"

    account3_str = "60C765505A20e45794fC3aa6Fb8c8C09c3bE261A"
    account3_str = account3_str.lower()
    account3 = w3.toChecksumAddress(account3_str)
    # account3_key = "3a2f5f35ec0e2c4189abdcf56315baf5c0699ff771efa18f14785ac8712a9d7f"

    account4_str = "C0B3CEDfc1505d391524e9C7d37542eb1CBBe270"
    account4_str = account4_str.lower()
    account4 = w3.toChecksumAddress(account4_str)
    # account4_key = "211a089a341c8b8d9e2e2e57bfb15d224021fed5dd90bbbcc887ca1822d4b8ef"

    #
    # Submit the transaction that deploys the nft contract
    #
    construct_txn = contract.constructor("ERC20", "ERC20", 1000000000000).buildTransaction(
        {
            "from": contract_deploy_account,
            "gas": gas,
            "gasPrice": gas_price,
            "nonce": w3.eth.get_transaction_count(contract_deploy_account),
            "chainId": chainid,
        }
    )
    signed_txn = w3.eth.account.sign_transaction(construct_txn, contract_deploy_account_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "smart contract deploy transaction hash mismatch error"
    logging.debug("smart contract deploy transaction hash successfully validated")
    # Validating transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    logging.debug("smart contract deploy transaction receipt: '{}'".format(tx_receipt))
    if tx_receipt.status == 1:
        logging.info(
            "smart contract deploy success, contract address: '{}'".format(
                tx_receipt.contractAddress
            )
        )
        contract_deploy_status = True
    else:
        assert contract_deploy_status, "smart contract deploy failed"

    contractAddress = tx_receipt.contractAddress

    erc20_contract = w3.eth.contract(address=contractAddress, abi=abi1)

    erc20_item_count = erc20_contract.functions.balanceOf(contract_deploy_account).call()
    logging.info("erc20_item_count account: {} {} \n".format(contract_deploy_account, erc20_item_count))

    #
    # transaction submssion in a loop
    # i=1 Submit the transaction that creates an erc20 item 1) for account1
    # i=2 Submit the transaction that creates an erc20 item 2) for account2
    #
    for i in range(1, 3, 1):
        if (i == 1):
            accnt = account1
            accnt_key = account1_key
            accnt_t = account3
        elif (i == 2):
            accnt = account2
            accnt_key = account2_key
            accnt_t = account4

        construct_txn = erc20_contract.functions.transfer(accnt, 1000000).buildTransaction({
            'from': contract_deploy_account,
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(contract_deploy_account),
            'chainId': chainid
        })
        signed_txn = w3.eth.account.sign_transaction(construct_txn, contract_deploy_account_key)
        # Validating transaction hash
        tx_hash_send = signed_txn.hash
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        assert tx_hash_send == tx_hash, "tx hash mismatch"
        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        logging.debug("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        erc20_item_count = erc20_contract.functions.balanceOf(accnt).call()
        logging.info("erc20_item_count account: {} {} \n".format(accnt, erc20_item_count))

        construct_txn = erc20_contract.functions.transfer(accnt_t, 1000).buildTransaction({
            'from': accnt,
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(accnt),
            'chainId': chainid
        })
        signed_txn = w3.eth.account.sign_transaction(construct_txn, accnt_key)

        # Validating transaction hash
        tx_hash_send = signed_txn.hash
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        assert tx_hash_send == tx_hash, "tx hash mismatch"

        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        logging.debug("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        erc20_item_count = erc20_contract.functions.balanceOf(accnt).call()
        logging.info("erc20_item_count account: {} {} \n".format(accnt, erc20_item_count))
        erc20_item_count = erc20_contract.functions.balanceOf(accnt_t).call()
        logging.info("erc20_item_count account: {} {} \n".format(accnt_t, erc20_item_count))

    logging.info("Test completed successfully")
