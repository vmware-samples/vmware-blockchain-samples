# AssetTransfer - a blockchain demonstration - v1.0.5

Welcome to AssetTransfer, a demonstration of how to develop a "Dapp" (or
blockchain smart contract "distributed application") on VMware's
blockchain. This app simulates an exchange where people are able to
"buy", "trade", and "consume" products (asset). The app tracks the stock 
of each person as they perform each action.

## Prerequisites

To use this demo, you will need two things: a VMware blockchain
deployment, and the demo code.

### Getting a VMware blockchain deployment

Your blockchain deployment should have been created for you. Contact us
if you do not have a blockchain instance. You will also
need the deployment address of the blockchain.

### Getting the demo code

The AssetTransfer demo is provided as a docker image, which includes the
smart contract code, and the necessary libraries for deploying and
interacting with the contract on the blockchain.

First, make sure you have Docker installed. Instructions are available
for doing this in Windows, Mac, and Linux here:
https://store.docker.com/search?offering=community&type=edition

Second, make sure you have the credentials to VMware Blockchain's DockerHub
ID or ensure your ID is added as a reader to the repository. Contact us if
you have not done this step.

With Docker installed, and the Dockerhub login ready, open a
terminal, and sign into Dockerhub:

```
(NOTE - Key for prompts
 $ - Host machine (Mac/Windows/Linux)
 # - Docker container
 > - Node.js prompt)
```

```
$ docker login
Username:
Password:
```

Once logged in, you can launch a new container based on the demo
image. The following command starts the container in interactive mode,
so that you can use the files and utilities it contains:

```
$ docker run -it vmwblockchain/asset-transfer:latest
root@b8136d3deacf:/source#
```

You are now inside the Docker container.

If you type `ls` at the prompt, you will see the contract source file,
and some other support files:

```
# ls
AssetTransfer.js  AssetTransfer.sol  Dockerfile  README.md  
node_modules  package-lock.json  test  versions.txt
```

### Stopping and starting the container (OPTIONAL)

To stop and disconnect from this container, type control-d. If you
want to restart this container and pick up where you left off, use the
following command, replacing `ASSET_TRANSFER_HASH` with the hash found
between the `@` and the `:` in the docker prompt that was displayed while you
were connected. This was `b8136d3deacf` in the example above:

```
$ docker start -i ASSET_TRANSFER_HASH
```

You can also start over with a fresh container by executing the
`docker run` command again.

## Using the AssetTransfer demo

You must have the deployment address for an instance of VMware's blockchain.
This is referred to as `DEPLOYED_ADDRESS` in this document.

In this demo, /source folder is the home directory. All instructions 
must be executed from within the home directory, unless mentioned otherwise. 

### Compiling the smart contract

Compile the demo contract to obtain the binary code for the smart contract, 
using the following command: 
(NOTE - You could get a few warnings; as long as the two additional files 
mentioned below are created, you are good to continue)

```
# solc AssetTransfer.sol --abi --bin --optimize -o ./
```

This will generate .abi and .bin files which can be verified :
```
# ls
AssetTransfer.abi  AssetTransfer.bin  AssetTransfer.js  AssetTransfer.sol  Dockerfile
README.md  node_modules  package-lock.json  test  versions.txt
```

### Deploying the smart contract

Open Node.js and import the contract setup script. 
```
# node
> helper = require('./AssetTransfer')
```

The console might print 'undefined' when a variable is defined; this
is not a declaration failure. In order to display the contents loaded
into the variable, just type the name of the variable and hit ENTER.
```
> helper
{ setupContract: [Function: setupContract],
  transferAsset: [Function: transferAsset],
  buyAsset: [Function: buyAsset],
  useAsset: [Function: useAsset],
  getNumberOfAssets: [Function: getNumberOfAssets],
  addName: [Function: addName],
  removeName: [Function: removeName] }
```

We will now deploy the contract. We will start with three people in 
our exchange, namely, 'alpha', 'bravo' and 'charlie'. 

Setup and deploy the smart contract with the following, 
after replacing `DEPLOYED_ADDRESS` with the deployment address:

