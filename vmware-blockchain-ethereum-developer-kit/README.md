# (WIP) VMware Blockchain Ethereum Developer Kit

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

# High Level Overview

Following is a list of various elements of VMware Ethereum Developer Kit

- [Privacy](https://vmware-samples.github.io/vmware-blockchain-samples/privacy/)
    - Privacy in VMware (expand on one-liner)
- Provisioning
    - [Provisioning VMBC Ethereum without Logging](https://vmware-samples.github.io/vmware-blockchain-samples/k8-provisioning/vmbc-four-node-one-client-deployment)
        - Expand without Logging here
    - [Provisioning VMBC Ethereum with Logging](https://vmware-samples.github.io/vmware-blockchain-samples/k8-provisioning/vmbc-four-node-one-client-deployment-with-logging)
        - Expand with Logging here
- [Permissioning](https://vmware-samples.github.io/vmware-blockchain-samples/permissioning)
    - Write and Read Permissioning feature related elements
- [Explorer](https://vmware-samples.github.io/vmware-blockchain-samples/explorer/)
    - Ethereum Block Explorer
- Sample DApps
    - [Artemis](https://vmware-samples.github.io/vmware-blockchain-samples/sample-dapps/artemis/)
        - Digital Art NFT Platform
    - [ERC20-Swap](https://vmware-samples.github.io/vmware-blockchain-samples/sample-dapps/erc20-swap/)
        - DApp to Transfer and Swap ERC20 Tokens

# Popular tools to use with VMware Blockchain Ethereum Developer Kit
Hardhat

Truffle

Remix

Metamask

Mythril