# Web3j Sample dApp
This is a sample dApp written using Web3j library to serve as a reference implementation to utilize the [Read Authentication and Permissioning](../../../README.md#read-authentication-and-permissioning) feature of VMBC for Ethereum.

- Set the content inside [config file](./sample-dapps/authentication/web3j-dapp/config.json) as per blockchain and related environment,
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
- Maven
- Java

**Steps to run the sample dApp**
```sh
# Change to web3j authentication sample dapp
cd vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/web3js

# Installation
mvn clean install

# Edit the config file as per your enviroment
# Path to config file: vmware-blockchain-samples/vmbc-ethereum/permissioning/sample-dapps/authentication/web3j-dapp/config.json

# Running of the https version
mvn exec:java -Dexec.mainClass=com.vmware.SampleDappHttps

# Running of the wss version
## This just establishes a subscription
mvn exec:java -Dexec.mainClass=com.vmware.SampleDappWss
```