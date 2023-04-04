# Ethers.js Sample dApp
This is a sample dApp written using Ethers.js library to serve as a reference implementation to utilize the [Read Authentication and Permissioning](../../../README.md#read-authentication-and-permissioning) feature of VMBC for Ethereum.

Set the content inside [config file](./config.json) as per blockchain and related environment,
- Few of the notable parameters,
    - JSON RPC related
        - `jsonrpc` related parameter such as `endpointHost` and `ports` 
    - TLS related
        - `tls.mode` supported is only `serverTLS`
        - Paths to various artifacts
    - Client JWT related
        - `clientJwt.enabled` should be `true`
        - Details related to Authentication Server

**Pre-Requisites**
- Blockchain with the current feature enabled with appropriate components running and reachable from the dApp
- Node.js v16.19.1 (this is the max version supported)
- npm

**Steps to run the sample dApp**
```sh
# Change to lib for authentication sample dapps
cd vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/lib

# Install dependencies
npm install

# Change to ethersjs authentication sample dapp
cd vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/ethersjs

# Install dependencies
npm install

# Edit the config file as per your enviroment
# Path to config file: vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/ethersjs-dapp/config.json

# If using an internal CA based Auth Server, create a bundle of the auth certificate and the ethrpc-ca.crt as follows
cat ../../../../vmbc-deployment/vmbc-sample-deployments/authentication-and-authorization/artifacts-for-dapps/auth-server.crt ../../../../vmbc-deployment/vmbc-sample-deployments/authentication-and-authorization/artifacts-for-dapps/ethrpc-ca.crt > ca-bundle.crt

# Add the above created bundle to NODE_EXTRA_CA_CERTS
export NODE_EXTRA_CA_CERTS=./ca-bundle.crt

# Run the sample dApp
node sample-dapp.js
```