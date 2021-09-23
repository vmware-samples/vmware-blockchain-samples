import sys
import time
import urllib3
import logging
from web3 import Web3
from web3.middleware import geth_poa_middleware
urllib3.disable_warnings()

ethrpcApiUrl = "http://localhost:8545"
w3 = None
chainid = 5000
contract_deploy = True
contract1_use = True
contract2_use = True
account_perm_test = False
contract1_address = ""
contract2_address = ""
logging.basicConfig(level = logging.INFO)
log = logging.getLogger("logger")

def main():
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

    global account3
    global account3_key
    global account3_str
    account3_str = "0x5ce9454909639D2D17A3F753ce7d93fa0b9aB12E"
    account3_str = account3_str.lower()
    account3 = w3.toChecksumAddress(account3_str)
    account3_key = "b25c7db31feed9122727bf0939dc769a96564b2de4c4726d035b36ecf1e5b364"

    global gas
    global gas_price
    gas = 2000000
    gas_price = 0

    global abi1
    with open("/var/jenkins/workspace/vmware-blockchain-samples/on-chain-privacy/contracts/SupplyChainItemPrivacy.abi/SupplyChainItem.abi", "r") as f:
        abi1 = f.read()
    global bin1
    with open("/var/jenkins/workspace/vmware-blockchain-samples/on-chain-privacy/contracts/SupplyChainItemPrivacy.bin/SupplyChainItem.bin", "r") as f:
        bin1 = f.read()

    if (contract_deploy):
        erc721_contract_deploy()

    if (contract1_use):
        erc721_asset_transfer(contract1_address, account1, account2)

    if (contract2_use):
        erc721_asset_transfer(contract2_address, account1, account3)

    if (account_perm_test):
        erc721_account_perm_test(contract1_address)

def erc721_contract_deploy():
    #
    # i=1 deploy nft_contract 1
    # i=2 deploy nft_contract 2
    #
    for i in range(1, 3, 1):
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
        log.debug("smart contract deploy transaction hash successfully validated")

        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        log.debug("smart contract deploy transaction receipt:'{}'".format(tx_receipt))
        if tx_receipt.status == 1:
            log.info(
                "smart contract deploy success, contract address:'{}'".format(
                    tx_receipt.contractAddress
                )
            )
            contract_deploy_status = True
        else:
            assert contract_deploy_status, "smart contract deploy failed"

        if (i == 1):
            global contract1_address
            contract1_address = tx_receipt.contractAddress
        elif (i == 2):
            global contract2_address
            contract2_address = tx_receipt.contractAddress

    #
    # i=1 use nft_contract 1
    # i=2 use nft_contract 2
    #
    for i in range(1, 3, 1):

        if (i == 1):
            contract_address = contract1_address
        elif (i == 2):
            contract_address = contract2_address

        nft_contract = w3.eth.contract(address=contract_address, abi=abi1)

        #
        # j=1 give permissions to account1 for nft_contract
        # j=2 give permissions to account2 or account3 for nft_contract
        #
        for j in range(1, 3, 1):

            if (j == 1):
                accountx = account1
            elif (j == 2):
                if (i == 1):
                    accountx = account2
                elif (i == 2):
                    accountx = account3

            log.info("account permissioning for account:'{}' nft_contract:'{}'\n".format(accountx, contract_address))

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
            log.debug("transaction receipt: '{}'".format(tx_receipt))
            assert tx_receipt.status == 1, "transaction failed"


