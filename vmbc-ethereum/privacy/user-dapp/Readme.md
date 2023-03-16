# Privacy user NodeJS Dapp

The user-dapp is a Nodejs based application that demonstrate privacy application users workflow.

# User Workflow

## Attach to the container:
```sh
 kubectl exec -it privacy-user-dapp-0 -c privacy-user-dapp -- bash
```

## User privacy key & registration certificate generation:
The user needs to generate a privacy application key pair. He then would need to perform an out of band certificate signing to authorize and authenticate himself with a known certificate authority. 
Currently these steps are handled by a sample bash script for demonstration. 
This flow should be tailored appropriate to the application requirements.

```sh
root@privacy-user-dapp-0:/app# cd storage/ && mkdir certs && cd certs/
root@privacy-user-dapp-0:/app/storage# 
root@privacy-user-dapp-0:/app/storage# 
root@privacy-user-dapp-0:/app/storage/certs# /app/user-dapp/generate_self_signed_certificate.sh alice
Generating a RSA private key
...................................+++++
.........................+++++
writing new private key to 'alice.priv.pem'
-----
Signature ok
subject=C = US, ST = California, L = Mountain View, O = My Company, OU = IT, CN = alice
Getting Private key
root@privacy-user-dapp-0:/app/storage/certs# more alice.userid
aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833  alice.pub.pem
```

In this demo application the users privacy ID is based on his public key digest.

## General help command for the DAPP

```sh
cd /app/user-dapp

APP help:
 node privacy-user-dapp.js
Usage: privacy-user-dapp [options] [command]

Options:
  -V, --version                                                        output the version number
  -h, --help                                                           display help for command

Commands:
  configure <private_key_path> <public_key_path>                       configure the backend wallet service with the given key pair
  register <certificate>                                               register a user to the privacy contract
  init <privacy_contract_address> <tokens_contract_address> <user_id>  initialize the application with a specific privacy configuration
  convert-public-to-private <value>                                    convert public ERC20 tokens to private coin with the same amount of tokens
  claim-transferred-coins                                              claim coins that were transferred by another user. This is done by trying to claim coins from every sequence number in the range of [last known
                                                                       sequence number + 1, last known global sequence number]
  claim-budget-coin                                                    claim the budget coin which was minted by the administrator
  sync                                                                 syncing the wallet with the privacy contract state. This method tries to claim all coins by looping in the range of [1, last known global sequence
                                                                       number]. Basically this method should be used in case we need to recover a wallet state from the contract state itself
  show                                                                 show the latest state as known by the backend privacy service
  convert-private-to-public <value>                                    convert private privacy tokens to a public ERC20 tokens
  transfer <value> <recipient_id> <path_to_recipient_public_key>       transfer the given amount of private tokens to another user
  help [command]                                                       display help for command
```

## Initialize the user application

Boot strap the user application with admin deployed contract addresses instance. 

```sh
node privacy-user-dapp.js init 0x44f95010ba6441e9c50c4f790542a44a2cdc1281 0x3d8b57c2d58bb8c8e36626b05ff03381734ead43 aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833
Ethereum account address is:  0x45159Aef48d2337bAedd83a76a764e869073BBa7
Ethereum relay account address is:  0x00be44dd7dDbC871BebF8b7e29e6ec14f30723C2
compile sol:  ./../privacy-lib/contracts/PrivateToken.sol
./../privacy-lib/contracts/PrivateToken.sol
undefined
Successfully compiled PrivateToken from file ./../privacy-lib/contracts/PrivateToken.sol
Bytecode size: 39588
compile sol:  ./../privacy-lib/contracts/PublicToken.sol
./../privacy-lib/contracts/PublicToken.sol
undefined
Successfully compiled PublicToken from file ./../privacy-lib/contracts/PublicToken.sol
Bytecode size: 21214
root@privacy-user-dapp-0:/app/user-dapp# node privacy-user-dapp.js configure /app/storage/certs/alice.priv.pem /app/storage/certs/alice.pub.pem
root@privacy-user-dapp-0:/app/user-dapp# node privacy-user-dapp.js register /app/storage/certs/alice.crt
sending registration request to the privacy contract
signing myself...
```
## Configure the user
Now configure the users with generated demonstration keys.

```sh
node privacy-user-dapp.js configure /app/storage/certs/alice.priv.pem /app/storage/certs/alice.pub.pem
```
The user DAPP has its own persistent volume that gets mounted to /app/storage path.
This enables users to persist the application state and hence support restarts.

## Register the user
Since the user certificates signed by an authority authorizes him implicitly a given user is now able to register himself with the privacy application.

```sh
node privacy-user-dapp.js register /app/storage/certs/alice.crt
sending registration request to the privacy contract
```

## Show and cross check user state
```
node privacy-user-dapp.js show
{
  privacy_state: {
    balance: '0',
    budget: '0',
    coins: {},
    userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833'
  },
  public_balance: '1000',
  ethereum_public_address: '0x45159Aef48d2337bAedd83a76a764e869073BBa7',
  ethereum_shielded_address: '0x00be44dd7dDbC871BebF8b7e29e6ec14f30723C2'
}
```
## How to create privacy tokens
### Administrator mints public token for the EOA ethereum address of the user.
The ethereum address for NodeJS app is currently autogenerated within the application. It can be inferred from "show" command output.

