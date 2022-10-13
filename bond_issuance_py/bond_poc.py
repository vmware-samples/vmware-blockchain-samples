"""
PLease set following environment variables for this script to work properly

export HOST=<ip address>   default value=None
"""
import json
import subprocess
import time

import urllib3
from solcx import compile_files, install_solc
from web3 import Web3
from web3._utils.events import get_event_data
from web3.middleware import geth_poa_middleware

urllib3.disable_warnings()

with open('./resources/accounts.json') as json_file:
    accounts = json.load(json_file)

    exchange_addr = accounts["exchange"]
    exchange_key = accounts["exchange_key"]

    treasury_addr = accounts["treasury"]
    treasury_key = accounts["treasury_key"]

    mm_addr = accounts["mm"]
    mm_key = accounts["mm_keys"]


def setup_w3(host):
    """
    setup w3 http provider
    """
    url = "http://" + host + ":8545"
    global w3
    w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"verify": False}))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)


def compile_exchange():
    """
    compiling Exchange source file
    """
    install_solc("0.8.9")
    # global exchange_abi, exchange_bytecode
    compiled_sol = compile_files(
        ["contracts/Exchange.sol"], solc_version='0.8.9', optimize=True)
    exchange_bytecode = compiled_sol['contracts/Exchange.sol:Exchange']['bin']
    exchange_abi = compiled_sol['contracts/Exchange.sol:Exchange']['abi']
    return exchange_bytecode, exchange_abi


def tx_receipt_poll(construct_txn, acc_priv_key):
    """
    function to validate tx hash and poll for receipt
    Arguments:
        construct_txn: transaction construct
        acc_priv_key: private key of account
    """
    signed_txn = w3.eth.account.sign_transaction(
        construct_txn, acc_priv_key)
    # Validating transaction hash
    tx_hash_send = signed_txn.hash
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    assert tx_hash_send == tx_hash, "tx hash mismatch"

    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    assert tx_receipt.status == 1, "transaction failed"
    return tx_receipt


def deploy_exchange(pt_name, pt_symbol):
    """
    deploy exchange contract and distribute tokens among all senders
    Arguments:
        pt_name: Payment token Name
        pt_symbol: symbol for Payment token
    """
    exchange_bytecode, exchange_abi = compile_exchange()
    contract = w3.eth.contract(abi=exchange_abi, bytecode=exchange_bytecode)

    # deploying contract
    construct_txn = contract.constructor(pt_name, pt_symbol).buildTransaction(
        {
            "from": exchange_addr,
            "gas": 2000000,
            "gasPrice": 0,
            "nonce": w3.eth.get_transaction_count(exchange_addr),
            "chainId": 5000,
        }
    )
    tx_receipt = tx_receipt_poll(construct_txn, exchange_key)
    print("\nExchange smart contract deploy success, contract address: '{}'".format(
        tx_receipt.contractAddress))

    exchange_contract_address = tx_receipt.contractAddress
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        data["exchange_contract_address"] = exchange_contract_address
    with open('./resources/contracts.json', 'r+') as file_write:
        json.dump(data,file_write, indent=4)