def erc721_asset_transfer(contract_address, accountx, accounty):
    nft_item_id1 = 0
    nft_item_id2 = 0
    accountx_key = ""
    accounty_key = ""
    accountx_str = ""
    accounty_str = ""

    nft_contract = w3.eth.contract(address=contract_address, abi=abi1)

    log.info("### nft_smart_contract:'{}' ###".format(contract_address))

    #
    # transaction submssion in a loop
    # i=1 Submit the transaction that creates an nft item 1) for accountx
    # i=2 Submit the transaction that creates an nft item 2) for accountx
    #
    for i in range(1, 3, 1):
        log.info("new nft_item for accountx: '{}'".format(accountx))

        construct_txn = nft_contract.functions.newItem(accountx).buildTransaction({
            'from': accountx,
            'gas': gas,
            'gasPrice': gas_price,
            'nonce': w3.eth.get_transaction_count(accountx),
            'chainId': chainid
        })
        if (accountx == account1):
            accountx_key = account1_key
        elif (accountx == account2):
            accountx_key = account2_key
        elif (accountx == account3):
            accountx_key = account3_key
        signed_txn = w3.eth.account.sign_transaction(construct_txn, accountx_key)

        # Validating transaction hash
        tx_hash_send = signed_txn.hash
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        assert tx_hash_send == tx_hash, "tx hash mismatch"

        # Validating transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        log.debug("transaction receipt: '{}'".format(tx_receipt))
        assert tx_receipt.status == 1, "transaction failed"

        # https://stackoverflow.com/questions/67803090/how-to-get-erc-721-tokenid
        if (i == 1):
            nft_item_id1 = int(tx_receipt['logs'][0]['topics'][3].hex(), 16)
            log.info("new nft_item_id accountx: {}".format(nft_item_id1))
        elif (i == 2):
            nft_item_id2 = int(tx_receipt['logs'][0]['topics'][3].hex(), 16)
            log.info("new nft_item_id accountx: {}".format(nft_item_id2))

        nft_item_count = nft_contract.functions.balanceOf(accountx).call()
        log.info("nft_item_count accountx: {} \n".format(nft_item_count))

    num_repeats = 1
    start_time = [None] * num_repeats
    end_time = [None] * num_repeats
    num_account_transfers = 2
    for j in range(0, num_repeats, 1):
        start_time[j] = time.time()
        #
        # i is odd, Submit the transaction that transfers nft item 1) from accountx to accounty
        # i is even, Submit the transaction that transfers nft item 1) from accounty to accountx
        #
        for i in range(1, num_account_transfers + 1, 1):
            if (i % 2 == 1):
                construct_txn = nft_contract.functions.transferFrom(accountx, accounty, nft_item_id1).buildTransaction({
                    'from': accountx,
                    'gas': gas,
                    'gasPrice': gas_price,
                    'nonce': w3.eth.get_transaction_count(accountx),
                    'chainId': chainid
                })
                if (accountx == account1):
                    accountx_key = account1_key
                signed_txn = w3.eth.account.sign_transaction(construct_txn, accountx_key)
                tx_hash_send = signed_txn.hash
                tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            else:
                construct_txn = nft_contract.functions.transferFrom(accounty, accountx, nft_item_id1).buildTransaction({
                    'from': accounty,
                    'gas': gas,
                    'gasPrice': gas_price,
                    'nonce': w3.eth.get_transaction_count(accounty),
                    'chainId': chainid
                })
                if (accounty == account2):
                    accounty_key = account2_key
                elif (accounty == account3):
                    accounty_key = account3_key
                signed_txn = w3.eth.account.sign_transaction(construct_txn, accounty_key)
                tx_hash_send = signed_txn.hash
                tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

            # Validating transaction hash
            assert tx_hash_send == tx_hash, "tx hash mismatch"

            # Validating transaction receipt
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            log.debug("transaction receipt: '{}'".format(tx_receipt))
            assert tx_receipt.status == 1, "transaction failed"

            log.info("nft transfer loop index: {}".format(i))

            nft_item_count = nft_contract.functions.balanceOf(accountx).call()
            log.info("nft_item_count accountx: {}".format(nft_item_count))
            nft_item_count = nft_contract.functions.balanceOf(accounty).call()
            log.info("nft_item_count accounty: {}".format(nft_item_count))

            if (i % 2 == 1):
                account_log = tx_receipt['logs'][1]['topics'][1].hex()
                ret = account_log.find(accountx_str)
                assert ret != -1, "NFT transfer log mismatch accountx"

                account_log = tx_receipt['logs'][1]['topics'][2].hex()
                ret = account_log.find(accounty_str)
                assert ret != -1, "NFT transfer log mismatch accounty"

                nft_item_id1_log = int(tx_receipt['logs'][1]['topics'][3].hex(), 16)
                log.info("nft_item_id transferred from accountx to accounty: {}\n".format(nft_item_id1_log))
                assert nft_item_id1_log == nft_item_id1, "NFT transfer log mismatch id"
            else:
                account_log = tx_receipt['logs'][1]['topics'][1].hex()
                ret = account_log.find(accounty_str)
                assert ret != -1, "NFT transfer log mismatch accounty"

                account_log = tx_receipt['logs'][1]['topics'][2].hex()
                ret = account_log.find(accountx_str)
                assert ret != -1, "NFT transfer log mismatch accountx"

                nft_item_id1_log = int(tx_receipt['logs'][1]['topics'][3].hex(), 16)
                log.info("nft_item_id transferred from accounty to accountx: {}\n".format(nft_item_id1_log))
                assert nft_item_id1_log == nft_item_id1, "NFT transfer log mismatch id"

        end_time[j] = time.time()
        # time.sleep(1)

    avg_time = 0
    for j in range(0, num_repeats, 1):
        time1 = end_time[j] - start_time[j]
        avg_time += time1
    avg_time = avg_time / num_repeats

    #log.info("average time taken for {} account transfers {} seconds".format(num_account_transfers, avg_time))
    #tx_rate = num_account_transfers / avg_time
    #log.info("average transactions per second {}\n".format(tx_rate))

    # typical time taken for 10 account transfers on a hermes nimbus vm with 4 vCPUs, 16GB RAM is 1.5s
    # jenkins node with 16 vCPUs, 32GB RAM is faster than hermes nimbus VM
    #assert tx_rate >= 1, "NFT account transfer taking too long"

if __name__ == "__main__":
    #print(f"Arguments count: {len(sys.argv)}")
    for i, arg in enumerate(sys.argv):
        #print(f"Argument {i:>6}: {arg}")
        if (arg == "--contract_deploy"):
            contract_deploy = True 
            contract1_use = False
            contract2_use = False
            account_perm_test = False
        elif (arg == "--contract1_use"):
            contract_deploy = False
            contract1_use = True
            contract2_use = False
            account_perm_test = False
            contract1_address = sys.argv[i + 1]
        elif (arg == "--contract2_use"):
            contract_deploy = False
            contract1_use = False
            contract2_use = True
            account_perm_test = False
            contract2_address = sys.argv[i + 1]
        elif (arg == "--account_perm_test"):
            contract_deploy = False
            contract1_use = False
            contract2_use = False
            account_perm_test = True
            contract1_address = sys.argv[i + 1]

def erc721_account_perm_test(contract_address):
    erc721_asset_transfer(contract_address, account3, account1)

# call main
main()
