# Web3.js Sample dApp
This is a sample dApp written using Web3.js library to serve as a reference implementation to utilize the [Authentication and Read Permissioning](../../../README.md#authentication-and-read-permissioning) feature of VMBC for Ethereum.

- Set the content inside [config file](./sample-dapps/authentication/web3js-dapp/config.json) as per blockchain and related environment,
- Few of the notable parameters,
    - JSON RPC related
        - `jsonrpc` related parameter such as `endpointHost` and `ports` 
    - TLS related
        - `tls.mode` supported are `serverTLS` or `mutualTLS`
        - Paths to various artifacts
    - Client JWT related
        - `clientJwt.enabled` should be `true` if VMBC has tokenAuthentication enabled
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

# Change to web3js authentication sample dapp
cd vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/web3js-dapp
# Install dependencies
npm install

# Edit the config file as per your enviroment
# Path to config file: vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/web3js-dapp/config.json

# If using an internal CA based Auth Server export NODE_EXTRA_CA_CERTS to ca certificate of Auth Server otherwise ignore the variable
export NODE_EXTRA_CA_CERTS=../../../../vmbc-deployment/vmbc-sample-deployments/authentication-and-authorization/artifacts-for-dapps/auth-server.crt

# Run the sample dApp
node sample-dapp.js
```