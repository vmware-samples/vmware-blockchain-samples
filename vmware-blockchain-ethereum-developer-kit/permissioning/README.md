## (WIP) Ethereum Permissioning

In the 1.8 release, VMware Blockchain for Ethereum will implement “account permissioning” as a tech preview feature in accordance with the Enterprise Ethereum Alliance (EEA) specifications to provide the necessary tools and granularity to govern actions permitted by accounts on the blockchain. Permissioning in the context of enterprise blockchains is a required feature for our customers as they seek ways to control access to deploy and execute smart contracts running on the blockchain. The account permissioning feature can be enabled during network creation by providing the necessary parameters in the deployment configurations file. The compiled permissioning smart contract and the account(s) that can grant permissions to other addresses should also be included in the genesis file. The “permission admin” user can use a dApp or the permissioning user interface to control which accounts are allowed to send transactions and specify the type of transactions permitted. Types of transaction can be READ, WRITE and DEPLOY permissions to other accounts. The dApp should be the preferred method to grant access to a large number of accounts.

By default in VMBC the permissioning feature is disabled. It means anybody can read and write to blockchain.
The Permissioning smart contract source code is in `vmbc-eth-sdk/contracts/permissioning/Permissioning.sol`.
 
### Permissioning fields in values.yaml:

Users can modify the default values in `values.yaml`. All the fields in `genesisBlock` section will be populated as `genesis.json` for vmbc blockchain.
 * **alloc**: List of admin accounts who can provide the permissions to other users. This field can be modified during blockchain deployment.
 * **permissioningContractAddress**: The permissioning smart contract is pre-deployed during system boot. Note that this field can't be changed.
 * **permissioningContractBin**: The binary of the permissioning smart contract goes here. If user modified the existing permissioning contract, then the user has to update the new binary here.

### How to enable write permissioning?

In `values.yaml`, under "permissioning" section change `ethPermissioningWriteEnabled` value to `true` for write permissioning.
The write permissioning is applicable for both "Contract Deployment" and "Write Transactions" to the Blockchain.

### How to test write permissioning?

1. In `write-permissioning-sample-dapp-cli`, make sure you have used right Blockchain URL in .env Eg: VMBC_URL="http://x.x.x.x:8545" 
2. ```npm install```
3. ```node testWrite.js```

### How to enable read permissioning?

For read permissioning, we need `vmbc-ethers.js` which is a modified version of open-source ethersjs. 
In `values.yaml`, under `permissioning` section change `ethPermissioningReadEnabled` value to `true` for read permissioning. User has to enable both read and write permissioning to test "read permissioning".

### How to test read permissioning?

1. ```cd ../../../integration-libraries/vmbc-ethers.js``` 
2. ```npm install```
3. In `read-write-permissioning-sample-dapp-cli`, make sure you have used right Blockchain URL in .env Eg: VMBC_URL="http://x.x.x.x:8545" 
4. In the testReadWrite.js, enable permissioning flag by calling usePrivatekeyForPermissioning()
5. Remember, only admin has the permissions to give permissions to other users, hence for checkPermissions() and
   addPermissions() functions, you have to use usePrivatekeyForPermissioning(ADMIN_ACCOUNT_PRIVATE_KEY). 
   Other function calls like any read from blockchain or any write to blockchain, you have to use
   usePrivatekeyForPermissioning(String(accountKeyPair.privateKey)).
6. ```npm install```
7. ```node testReadWrite.js```

### How to provide a permission for an user?

1. Make sure you have disabled read permissioning
2. ```cd provide-permission-cli```
3. ```npm install```
4. ``` node providePermission.js etherum-address permissions ``` 

   eg: Give Deploy + Write + Read permissions - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C

   eg: Give Deploy + Write + Read permissions - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C 7

   eg: Give Write + Read          permissions - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C 3

   eg: Give Deploy                permission - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C 4

   eg: Give Write                 permission - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C 2

   eg: Give Read                  permission - node providePermission.js 0x84db9D52796Dc55a8f14B8C2c7328E01c29cc80C 1


### Things to remember for read permissioning
1. For read permissioning, user has to use vmbc-ethers.js
2. The Metamask and remix tools will NOT work as expected. Because Metamask and Remix are NOT using vmbc-ethers.js
3. Json-rpc-provider is the one which we have tested for read permissioning.

### TROUBLESHOOT
1. **Issue**
``` 
reason: 'processing response error',
  code: 'SERVER_ERROR',
  body: '{"error":{"code":-32602,"message":"Request not signed"},"id":47,"jsonrpc":"2.0"}',
```
**Solution** :
you have enabled read permissioning. Make sure you are using `vmbc-ethers.js` in `package.json` example `"@vmware-blockchain/ethers": "file:../../../integration-libraries/vmbc-ethers.js/packages/ethers"`. In addition to that check your DAPP, you should call the setSigningKey() API, example `PROVIDER.setSigningKey({readPermissioningKeyOrEnable: privateKey});` and your DAPP should use JSON RPC provider to interact with Blockchain.

### Reference:
JSON RPC API - https://ethereum.org/en/developers/docs/apis/json-rpc/

JSON RPC Provider Ethers.js - https://docs.ethers.io/v5/api/providers/jsonrpc-provider/

Web3 Provider Ethers.js - https://docs.ethers.io/v5/api/providers/other/#Web3Provider
