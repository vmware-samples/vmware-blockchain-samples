#/*
# * Copyright 2021 VMware, all rights reserved.
# * This software is released under MIT license.
# * The full license information can be found in LICENSE in the root directory of this project.
# */
#Signed-off-by: ramki krishnan <ramkik@vmware.com>

import json

from web3 import Web3
from solcx import compile_standard
from web3.middleware import geth_poa_middleware
import time
import urllib3
from hexbytes import HexBytes
urllib3.disable_warnings()

vmware = 1
vmware_prod_deploy = 0
chainid = 1
total_tx_count = 100

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

#addr1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
addr1 = w3.toChecksumAddress('262c0d7ab5ffd4ede2199f6ea793f819e1abb019')
addr2 = w3.toChecksumAddress('627306090abaB3A6e1400e9345bC60c78a8BEf57')
amount = 1

balance = w3.eth.getBalance(addr1)
print("addr1 current balance: ", balance)
balance = w3.eth.getBalance(addr2)
print("addr2 current balance: ", balance)

start_time = time.time()
count1 = 0
txlist = []
txlist_mismatch = []
nonce = 0
while (count1 < total_tx_count):
    tx_hash = w3.eth.sendTransaction({'from':addr1, 'to':addr2, 'value':amount, 'gas':90000})
    txlist.append(tx_hash)
    count1 += 1
    nonce += 1
    #time.sleep(1)

count2 = 0
while (count2 < count1):
    tx_receipt = w3.eth.waitForTransactionReceipt(txlist[count2])
    if (tx_receipt.status == 1):
        if (count1-count2-1 == 0):
            break
    else:
        print("tx failed")
        quit()
    count2 += 1
    #time.sleep(1)
end_time = time.time()
print("--- %s seconds ---" % (end_time - start_time))
print("tx success, complete:remaining",total_tx_count,":",0)
print("TPS:", total_tx_count/(end_time - start_time))
block = w3.eth.getBlock('latest')
print(block)
