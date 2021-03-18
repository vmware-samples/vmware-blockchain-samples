from web3 import Web3
from solcx import compile_source
from web3.middleware import geth_poa_middleware

def compile_source_file(file_path):
    with open(file_path, 'r') as f:
        source = f.read()

    return compile_source(source)

#https://vmbc.vdp-stg.vmware.com/ed467910-cd69-48a4-9cb0-719340b4513a/dashboard
#eth-ramki4
# HTTPProvider:
w3 = Web3(Web3.HTTPProvider('http://10.40.205.171:8545'))
# w3 = Web3(Web3.HTTPProvider('https://localhost:8545'))
#w3.middleware_onion.inject(geth_poa_middleware, layer=0)

#block = w3.eth.getBlock('latest')
#print(block)

compiled_sol = compile_source_file('SecurityToken.sol')
contract_id, contract_interface = compiled_sol.popitem()

key1 = '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
account1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
#account1 = w3.eth.account.create('accnt1')
account2 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
#account2 = w3.eth.account.create('accnt2')

contract_= w3.eth.contract( abi=contract_interface['abi'], bytecode=contract_interface['bin'])
construct_txn = contract_.constructor("aa", "aa", 100000000).buildTransaction({
#construct_txn = contract_.constructor().buildTransaction({
    'from': account1,
    'gas': 2000000,
    'gasPrice': 234567897654321,
    'nonce': w3.eth.getTransactionCount(account1),
    'chainId': 1
})
signed_txn = w3.eth.account.sign_transaction(construct_txn, key1)
txn_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
#construct_txn = contract_.constructor().buildTransaction({
#    'from': account1,
#    'gas': 2000000,
#    'gasPrice': 234567897654321,
#    'nonce': w3.eth.getTransactionCount(account1)
#})
#txn_hash = w3.eth.sendTransaction(construct_txn)
print("*** txn_hash contract")
print(txn_hash)
print("*** getTransactionReceipt contract")
txn_receipt = w3.eth.waitForTransactionReceipt(txn_hash)
print(txn_receipt)
print("*** getBlock contract")
block = w3.eth.getBlock(txn_receipt.blockNumber)
print(block)
print(txn_receipt.get('contractAddress'))
print(contract_interface)
erc20 = w3.eth.contract( abi=contract_interface['abi'], address=txn_receipt.get('contractAddress'))
print(dir(erc20.functions))
erc20.functions.transfer('0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8', 100000)

transaction = {
    'from': account1,
    'to': account2,
    'value': 1000000000,
    'gas': 2000000,
    'gasPrice': 234567897654321,
    'nonce': w3.eth.getTransactionCount(account1)
}
signed = w3.eth.account.sign_transaction(transaction, key1)
txn_hash = w3.eth.sendRawTransaction(signed.rawTransaction)
print("*** txn_hash")
print(txn_hash)
w3.eth.waitForTransactionReceipt(txn_hash)
print("*** getTransactionReceipt")
receipt = w3.eth.getTransactionReceipt(txn_hash)
print(receipt)
print("*** getBlock")
block1 = w3.eth.getBlock(receipt.blockNumber)
print(block1)

print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
#txn_hash1 = 0x6a426a1807c3e7f4ff31c7b458f7b9391a401ad927490c2bf5095773f0dfa165
#receipt1 = w3.eth.getTransactionReceipt(txn_hash1)
#print(receipt1)
#data = w3.eth.getTransaction(txn_hash1)
#print(data)
#print("*** getTransactionReceipt block number")
#print(receipt.blockNumber)
#print("*** getBlock")
#block = w3.eth.getBlock(receipt.blockNumber)
#print(block)

#print(w3.eth.getBalance(account1))
#print(w3.eth.getBalance(account2))

#print(w3.eth.getCode(account1))
#print(w3.eth.getStorageAt(account1, 0))

#Viewing account balances (:meth:`get_balance <web3.eth.Eth.get_balance>`), transactions (:meth:`getTransaction <web3.eth.Eth.getTransaction>`),

def test_eth_getBalance(fxLocalSetup):
    addrFrom = "0x262c0d7ab5ffd4ede2199f6ea793f819e1abb019"
    addrTo = "0x5bb088f57365907b1840e45984cae028a82af934"
    transferAmount = 1

    previousBlockNumber = fxLocalSetup.eth.getBlockNumber()
    # data has to be set as None for transferring-fund kind of transaction
    txResult = fxLocalSetup.eth.sendTransaction(addrFrom,
                                                data=None,
                                                to=addrTo,
                                                value=hex(transferAmount))

    currentBlockNumber = fxLocalSetup.eth.getBlockNumber()
    addrFromBalance = int(fxLocalSetup.eth.getBalance(
        addrFrom, previousBlockNumber), 16)
    addrToBalance = int(fxLocalSetup.eth.getBalance(
        addrTo, previousBlockNumber), 16)
    expectedAddrFromBalance = addrFromBalance - transferAmount
    expectedAddrToBalance = addrToBalance + transferAmount

    assert txResult, "Transaction was not accepted"

    if not fxLocalSetup.productMode:
        log.warn("No verification done in ethereum mode")
    else:
        tx = fxLocalSetup.request.getTransaction(
            fxLocalSetup.blockchainId, txResult)
        assert tx, "No transaction receipt found"

        # This is the important one: it tells whether signature address
        # recovery works.
        assert tx["from"] == addrFrom, "Found from does not match expected from"

        # The rest of these are just checking parsing.
        assert tx["to"] == addrTo, "Found to does not match expectd to"
        assert tx["value"] == hex(
            transferAmount), "Found value does not match expected value"
        assert expectedAddrFromBalance == int(
            fxLocalSetup.eth.getBalance(addrFrom, currentBlockNumber),
            16), "sender balance does not match expected value"
        assert expectedAddrToBalance == int(
            fxLocalSetup.eth.getBalance(addrTo, currentBlockNumber),
            16), "receiver balance does not match expected value"

#test_eth_getBalance(w3)
