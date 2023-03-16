# Privacy Library
## Introduction
The privacy lib contains the source code needed in order to deploy and negotiate with the utt privacy distributed application on top of an existing VMBC.

## Solidity Contracts
The privacy application user contracts can be found under the `./contracts` directory.
### Privacy Contract
Most of the utt operations require advanced cryptographic techniques that are not supported by a standard EVM  (see the [paper](https://eprint.iacr.org/2022/452.pdf)). VMBC mitigates this by extending the standard EVM using a pre-complied instruction which can be invoked by a special solidity assembly calls. 
On start VMBC deploys a group of system contracts, including an utt system contract (the **privacy virtual contract**), which encapsulates the implementation of the above assembly calls, as well as some internal implementation details of the utt infrastructure (such as utt signature MPC algorithm and recovery mechanism).

As part of the privacy library, the privacy contract (`./contracts/PrivateToken.sol`) is an implementation of the utt algorithm, based on the privacy virtual contract functionality. 
Even though it is only a one possible implementation of the utt logic, the implementation has an impact on other parts of the library (such as the user logic) and it is not expected to be changed by the user.


### Public Token Contract
The `./contractsPublicToken.sol` contract derives from a standard ERC20 contract. In addition, it exposes two new methods:
* `convertPublicToPrivate` - to convert a given amount of ERC20 tokens to a Privacy (utt) tokens
* `convertPrivateToPublic` - to convert a given amount of Privacy (utt) tokens back to ERC20 tokens

## Privacy Wallet 
The privacy wallet is composed of two parts: 
1. A Privacy Wallet Service - The service responsible for holding assets and supporting the privacy workflow.
2. A Privacy Wallet Frontend Application (DAPP) - The front-end application responsible for talking with VMBC (using a web3 client). It can read/write from/to the contracts, update the results in the Privacy Wallet service and ask it to produce a new utt transaction based on the current state.

The current implementation assumes there is an already deployed Privacy Wallet Service and that it talks over a specific protobuf specification (see `./wallet-api.proto`).

### Privacy Wallet State
The privacy wallet state is synced with the privacy contract based on a sequence number the privacy contract maintains. Each transaction is assigned with a unique sequence number, when syncing a wallet, we should first get the latest global known sequence number from the privacy contract, then we need to rotate from our local last known sequence number to the latest global known sequence number, ask from the privacy contract the updates for the given sequence number and update the Wallet Service.

### privacy-wallet library
Most of the privacy transactions are in fact two-phased (or even more) transactions. Once the committers commit and execute the transaction, they initiate an asynchronous process in which they compute the MPC signature. A transaction is completed only when its signature is completed. Hence, dealing with the privacy contract requires some prior knowledge about the utt protocol.

The privacy wallet library is a layer that abstracts out the details of the utt algorithm and exposes a simple developer friendly API for DAPP creation. 
To use the library, a developer simply needs to import `privacy-wallet.js` and start working with the privacy logic "out of the box".

![Components-high-level-overview](./components-high-level-diagram.png)

# privacy-wallet API
The following methods are exposed by `privacy-wallet.js`:
| Method | Description |
| ------ | ----------- |
| <a href="#configure">configure</a> | configure the backend wallet service | 
| <a href="#convert_public_to_private">convert_public_to_private</a> | convert public tokens to private tokens |
| <a href="#claim_transferred_coins">claim_transferred_coins</a> | claim coins that were transferred by another user |
| <a href="#sync_state">sync_state</a> | Sync the application's state |
| <a href="#get_privacy_state">get_privacy_state</a> | get the privacy state from the privacy wallet service |
| <a href="#transfer">transfer</a> | transfer a given amount of tokens to another privacy user |
| <a href="#convert_private_to_public">convert_private_to_public</a> | convert private tokens to public tokens |
| <a href="#get_privacy_budget">get_privacy_budget</a> | gets the privacy budget token from the contract |
| <a href="#set_grpc_callback">set_grpc_callback</a> | set a callback for sending grpc requests |
| <a href="#set_transaction_callback">set_transaction_callback</a> | set a callback for sending transaction requests |

<a name="configure"></a>

## configure(privacy_contract_abi, privacy_contract_address, privateKey, publicKey, user_id) ⇒ <code>bool</code>
configure the back-end wallet service. This method should be called every time the Wallet Service starts

**Kind**: global function  
**Returns**: <code>bool</code> - true on success, false on failure  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| privateKey | <code>string</code> | an RSA private key in PKCS#8 PEM format |
| publicKey | <code>string</code> | an RSA public key in PKCS#8 PEM format |
| user_id | <code>string</code> | the public user id |

<a name="register"></a>

## register(privacy_contract_abi, privacy_contract_address, ether_account_private_key, certificate) ⇒ <code>bool</code>
register a user to the privacy contract

**Kind**: global function  
**Returns**: <code>bool</code> - true on success, false on failure  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| ether_account_private_key | <code>string</code> \| <code>undefined</code> | the ethereum account private key, in case of using an injected wallet, pass undefined |
| certificate | <code>string</code> | the user's certificate (PEM) |

<a name="convert_public_to_private"></a>

## convert\_public\_to\_private(privacy_contract_abi, privacy_contract_address, tokens_contract_abi, tokens_contract_address, ether_account_private_key, user_id, value) ⇒
convert public tokens to private tokens

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| tokens_contract_abi | <code>string</code> | the public token contract abi |
| tokens_contract_address | <code>string</code> | the public token contract address |
| ether_account_private_key | <code>string</code> \| <code>undefined</code> | the ethereum account private key, in case of using an injected wallet, pass undefined |
| user_id | <code>string</code> | the public user id |
| value | <code>BigInt</code> | number of public tokens to make private |

<a name="claim_transferred_coins"></a>

## claim\_transferred\_coins(privacy_contract_abi, privacy_contract_address, start_seq_num) ⇒ <code>BigInt</code>
**Kind**: global function  
**Returns**: <code>BigInt</code> - the last known sequence number from the privacy contract at the time when this method was executed  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| start_seq_num | <code>BigInt</code> | the sequence number from which it is required to start claiming any transferred coin |

<a name="sync_state"></a>

## sync\_state(privacy_contract_abi, privacy_contract_address, from_sn) ⇒ <code>BigInt</code>
This method claims all coins from the contract in the given range. The main usecase, is to recover the wallet state directly from the contract.

**Kind**: global function  
**Returns**: <code>BigInt</code> - the last known sequence number from the privacy contract at the time when this method was executed  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| from_sn | <code>BigInt</code> | the sequence number to start the sync with |

<a name="get_privacy_state"></a>

## get\_privacy\_state() ⇒ <code>json</code>
get the privacy state from the privacy wallet service

**Kind**: global function  
**Returns**: <code>json</code> - {balance: xxx, budget: xxx, coins: {x1 : v1, x2 : v2, ...}userId: xxx} representing the current privacy state that is held by the privacy service and configured current user id  
<a name="transfer"></a>

## transfer(privacy_contract_abi, privacy_contract_address, shielded_account_private_key, recipient_id, recipient_public_key, value)
transfer a given amount of tokens to another privacy user

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| shielded_account_private_key | <code>string</code> \| <code>undefined</code> | the shielded ethereum account private key, in case of using an injected wallet, pass undefined |
| recipient_id | <code>string</code> | the recipient id |
| recipient_public_key | <code>bytes</code> | the recipient RSA public key (PKCS#8 PEM format) |
| value | <code>BigInt</code> | the number of tokens to transfer |

<a name="convert_private_to_public"></a>

## convert\_private\_to\_public(privacy_contract_abi, privacy_contract_address, tokens_contract_abi, tokens_contract_address, ether_account_private_key, shielded_account_private_key, user_id, value)
convert private token to public tokens (burn). Note that there might be an intermediate transaction to break an existing call

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | privacy contract abi |
| privacy_contract_address | <code>string</code> | privacy contract address |
| tokens_contract_abi | <code>string</code> | public tokens contract address |
| tokens_contract_address | <code>string</code> | public tokens contract abi |
| ether_account_private_key | <code>string</code> \| <code>undefined</code> | the ethereum account private key, in case of using an injected wallet, pass undefined |
| shielded_account_private_key | <code>string</code> \| <code>undefined</code> | the relay ethereum account private key, in case of using an injected wallet, pass undefined |
| user_id | <code>string</code> | the public user id |
| value | <code>BigInt</code> | the number of tokens to convert |

<a name="get_privacy_budget"></a>

## get\_privacy\_budget(privacy_contract_abi, privacy_contract_address, user_id) ⇒ <code>bool</code>
gets the privacy budget token from the contract

**Kind**: global function  
**Returns**: <code>bool</code> - true on success false on failure  

| Param | Type | Description |
| --- | --- | --- |
| privacy_contract_abi | <code>string</code> | the privacy contract abi |
| privacy_contract_address | <code>string</code> | the privacy contract address |
| user_id | <code>string</code> | the public user id |

<a name="set_transaction_callback"></a>
## set\_transaction\_callback(callback)
set a callback for sending transaction requests. Some application may have their own injected ethereum wallet (such as Metamask). In this case, the user has to set a custom method for sending an ethereum transaction.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>async\_function</code> | async callback for sending transaction requests |

<a name="set_grpc_callback"></a>    
## set\_grpc\_callback(callback)
optionally set a callback for sending grpc requests. The web applications use a different grpc callback compared to a server node JS based application. 


**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>async\_function</code> | async callback for sending grpc requests |

