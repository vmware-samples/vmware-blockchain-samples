#/*
# * Copyright 2021 VMware, all rights reserved.
# * This software is released under MIT license.
# * The full license information can be found in LICENSE in the root directory of this project.
# */
#Signed-off-by: John Doe <john.doe@email.org>

import json

from web3 import Web3
from solcx import compile_standard
from web3.middleware import geth_poa_middleware
import time
import urllib3
from hexbytes import HexBytes
urllib3.disable_warnings()

# Solidity source code
compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {
        "Greeter.sol": {
            "content": '''
//                pragma solidity ^0.5.0;

                contract Greeter {
                  string public greeting;

                  constructor() public {
                      greeting = 'Hello';
                  }

                  function setGreeting(string memory _greeting) public {
                      greeting = _greeting;
                  }

                  function greet() view public returns (string memory) {
                      return greeting;
                  }
                }
              '''
        }
    },
    "settings":
        {
            "outputSelection": {
                "*": {
                    "*": [
                        "metadata", "evm.bytecode"
                        , "evm.bytecode.sourceMap"
                    ]
                }
            }
        }
})

account1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
key1 = '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'

vmware = 1
vmware_prod_deploy = 0
chainid = 1
total_tx_count = 1000

# web3.py instance
#w3 = Web3(Web3.EthereumTesterProvider())
if (vmware == 1):
    #w3 = Web3(Web3.HTTPProvider("http://54.160.229.176:8545"))
    if (vmware_prod_deploy == 0):
        #w3 = Web3(Web3.HTTPProvider('https://10.184.110.253:8545', request_kwargs={'verify': False}))
        print("vmware dev ...")
        w3 = Web3(Web3.HTTPProvider('http://10.184.110.253:8545'))
        chainid = 5000
    else:
        print("vmware prod ...")
        w3 = Web3(Web3.HTTPProvider('http://10.40.205.171:8545'))
else:
    print("besu ...")
    #w3 = Web3(Web3.HTTPProvider('http://10.0.0.65:32000')) #besu single cluster
    w3 = Web3(Web3.HTTPProvider('http://54.241.133.23:32000')) #besu single cluster
    #w3 = Web3(Web3.HTTPProvider('http://54.219.187.21:32000')) #besu single cluster
    #w3 = Web3(Web3.HTTPProvider('http://54.241.133.23:32000')) #besu multi cluster
    chainid = 2018

w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# get bytecode
bytecode = compiled_sol['contracts']['Greeter.sol']['Greeter']['evm']['bytecode']['object']

# get abi
abi = json.loads(compiled_sol['contracts']['Greeter.sol']['Greeter']['metadata'])['output']['abi']

Greeter = w3.eth.contract(abi=abi, bytecode=bytecode)

nonce = w3.eth.getTransactionCount(account1)
# Submit the transaction that deploys the contract
construct_txn = Greeter.constructor().buildTransaction({
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
    print("hash mismatch")
tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
print(tx_receipt)
if (tx_receipt.status == 1):
    print("contract deploy success")
else:
    print("contract deploy failed")
    quit()

greeter = w3.eth.contract(
    address=tx_receipt.contractAddress,
    abi=abi
)
print(greeter.functions.greet().call())

start_time = time.time()
count1 = 0
txlist = []
txlist_mismatch = []
nonce = w3.eth.getTransactionCount(account1)
while (count1 < total_tx_count):
    construct_txn = greeter.functions.setGreeting('Nihao').buildTransaction({
        'from': account1,
        #'gas': 2000000,
        'gas':  200000,
        #'gas': 0x1ffffffffffffe,
        #'gasPrice': 234567897654321,
        'gasPrice': 0,
        'nonce': nonce,
        'chainId': chainid
    })
    signed_txn = w3.eth.account.sign_transaction(construct_txn, key1)
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
    if (tx_hash_send != tx_hash):
        print("hash mismatch",count1+1)
        #LOG_ERROR(logger, " total_txn_count " << total_txn_count << " Recording transaction hash " << txhash << " nonce " << nonce << " gas_price " << gas_price << " gas_used " << gas_used << " to " << to << " value " << message.value << " data " << message.input_data << " sig_r " << sig_r << " sig_s " << sig_s << " sig_v " << sig_v << " gas_limit " << gas_limit);

        print(" tx_hash ", w3.toHex(tx_hash)," nonce ", nonce, "gas_price ", 0, " gas_used ", 0, " to ", tx_receipt.contractAddress, " r ", w3.toHex(signed_txn.r)," s ", w3.toHex(signed_txn.s)," va ", signed_txn.v," gas_limit ", 200000, " tx_hash_send ", w3.toHex(tx_hash_send)," chainid ", chainid)
        txlist_mismatch.append(1)
    else:
        txlist_mismatch.append(0)
    txlist.append(tx_hash)
    txlist.append(tx_hash)
    count1 += 1
    nonce += 1
    #time.sleep(1)

count2 = 0
while (count2 < count1):
    tx_receipt = w3.eth.waitForTransactionReceipt(txlist[count2])
    if (tx_receipt.status == 1):
        #if (txlist_mismatch[count2] == 1):
        #    print(tx_receipt)
        if (count1-count2-1 == 0):
            break
        #print(greeter.functions.greet().call())
    else:
        print("tx failed")
        quit()
    count2 += 1
    #time.sleep(1)
end_time = time.time()
print("--- %s seconds ---" % (end_time - start_time))
print("tx success, complete:remaining",total_tx_count,":",0)
print("TPS:", total_tx_count/(end_time - start_time))
