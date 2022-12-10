### How to test read permissioning?

This is read and write permissioning CLI dApp with ethers extension library

1. ```cd ../integration-library/vmbc-ethers-extension``` 
2. ```npm install```
3. In `read-write-authorization/dapp`, make sure you have used right Blockchain URL in .env Eg: VMBC_URL="http://x.x.x.x:8545" 
4. In the testReadWrite.js, enable permissioning flag by calling usePrivatekeyForPermissioning()
5. Remember, only admin has the permissions to give permissions to other users, hence for checkPermissions() and
   addPermissions() functions, you have to use usePrivatekeyForPermissioning(ADMIN_ACCOUNT_PRIVATE_KEY). 
   Other function calls like any read from blockchain or any write to blockchain, you have to use
   usePrivatekeyForPermissioning(String(accountKeyPair.privateKey)).
6. ```npm install```
7. ```node testReadWrite.js```