import os
import urllib3
from solcx import compile_files, install_solc
from web3 import Web3
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

w3 = None
abi = None
bytecode = None


def compile_contract():
    install_solc("0.7.6")
    global abi, bytecode
    compiled_sol = compile_files(["./contracts_v3core/UniswapV3Factory.sol"], solc_version='0.7.6', optimize=True)
    print("compiled sources ")
    bytecode = compiled_sol['./contracts_v3core/UniswapV3Factory.sol:UniswapV3Factory']['bin']
    abi = compiled_sol['./contracts_v3core/UniswapV3Factory.sol:UniswapV3Factory']['abi']


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


def deploy_contract(contract_deploy_account, contract_deploy_account_key, host, port, protocol):
    # connecting to end point
    if protocol == "grpc":
        port = "8545"
    url = "http://" + host + ":" + port
    compile_contract()
    global w3
    w3 = Web3(Web3.HTTPProvider(url,
                                request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # deploying contract
    construct_txn = contract.constructor().buildTransaction(
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
    return contract_address


def main():
    priv_addr = "0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8"
    priv_key = "5094f257d3462083bcbc02c61d98c038cfa71cdd497834c5f38cd75010ddb7a5"
    host = os.environ['HOST']
    port = os.getenv('PORT', 8545)
    protocol = os.getenv('PROTOCOL', "http")
    contract_addr = deploy_contract(priv_addr, priv_key, host, port, protocol)
    print("contract addr = ", contract_addr)


if __name__ == "__main__":
    main()
