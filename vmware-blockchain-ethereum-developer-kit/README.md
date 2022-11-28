# VMware Blockchain Ethereum Developer Kit

We are so glad that you have found this repository!

The VMware Blockchain team has architected an extensible blockchain platform that is capable of supporting multiple smart contract languages, where each language runs on its own unique execution engine. Back in 2019, VMware Blockchain started first with the Daml smart contract language, highly ideal for mission critical capital market applications. Since then, we have received strong interest to support the Solidity smart contract language, which is targeted at a broad set of use cases that can benefit from the power of blockchain. To support that, VMware Blockchain team integrated the EVMOne Ethereum virtual machine, and voila - you can now run Solidity on VMware Blockchain! 


*** **Please note that the VMware Blockchain Ethereum Developer Kit is under early beta and functionality is subject to change** ***


# Target Persona and Deployment Model
Using the developer kit, Ethereum developer(s) can start developing or porting their existing decentralized applications (dApps) to a single host VMware Blockchain deployment on their local desktop/laptop or Cloud VM. 

# System Requirements 
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   |  Linux Ubuntu® 16.x, 20.x |
|  vCPU             | 4 vCPU or more |
|  RAM              | 12 GB of RAM or more |
|  Disk Space       | 50 GB of free disk space or more |

# Popular tools to use with VMware Blockchain Ethereum Developer Kit
Hardhat

Truffle

Remix

Metamask

Mythril

# Supported JSON-RPC API endpoints
**API reference**: https://ethereum.org/en/developers/docs/apis/json-rpc/
```
eth_accounts

eth_blockNumber

eth_call

eth_chainId (Reference is EIP-695)

eth_estimateGas

eth_gasPrice

eth_getBalance

eth_getBlockByHash

eth_getBlockByNumber

eth_getBlockTransactionCountByHash

eth_getBlockTransactionCountByNumber

eth_getCode

eth_getLogs

eth_getStorageAt

eth_getTransactionByBlockHashAndIndex

eth_getTransactionByBlockNumberAndIndex

eth_getTransactionByHash

eth_getTransactionCount

eth_getTransactionReceipt

eth_sendRawTransaction

eth_sendTransaction

net_listening

net_version
```