def set_pt():
    """
    get payment token address and add it to json
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    exchange_bytecode, exchange_abi = compile_exchange()
    exchange_contract = w3.eth.contract(address=exchange_contract_address, abi=exchange_abi)
    pt_address = exchange_contract.caller({'from': exchange_addr}).getPtAddress()
    print("PT address - {}\n".format(pt_address))
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        data["pt_address"] = pt_address
    with open('./resources/contracts.json', 'r+') as file_write:
        json.dump(data,file_write, indent=4)


def mint_pt(mm_num, pt_val):
    """
    Mint payment token for a sender
    Arguments:
        mm_num: index for Market maker
        pt_val: payment token amount to be minted
    """
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        exchange_contract_address = data["exchange_contract_address"]
    exchange_bytecode, exchange_abi = compile_exchange()
    exchange_contract = w3.eth.contract(address=exchange_contract_address, abi=exchange_abi)
    construct_txn = exchange_contract.functions.mintAndTransferPT(pt_val, mm_addr[mm_num]).buildTransaction({
        'from': exchange_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(exchange_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, exchange_key)
    balance = exchange_contract.caller({'from': exchange_addr}).get_balance_pt(mm_addr[mm_num])
    print("MM{} ({}) got balance - {} PT".format(mm_num+1, mm_addr[mm_num], balance))


def mint_st():
    """
    Mint security token
    """
    exchange_contract,exchange_contract_address = get_exchange_contract()
    with open('./resources/security-tokens.json') as json_file:
        stks = json.load(json_file)["tokens"]
        for stk in stks:
            construct_txn = exchange_contract.functions.mintAndTransferST(stk["isin"], treasury_addr,
                                                                          stk["interest_rate"], stk["cost_in_pt"],
                                                                          stk["maturity_date"],
                                                                          stk["bond_amount"]).buildTransaction({
                'from': exchange_addr,
                'gas': 2000000,
                'gasPrice': 0,
                'nonce': w3.eth.get_transaction_count(exchange_addr),
                'chainId': 5000
            })
            tx_receipt_poll(construct_txn, exchange_key)
            balance = exchange_contract.caller({'from': exchange_addr}).get_balance_st(treasury_addr, stk["isin"])
            print("Treasury got balance - {} ST for ISIN - {}".format(balance, stk["isin"]))


def swap_token_start(mm_num, st_val, st_isin):
    """
    call swapTokens method from exchange
    Arguments:
        mm_num: market maker number
        st_val: security token amount
        st_isin: ISIN of security token
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    construct_txn = exchange_contract.functions.swapTokens(mm_addr[mm_num], treasury_addr, st_isin, st_val).buildTransaction({
        'from': exchange_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(exchange_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, exchange_key)


def increase_allowance_pt(mm_num, allowance_val):
    """
    Increase allowance for Payment token for exchange
    Arguments:
        mm_num: Market maker index
        allowance_val: allowance amount
    """
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        exchange_contract_address = data["exchange_contract_address"]
        pt_address = data["pt_address"]
    compiled_sol = compile_files(
        ["contracts/PaymentToken.sol"], solc_version='0.8.9', optimize=True)
    pt_abi = compiled_sol['contracts/PaymentToken.sol:PaymentToken']['abi']
    pt_contract = w3.eth.contract(address=pt_address, abi=pt_abi)
    construct_txn = pt_contract.functions.increaseAllowance(exchange_contract_address, allowance_val).buildTransaction({
        'from': mm_addr[mm_num],
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(mm_addr[mm_num]),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, mm_key[mm_num])
    allowance = pt_contract.caller({'from': mm_addr[mm_num]}).allowance(mm_addr[mm_num], exchange_contract_address)
    print("\nAllowance of Exchange is - {} PT".format(allowance))


def decrease_allowance_pt(mm_num, allowance_val):
    """
    Decrease allowance for Payment token for exchange
    Arguments:
        mm_num: Market maker index
        allowance_val: allowance amount
    """
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        exchange_contract_address = data["exchange_contract_address"]
        pt_address = data["pt_address"]
    compiled_sol = compile_files(
        ["contracts/PaymentToken.sol"], solc_version='0.8.9', optimize=True)
    pt_abi = compiled_sol['contracts/PaymentToken.sol:PaymentToken']['abi']
    pt_contract = w3.eth.contract(address=pt_address, abi=pt_abi)
    construct_txn = pt_contract.functions.decreaseAllowance(exchange_contract_address, allowance_val).buildTransaction({
        'from': mm_addr[mm_num],
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(mm_addr[mm_num]),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, mm_key[mm_num])
    allowance = pt_contract.caller({'from': mm_addr[mm_num]}).allowance(mm_addr[mm_num], exchange_contract_address)
    print("\nAllowance of Exchange is - {} PT".format(allowance))


def increase_allowance_st(st_isin, allowance_val):
    """
    Increase allowance for Security token for exchange
    Arguments:
        st_isin: ISIN for security token
        allowance_val: allowance amount
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    st_address = exchange_contract.caller({'from': exchange_addr}).getStAddress(st_isin)
    compiled_sol = compile_files(
        ["contracts/SecurityToken.sol"], solc_version='0.8.9', optimize=True)
    st_abi = compiled_sol['contracts/SecurityToken.sol:SecurityToken']['abi']
    st_contract = w3.eth.contract(address=st_address, abi=st_abi)

    construct_txn = st_contract.functions.increaseAllowance(exchange_contract_address, allowance_val).buildTransaction({
        'from': treasury_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(treasury_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, treasury_key)
    allowance = st_contract.caller({'from': treasury_addr}).allowance(treasury_addr, exchange_contract_address)
    print("\nAllowance of Exchange is - {} ST ({})".format(allowance, st_isin))


def decrease_allowance_st(st_isin, allowance_val):
    """
    Decrease allowance for Security token for exchange
    Arguments:
        st_isin: ISIN for security token
        allowance_val: allowance amount
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    st_address = exchange_contract.caller({'from': exchange_addr}).getStAddress(st_isin)
    compiled_sol = compile_files(
        ["contracts/SecurityToken.sol"], solc_version='0.8.9', optimize=True)
    st_abi = compiled_sol['contracts/SecurityToken.sol:SecurityToken']['abi']
    st_contract = w3.eth.contract(address=st_address, abi=st_abi)

    construct_txn = st_contract.functions.decreaseAllowance(exchange_contract_address, allowance_val).buildTransaction({
        'from': treasury_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(treasury_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, treasury_key)
    allowance = st_contract.caller({'from': treasury_addr}).allowance(treasury_addr, exchange_contract_address)
    print("\nAllowance of Exchange is - {} ST ({})".format(allowance, st_isin))


def swap_token_complete(transaction_num, st_isin, mm_num):
    """
    call _swapTokens to complete swap
    Arguments:
        transaction_num: transaction number
        st_isin: ISIN for security Token
        mm_num: market maker index
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    construct_txn = exchange_contract.functions._swapTokens(transaction_num).buildTransaction({
        'from': exchange_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(exchange_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, exchange_key)
    balancePT = exchange_contract.caller({'from': exchange_addr}).get_balance_pt(treasury_addr)
    print("\nTreasury got balance - {} PT".format(balancePT))
    balanceST = exchange_contract.caller({'from': exchange_addr}).get_balance_st(mm_addr[mm_num], st_isin)
    print("MM{} ({}) got balance - {} ST ({})".format(mm_num+1, mm_addr[mm_num], balanceST, st_isin))


def close_issuance():
    """
    close issuance and print all balances
    burn the ST remaining with treasury at the end issuance
    """
    json_file =  open('./resources/security-tokens.json')
    stks = json.load(json_file)["tokens"]
    print("\nbalance for treasury")
    exchange_contract, exchange_contract_address = get_exchange_contract()

    print("PT balance  for treasury : {} ".format(exchange_contract.caller({'from': exchange_addr}).get_balance_pt(treasury_addr)))
    for stk in stks:
        print("isin : {}".format(stk["isin"]))
        st_balance_issuance = exchange_contract.caller({'from': exchange_addr}).get_balance_st(treasury_addr, stk["isin"])
        print("ST balance for treasury before burn: {} ".format(st_balance_issuance))
        burn_st(st_balance_issuance, stk["isin"])
        st_balance_issuance = exchange_contract.caller({'from': exchange_addr}).get_balance_st(treasury_addr, stk["isin"])
        print("ST balance for treasury after burn: {} ".format(st_balance_issuance))
    print("\nbalance for MMs")
    index = 0
    for mm in mm_addr:
        index = index + 1
        print("\nPT balance for mm {} : {} ".format(index, exchange_contract.caller({'from': exchange_addr}).get_balance_pt(mm)))
        for st in stks:
            print("isin : {}".format(st["isin"]))
            print("ST balance for mm {}: {} ".format(index, exchange_contract.caller({'from': exchange_addr}).get_balance_st(mm, st["isin"])))


def burn_st(amount, st_isin):
    """
    burn security token for an ST
    Arguments:
        amount: amount of st token to be burned
        st_isin: isin value
    Return:
        None
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    st_address = exchange_contract.caller({'from': exchange_addr}).getStAddress(st_isin)
    compiled_sol = compile_files(
        ["contracts/SecurityToken.sol"], solc_version='0.8.9', optimize=True)
    st_abi = compiled_sol['contracts/SecurityToken.sol:SecurityToken']['abi']
    st_contract = w3.eth.contract(address=st_address, abi=st_abi)

    construct_txn = st_contract.functions.burn(amount).buildTransaction({
        'from': treasury_addr,
        'gas': 2000000,
        'gasPrice': 0,
        'nonce': w3.eth.get_transaction_count(treasury_addr),
        'chainId': 5000
    })
    tx_receipt_poll(construct_txn, treasury_key)


def handle_event(event, event_template):
    """
    get event data and decode it
    Arguments:
        event: event
        event_template: event template(object representing event)
    """
    try:
        result = get_event_data(event_template.web3.codec, event_template._get_event_abi(), event)
        return True, result
    except:
        return False, None


def swap_tokens(mm_num, st_val, st_isin, delay=False):
    """
    swap Security token for payment token
    Arguments:
        mm_num: market make index
        st_val: security token amount to be swapped
        st_isin: ISIN for security token
    :return:
    """
    swap_token_start(mm_num, st_val, st_isin)
    transaction_number = 0
    exchange_contract, exchange_contract_address = get_exchange_contract()

    event_template = exchange_contract.events.approvalRequired
    events = w3.eth.get_logs({})
    for event in events:
        # does it get the last one??? this can give incorrect results
        suc, res = handle_event(event=event, event_template=event_template)
        if suc:
            print("\nEvent found", res)
            transaction_number = res["args"]["tx_number"]
            if mm_addr[mm_num] == res["args"]["from"]:
                pt_allowance_val = res["args"]["amount"]
                increase_allowance_pt(mm_num, res["args"]["amount"])
            if treasury_addr == res["args"]["from"]:
                st_allowance_val = res["args"]["amount"]
                increase_allowance_st(st_isin, res["args"]["amount"])
    try:
        # swap token
        if delay:
            print("\n introduced delay of 60 sec")
            time.sleep(60)
        swap_token_complete(transaction_number, st_isin, mm_num)
    except Exception as e:
        print("\nswap token failed - {}".format(e))
        print("\nDecreasing allowance")
        decrease_allowance_pt(mm_num, pt_allowance_val)
        decrease_allowance_st(st_isin, st_allowance_val)


def set_env_var():
    """
    export host value to environment
    """
    cmd = 'source ./.env'
    subprocess.call(cmd, shell=True, stdout=subprocess.PIPE)


def get_exchange_contract():
    """
    get exchange details
    returns:
        exchange contract object, exchange contract address
    """
    with open('./resources/contracts.json','r') as file_read:
        data = json.load(file_read)
        exchange_contract_address = data["exchange_contract_address"]
    exchange_bytecode, exchange_abi = compile_exchange()
    exchange_contract = w3.eth.contract(address=exchange_contract_address, abi=exchange_abi)
    return exchange_contract, exchange_contract_address


def get_balance(account, isin=None):
    """
    get balance for an account
    Arguments:
        account: account address
        isin: ISIN value of Security Token
    """
    exchange_contract, exchange_contract_address = get_exchange_contract()
    if isin:
        balance_st = exchange_contract.caller({'from': exchange_addr}).get_balance_st(account, isin)
        print("\nST Balance is : {}".format(balance_st))
    else:
        json_file = open('./resources/security-tokens.json')
        stks = json.load(json_file)["tokens"]
        for stk in stks:
            st_balance = exchange_contract.caller({'from': exchange_addr}).get_balance_st(account,
                                                                                                   stk["isin"])
            print("\nST Balance for ISIN : {} is : {}".format(stk["isin"], st_balance))

    balance_pt = exchange_contract.caller({'from': exchange_addr}).get_balance_pt(account)
    print("\nPT Balance is : {}".format(balance_pt))