**NOTE: This command is executed on admin dapp!**
```sh
root@privacy-admin-dapp-0:/app/admin-dapp# node privacy-admin-dapp.js create-budget aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833 1000
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
Budget req: {
  userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833',
  expirationDate: 1919241632,
  value: '1000'
}
sendTx with identity: admin
Transaction hash :  0xd374af3241ca1f2816331ff7536995f2ba7fc06ea73ab941a303a986617d4757
created budget successfully..
```

Admin also mints public tokens for the user based on his ethereum account address
```sh
root@privacy-admin-dapp-0:/app/admin-dapp# node privacy-admin-dapp.js mint-public 0x45159Aef48d2337bAedd83a76a764e869073BBa7 1000
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
sendTx with identity: admin
Transaction hash :  0x62fd5636d47826e4063a1e721e6bbd75f90bdf547bce22ebc190fd333b50e6ba
``` 
### User claims the privacy budget
User requires privacy budget to perform privacy token transfers. To obtain budget the admin dapp must issue budget for this user-id which is demonstrated on admin readme.
User can then "sync" or "claim-budget-coin" from the app to claim the budget.

```sh
node privacy-user-dapp.js claim-budget-coin

node privacy-user-dapp.js show
{
  privacy_state: {
    balance: '0',
    budget: '1000',
    coins: {},
    userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833'
  },
  public_balance: '1000',
  ethereum_public_address: '0x45159Aef48d2337bAedd83a76a764e869073BBa7',
  ethereum_shielded_address: '0x00be44dd7dDbC871BebF8b7e29e6ec14f30723C2'
}
```
### User converts his public tokens to private!

User converts public to private tokens. Note this is an non-private operation.
```sh
node privacy-user-dapp.js convert-public-to-private 500
signing myself...
syncing state for sequence number: 1 , searching for [ 'Mint' ]
```
Cross check his states:
```sh
node privacy-user-dapp.js show
{
  privacy_state: {
    balance: '500',
    budget: '1000',
    coins: {
      '0 9231074321277849572497954771305643851681150149679331500088374543221465792151 1': '500'
    },
    userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833'
  },
  public_balance: '500',
  ethereum_public_address: '0x45159Aef48d2337bAedd83a76a764e869073BBa7',
  ethereum_shielded_address: '0x00be44dd7dDbC871BebF8b7e29e6ec14f30723C2'
}
```
As indicated he has converted 500 of his public tokens to private.

## How to transfer privacy tokens
Lets now transfer privacy tokens to user PID - bob. To do this we require the public key to encrypt privacy token for bob.
This flow assumes the way user learns about bob etc., is out of band. We just copy over public key of bob and invoke a transfer.

```sh
copy over bob(privacy-user-dapp-1 pod) public key:

kubectl exec privacy-user-dapp-1 -c privacy-user-dapp -- cat /app/storage/certs/bob.userid
de0125d3cf476cba09d2bf3fdd70b6ba719ed0911458410da86999583f1fb1e3  bob.pub.pem

kubectl exec privacy-user-dapp-1 -c privacy-user-dapp -- cat /app/storage/certs/bob.pub.pem > bob.pub.pem

kubectl cp  /tmp/bob/bob.pub.pem privacy-user-dapp-0:/app/storage/certs/bob.pub.pem -c privacy-user-dapp

ls /app/storage/certs/
alice.crt  alice.csr  alice.priv.pem  alice.pub.pem  alice.userid  bob.pub.pem
```

Alice(privacy-user-dapp-0) transfers privacy token to bob(privacy-user-dapp-1)
```sh
node privacy-user-dapp.js transfer 100 de0125d3cf476cba09d2bf3fdd70b6ba719ed0911458410da86999583f1fb1e3 /app/storage/certs/bob.pub.pem
signing myself...
syncing state for sequence number: 2 , searching for [ 'Transfer' ]

// check alice states
node privacy-user-dapp.js show
{
  privacy_state: {
    balance: '400',
    budget: '900',
    coins: {
      '0 4620133009863092504842331349039868692821298384966286944111483100841882727713 0': '400'
    },
    userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833'
  },
  public_balance: '500',
  ethereum_public_address: '0x45159Aef48d2337bAedd83a76a764e869073BBa7',
  ethereum_shielded_address: '0x00be44dd7dDbC871BebF8b7e29e6ec14f30723C2'
}
```

Cross check the transferred tokens on bob(privacy-user-dapp-1) pod.
```sh
root@privacy-user-dapp-1:/app/user-dapp# node privacy-user-dapp.js sync
syncing state for sequence number: 1 , searching for [ 'Mint', 'Burn', 'Transfer' ]
syncing state for sequence number: 2 , searching for [ 'Mint', 'Burn', 'Transfer' ]
Budget coin was not set by admin
root@privacy-user-dapp-1:/app/user-dapp# node privacy-user-dapp.js show
{
  privacy_state: {
    balance: '100',
    budget: '0',
    coins: {
      '0 601146420825736581755860698399093859049787272522278353735572373586907784482 0': '100'
    },
    userId: 'de0125d3cf476cba09d2bf3fdd70b6ba719ed0911458410da86999583f1fb1e3'
  },
  public_balance: '0',
  ethereum_public_address: '0xe38874CDd0e8dC2B35896dCA99427538C23c8eA4',
  ethereum_shielded_address: '0xE0C7882bF1F0dd6B8C87c442e29b9B6bA402c892'
}
```