(NOTE - The DEPLOYED_ADDRESS must be of form 
'https://mgmt.blockchain.vmware.com/blockchains/
80bf7abc-c1ec-4609-90ed-ff68f07d8f64/api/concord/eth'.
Note the inclusion of https:// in the beginning and the path /api/concord/eth 
in the end. Replace USER_NAME and PASSWORD with your credentials.
Remember that all these 3 fields are strings are to be enclosed within '')

```
> helper.setupContract('AssetTransfer', ['alpha','bravo','charlie'], 'DEPLOYED_ADDRESS', 'USER_NAME', 'PASSWORD').then(add => {contract_address=add;})
Endpoint defined as https://mgmt.blockchain.vmware.com/blockchains/80bf7abc-c1ec-4609-90ed-ff68f07d8f64/api/concord/eth
Loading contract
Deploying contract
Promise {
  <pending>,
  domain:
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
Contract has been deployed
```
(NOTE - Wait for the console to display 'Contract has been deployed'.
This generally takes upto 5 seconds. As this is an asynchronous call,
you might have to hit ENTER once to get the Node.js prompt after the deployed
message is printed.)

(NOTE - A promise is created with the expectation of a result in future.
Here we store get the address the contract has been deployed and store it in
the variable 'contract_address'. The mention of a 'debugDomainError' in the
promise does NOT imply failure.)


Obtain the contract instance (used to interact with the smart contract) 
using the following:
```
> var contract_instance = web3.eth.contract(JSON.parse(fs.readFileSync('AssetTransfer.abi').toString())).at(contract_address)
```
(NOTE - Remember that the console printing 'undefined' is expected behavior 
after initialization. Type the variable name, i.e. contract_instance, 
and hit ENTER to check its contents.)

### Interacting with the smart contract

The following are example invocations of the smart contract method.
For ease of use, we have wrapped the smart contract methods with
helper methods (in AssetTransfer.js).


Check the number of assets with a person (say 'alpha'):
```
> helper.getNumberOfAssets(contract_instance, 'alpha')
'0'
```

'bravo' decides to buy an asset:
(NOTE - Here, since we are making changes to the state, 
a transaction address is returned)
```
> helper.buyAsset(contract_instance, 'bravo')
'0xbedc4c61a0485cd4c8ad4599b1a3411664de994b547cf5d13bbaf064a5614ad4'
```

Now, checking the number of assets for 'bravo' should return '1':
```
> helper.getNumberOfAssets(contract_instance, 'bravo')
'1'
```

'bravo' decides to give his asset to 'charlie':
```
> helper.transferAsset(contract_instance, 'bravo', 'charlie')
'0x65f32c55d394ea1d307df0d2d1349af84e83cae57d8075fc3dc7d4cc0581339f'
```

Now, 'charlie' must have the asset originally bought by 'bravo':
```
> helper.getNumberOfAssets(contract_instance, 'bravo')
'0'
> helper.getNumberOfAssets(contract_instance, 'charlie')
'1'
```

Let 'charlie' use the asset. But, did 'charlie' really use the asset?
```
> helper.useAsset(contract_instance, 'charlie')
'0x5ef44c6b78225ef362a302c8439de3f84e83cae57d8075fc3dc7d4cc0581339f'
> helper.getNumberOfAssets(contract_instance, 'charlie')
'0'
```


Invoking a method on an invalid person will result in an error:
```
> helper.getNumberOfAssets(contract_instance, 'delta')
Error: Error while calling contract
```

Welcome 'delta' to the party and check the number of assets:
```
> helper.addName(contract_instance, 'delta')
'0x5ef44c6b78225ef362a302c8439de3b4867e1b9c0fd2617dd6cc76a5dbdbc688'
> helper.getNumberOfAssets(contract_instance, 'delta')
'0'
```

'alpha' has to leave the party. 
```
> helper.removeName(contract_instance, 'alpha')
'0x5ed34678dfa629ba5f6ad087b6ead4412773ce19817ea987600e98af5defbc3b'
> helper.getNumberOfAssets(contract_instance, 'alpha')
Error: Error while calling contract

