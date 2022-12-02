# Ethereum Permissioning

In the 1.8 release, VMware Blockchain for Ethereum will implement “account permissioning” as a tech preview feature in accordance with the Enterprise Ethereum Alliance (EEA) specifications to provide the necessary tools and granularity to govern actions permitted by accounts on the blockchain. Permissioning in the context of enterprise blockchains is a required feature for our customers as they seek ways to control access to deploy and execute smart contracts running on the blockchain. The account permissioning feature can be enabled during network creation by providing the necessary parameters in the deployment configurations file. The compiled permissioning smart contract and the account(s) that can grant permissions to other addresses should also be included in the genesis file. The “permission admin” user can use a dApp or the permissioning user interface to control which accounts are allowed to send transactions and specify the type of transactions permitted. Types of transaction can be READ, WRITE and DEPLOY permissions to other accounts. The dApp should be the preferred method to grant access to a large number of accounts.

By default in VMBC the permissioning feature is disabled. It means anybody can read and write to blockchain.

## Permissioning Contract
Permissioning contract is present at `vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/permissioning/contracts/Permissioning.sol`
 
## Permissioning fields in `values.yaml`

Users can modify the default values in `values.yaml`. All the fields in `genesisBlock` section will be populated as `genesis.json` for vmbc blockchain.
 * **alloc**: List of admin accounts who can provide the permissions to other users. These admin accounts by default have read, write and deploy permissions. This field can be modified during blockchain deployment.
 * **permissioningContractAddress**: The permissioning smart contract is pre-deployed during system boot. Note that this field can't be changed.
 * **permissioningContractBin**: The binary of the permissioning smart contract goes here. If user modified the existing permissioning contract, then the user has to update the new binary here. 

## Write Permissioning

### How to enable write permissioning?

In `values.yaml`, under "permissioning" section change `ethPermissioningWriteEnabled` value to `true` for write permissioning.
The write permissioning is applicable for both "Contract Deployment" and "Write Transactions" to the Blockchain.

### How to test write permissioning?

Follow the steps listed below,
```sh
# Change to write authorization dApp
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/permissioning/sample-dapps/write-authorization

# Update the .env file with appropriate VMBC_URL Eg: VMBC_URL="http://x.x.x.x:8545"

# Install dependencies
npm install

# Run the dApp
node testWrite.js
```

## Read Permissioning

### How to enable read permissioning?

For read permissioning, we need `vmbc-ethers.js` which is a modified version of open-source ethersjs. 
In `values.yaml`, under `permissioning` section change `ethPermissioningReadEnabled` value to `true` for read permissioning. User has to enable both read and write permissioning to test "read permissioning".

### How to test read permissioning?
Follow the steps listed below,
```sh
# Change directory into the vmbc-ethers-extension library
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/permissioning/sample-dapps/read-write-authorization/integration-library/vmbc-ethers-extension

# Install dependencies for vmbc-ethers-extension library
npm install

# Change directory to read test dApp
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/permissioning/sample-dapps/read-write-authorization/dapp

# Update the .env file with appropriate VMBC_URL Eg: VMBC_URL="http://x.x.x.x:8545" 

# Install dependencies
npm install

# Run the dApp
node testReadWrite.js
```
#### Details about testReadWrite dApp
- In the testReadWrite.js, enable permissioning flag by calling usePrivatekeyForPermissioning()
- Remember, only admin has the permissions to give permissions to other users, hence for checkPermissions() and addPermissions() functions, you have to use usePrivatekeyForPermissioning(ADMIN_ACCOUNT_PRIVATE_KEY). Other function calls like any read from blockchain or any write to blockchain, you have to use usePrivatekeyForPermissioning(String(accountKeyPair.privateKey)).


### Things to Note
1. For read permissioning, user has to use `vmbc-ethers-extension` library
2. The Metamask and remix tools will NOT work as expected. Because Metamask and Remix are NOT using vmbc-ethers.js
3. Json-rpc-provider is the one which we have tested for read permissioning.

## Troubleshooting Guide
### 1. Permission denied Error
```sh
  code: 'SERVER_ERROR',
  body: '{"error":{"code":-32060,"data":"evm error, status code: -2","message":"Permission denied"},"id":58,"jsonrpc":"2.0"}',
```
#### Solution
You have enabled write permissioning. Make sure the ethereum account you are using to send transactions or deploy contract has the WRITE/DEPLOY permission. 
### 2. Request Not Signed Error
```sh 
  code: 'SERVER_ERROR',
  body: '{"error":{"code":-32602,"message":"Request not signed"},"id":47,"jsonrpc":"2.0"}',
```
#### Solution
You have enabled read permissioning. Make sure you are using `vmbc-ethers-extension` in `package.json` example `"@vmware-blockchain/ethers-extension": "file:../integration-library/vmbc-ethers-extension"`. In addition to that check your DAPP, you should call the setSigningKey() API, example `PROVIDER.setSigningKey({readPermissioningKeyOrEnable: privateKey});` and your DAPP should use JSON RPC provider to interact with Blockchain.

## Reference:
JSON RPC API - https://ethereum.org/en/developers/docs/apis/json-rpc/

JSON RPC Provider Ethers.js - https://docs.ethers.io/v5/api/providers/jsonrpc-provider/

Web3 Provider Ethers.js - https://docs.ethers.io/v5/api/providers/other/#Web3Provider
