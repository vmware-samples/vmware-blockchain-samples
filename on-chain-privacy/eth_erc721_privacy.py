import time
import urllib3
import logging
from web3 import Web3
from web3.middleware import geth_poa_middleware
urllib3.disable_warnings()

# CONTAINER_LIST = ["docker_ethrpc1_1", "docker_concord1_1", "docker_concord2_1", "docker_concord3_1", "docker_concord4_1", "docker_clientservice_1"]
ethrpcApiUrl = "http://localhost:8545"
w3 = None
chainid = 5000

# Validating whether ethereum blockchain is up or not
def test_eth_local_deployment():
    global w3
    w3 = Web3(Web3.HTTPProvider(ethrpcApiUrl, request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    global contract_deploy_account
    global contract_deploy_account_key
    contract_deploy_account = "f17f52151EbEF6C7334FAD080c5704D77216b732"
    contract_deploy_account = contract_deploy_account.lower()
    contract_deploy_account = w3.toChecksumAddress(contract_deploy_account)
    contract_deploy_account_key = "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"

    global account1
    global account1_key
    global account1_str
    account1_str = "fe3b557e8fb62b89f4916b721be55ceb828dbd73"
    account1_str = account1_str.lower()
    account1 = w3.toChecksumAddress(account1_str)
    account1_key = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"

    global account2
    global account2_key
    global account2_str
    account2_str = "627306090abaB3A6e1400e9345bC60c78a8BEf57"
    account2_str = account2_str.lower()
    account2 = w3.toChecksumAddress(account2_str)
    account2_key = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"

    global gas
    global gas_price
    gas = 2000000
    gas_price = 0

    global abi1
    with open("/var/jenkins/workspace/vmwathena_blockchain/hermes/ethereum/contracts/SupplyChainItemPrivacy.abi/SupplyChainItem.abi", "r") as f:
        abi1 = f.read()
    global bin1
    with open("/var/jenkins/workspace/vmwathena_blockchain/hermes/ethereum/contracts/SupplyChainItemPrivacy.bin/SupplyChainItem.bin", "r") as f:
        bin1 = f.read()

def test_erc721_contract_deploy():
    contract_deploy_status = False

    contract = w3.eth.contract(abi=abi1, bytecode=bin1)

    #
    # Submit the transaction that deploys the nft contract
    #
    construct_txn = contract.constructor().buildTransaction(
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

    global contractAddress
    contractAddress = tx_receipt.contractAddress

    nft_contract = w3.eth.contract(address=contractAddress, abi=abi1)

    #
    # transaction submssion in a loop
    # i=1 give permissions to account1 for nft_contract
    # i=2 give permissions to account2 for nft_contract
    #
    for i in range(1, 3, 1):
        logging.info("account permissioning for nft_contract")

        if (i == 1):
            accountx = account1
        elif (i == 2):
            accountx = account2

        construct_txn = nft_contract.functions.addPerm(accountx).buildTransaction({
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


def test_erc721_asset_transfer():
    nft_item_id1 = 0
    nft_item_id2 = 0

    nft_contract = w3.eth.contract(address=contractAddress, abi=abi1)

    #
    # transaction submssion in a loop
    # i=1 Submit the transaction that creates an nft item 1) for account1
    # i=2 Submit the transaction that creates an nft item 2) for account1
    #
    for i in range(1, 3, 1):
        logging.info("new nft_item for account1")

        construct_txn = nft_contract.functions.newItem(account1).buildTransaction({
            'from': account1,
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(account1),
            'chainId': chainid
        })
        signed_txn = w3.eth.account.sign_transaction(construct_txn, account1_key)

        # Validating transaction hash
        tx_hash_send = signed_txn.hash
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        assert tx_hash_send == tx_hash, "tx hash mismatch"

        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        logging.debug("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        # https://stackoverflow.com/questions/67803090/how-to-get-erc-721-tokenid
        if (i == 1):
            nft_item_id1 = int(tx_receipt['logs'][0]['topics'][3].hex(), 16)
            logging.info("new nft_item_id account1: {}".format(nft_item_id1))
        elif (i == 2):
            nft_item_id2 = int(tx_receipt['logs'][0]['topics'][3].hex(), 16)
            logging.info("new nft_item_id account1: {}".format(nft_item_id2))

        nft_item_count = nft_contract.functions.balanceOf(account1).call()
        logging.info("nft_item_count account1: {} \n".format(nft_item_count))

    num_repeats = 1
    start_time = [None] * num_repeats
    end_time = [None] * num_repeats
    num_account_transfers = 2
    for j in range(0, num_repeats, 1):
        start_time[j] = time.time()
        #
        # i is odd, Submit the transaction that transfers nft item 1) from account1 to account2
        # i is even, Submit the transaction that transfers nft item 1) from account2 to account1
        #
        for i in range(1, num_account_transfers + 1, 1):
            if (i % 2 == 1):
                construct_txn = nft_contract.functions.transferFrom(account1, account2, nft_item_id1).buildTransaction({
                    'from': account1,
                    'gas': gas,
                    'gasPrice': gas_price,
                    'nonce': w3.eth.get_transaction_count(account1),
                    'chainId': chainid
                })
                signed_txn = w3.eth.account.sign_transaction(construct_txn, account1_key)
                tx_hash_send = signed_txn.hash
                tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            else:
                construct_txn = nft_contract.functions.transferFrom(account2, account1, nft_item_id1).buildTransaction({
                    'from': account2,
                    'gas': gas,
                    'gasPrice': gas_price,
                    'nonce': w3.eth.get_transaction_count(account2),
                    'chainId': chainid
                })
                signed_txn = w3.eth.account.sign_transaction(construct_txn, account2_key)
                tx_hash_send = signed_txn.hash
                tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

            # Validating transaction hash
            assert tx_hash_send == tx_hash, "tx hash mismatch"

            # Validating transaction receipt
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            logging.debug("transaction receipt: '{}'".format(tx_receipt))
            assert tx_receipt.status == 1, "transaction failed"

            logging.info("nft transfer loop index: {}".format(i))

            nft_item_count = nft_contract.functions.balanceOf(account1).call()
            logging.info("nft_item_count account1: {}".format(nft_item_count))
            nft_item_count = nft_contract.functions.balanceOf(account2).call()
            logging.info("nft_item_count account2: {}".format(nft_item_count))

            if (i % 2 == 1):
                account_log = tx_receipt['logs'][1]['topics'][1].hex()
                ret = account_log.find(account1_str)
                assert ret != -1, "NFT transfer log mismatch account1"

                account_log = tx_receipt['logs'][1]['topics'][2].hex()
                ret = account_log.find(account2_str)
                assert ret != -1, "NFT transfer log mismatch account2"

                nft_item_id1_log = int(tx_receipt['logs'][1]['topics'][3].hex(), 16)
                logging.info("nft_item_id transferred from account1 to account2: {}\n".format(nft_item_id1_log))
                assert nft_item_id1_log == nft_item_id1, "NFT transfer log mismatch id"
            else:
                account_log = tx_receipt['logs'][1]['topics'][1].hex()
                ret = account_log.find(account2_str)
                assert ret != -1, "NFT transfer log mismatch account2"

                account_log = tx_receipt['logs'][1]['topics'][2].hex()
                ret = account_log.find(account1_str)
                assert ret != -1, "NFT transfer log mismatch account1"

                nft_item_id1_log = int(tx_receipt['logs'][1]['topics'][3].hex(), 16)
                logging.info("nft_item_id transferred from account2 to account1: {}\n".format(nft_item_id1_log))
                assert nft_item_id1_log == nft_item_id1, "NFT transfer log mismatch id"

        end_time[j] = time.time()
        # time.sleep(1)

    avg_time = 0
    for j in range(0, num_repeats, 1):
        time1 = end_time[j] - start_time[j]
        avg_time += time1
    avg_time = avg_time / num_repeats

    logging.info("average time taken for {} account transfers {} seconds".format(num_account_transfers, avg_time))
    tx_rate = num_account_transfers / avg_time
    logging.info("average transactions per second {}\n".format(tx_rate))

    # typical time taken for 10 account transfers on a hermes nimbus vm with 4 vCPUs, 16GB RAM is 1.5s
    # jenkins node with 16 vCPUs, 32GB RAM is faster than hermes nimbus VM
    assert tx_rate >= 1, "NFT account transfer taking too long"

    logging.info("Test completed successfully")
