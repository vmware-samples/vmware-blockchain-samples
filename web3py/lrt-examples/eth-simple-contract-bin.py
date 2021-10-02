#/*
# * Copyright 2021 VMware, all rights reserved.
# * This software is released under MIT license.
# * The full license information can be found in LICENSE in the root directory of this project.
# */
#Signed-off-by: ramki krishnan <ramkik@vmware.com>

import json

from web3 import Web3
from web3.middleware import geth_poa_middleware
import time
import urllib3
from hexbytes import HexBytes
urllib3.disable_warnings()

contract_interface = {
    "abi": '[{"constant":false,"inputs":[{"name":"x","type":"int256"}],"name":"decrementCounter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"int256"}],"name":"incrementCounter","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]',
    "bin": "60806040526000805560e7806100166000396000f30060806040526004361060525763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663645962108114605a5780639867b4aa146071578063a87d942c14607a575b6103e8600055005b348015606557600080fd5b50606f600435609e565b005b606f60043560aa565b348015608557600080fd5b50608c60b5565b60408051918252519081900360200190f35b60008054919091039055565b600080549091019055565b600054905600a165627a7a72305820388f79153f456193bb5fb284fa52a73de823a1add68bbf8bf11023fc527ad60d0029",
}

expectedCount = 0

account1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
key1 = '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'

vmware = 1
if (vmware):
    #vmware
    chainid = 5000
    w3 = Web3(Web3.HTTPProvider('https://10.186.48.100:8545', request_kwargs={'verify': False}))
else:
    #besu
    chainid = 2018
    w3 = Web3(Web3.HTTPProvider('http://54.241.133.23:32000')) #besu multi cluster

w3.middleware_onion.inject(geth_poa_middleware, layer=0)

contract = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])

# Submit the transaction that deploys the contract
nonce = w3.eth.getTransactionCount(account1)
construct_txn = contract.constructor().buildTransaction({
    'from': account1,
    'gas': 2000000,
    #'gasPrice': 234567897654321,
    'gasPrice': 0,
    'nonce': nonce,
    'chainId': chainid
})
signed_txn = w3.eth.account.sign_transaction(construct_txn, key1)
tx_hash_send = signed_txn.hash
tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
if (tx_hash_send != tx_hash):
    print("hash mismatch") #log error
    assert(tx_hash_send == tx_hash)
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
print("contract deploy transaction receipt:", tx_receipt) #log debug
if (tx_receipt.status == 1):
    print("contract deploy success, contract address:", tx_receipt.contractAddress) #log debug
else:
    print("contract deploy failed") #log error
    assert(tx_receipt.status == 1)

counter = w3.eth.contract(address=tx_receipt.contractAddress, abi=contract_interface['abi'])
count = counter.functions.getCount().call()
print("contract count:", count) #log debug
assert(count == expectedCount)
