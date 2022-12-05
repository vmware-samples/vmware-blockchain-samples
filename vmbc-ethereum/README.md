---
home: false
---
# (WIP) VMware Blockchain Ethereum

We are so glad that you have found this repository!

The VMware Blockchain team has architected an extensible blockchain platform that is capable of supporting multiple smart contract languages, where each language runs on its own unique execution engine. Back in 2019, VMware Blockchain started first with the Daml smart contract language, highly ideal for mission critical capital market applications. Since then, we have received strong interest to support the Solidity smart contract language, which is targeted at a broad set of use cases that can benefit from the power of blockchain. To support that, VMware Blockchain team integrated the EVMOne Ethereum virtual machine, and voila - you can now run Solidity on VMware Blockchain! 

*** **Please note that the VMware Blockchain Ethereum Developer Kit is under early beta and functionality is subject to change** ***

# Target Persona and Deployment Model
Using the developer kit, Ethereum developer(s) can start developing or porting their existing decentralized applications (dApps) to a single host VMware Blockchain deployment on their local desktop/laptop or Cloud VM. 

# System Requirements 
- [For Minikube](./vmbc-deployment/README.md#system-requirements-for-minikube)
- [For Cloud Deployment](./vmbc-deployment/README.md#system-requirements-for-aws-eks)

# High Level Overview

VMware Blockhain Ethereum Website: [https://vmware-samples.github.io/vmware-blockchain-samples](https://vmware-samples.github.io/vmware-blockchain-samples)

Following is a list of various elements of VMware Ethereum Developer Kit

- VMBC Deployment
    - [VMBC Deployment without Logging](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
        - VMBC Deployment using Helm
    - [VMBC Deployment with Logging](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)
        - VMBC Deployment using Helm with Logging
- [Privacy](./privacy/README.md)
    - Privacy feature with Private Token Transfer Sample DApp
- [Permissioning](./permissioning/README.md)
    - Write and Read Permissioning feature with its Sample DApps
- [VMBC Explorer](./block-explorers/vmbc-explorer/README.md)
    - Ethereum Block Explorer
- Sample DApps
    - [NFT Platform](./sample-dapps/nft-platform/README.md)
        - Digital Art NFT Platform
    - [ERC20-Swap](./sample-dapps/erc20-swap/README.md)
        - DApp to Transfer and Swap ERC20 Tokens

# Quick Start Guide
This is a quick start guide to consume VMware Blockchain Ethereum Beta Release. By following this guide you will be able to deploy VMware Blockchain and consume Privacy and Permissioning features, Block Explorers and Sample DApps

## Deploy VMware Blockchain Ethereum
### Form Factor Options
There are multiple form factor ways to deploy VMware Blockchain Ethereum namely, high level system requirements are provided below,
- [Developer Kit Deployment](./vmbc-deployment/README.md#developer-kit-deployment)
- [Cloud Deployment](./vmbc-deployment/README.md#cloud-deployment)

### Deployment Options
There are two options to deploy VMBC Ethereum, one without logging and one with logging,
- [VMBC Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
- [VMBC Deployment with Logging](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)

Note: In terms of features, VMBC Deployment by default has Privacy feature Enabled and Permissioning feature disabled

## Privacy
The privacy of digital asset custody is a critical requirement for enterprises as they consider moving to blockchains. This gets exacerbated with Central Bank Digital Currencies where governments want to balance accountability with privacy in order to prevent money laundering or tax fraud. VMBC now provides a solution to this problem. Any ERC20 smart contract can be extended to convert the public tokens to private tokens.

To explore more details - [Privacy](./privacy/README.md)

## Permissioning
Permissioning feature introduces account permissioning in accordance with Enterprise Ethereum Alliance (EEA) specifications. This feature has been designed to work using a pre-deployed [Permissioning Smart Contract](https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-dev-kit/vmbc-ethereum/permissioning/contracts/Permissioning.sol). Following are the two forms of permissioning offered,
- Write Permissioning
    - Write related interactions with VMBC is permissioned
- Read-Write Permissioning
    - Both Read and Write interactions with VMBC is permissioned

Note: Permissioning feature is disabled by default in VMBC. You will have to enable this feature before deploying VMBC

To explore more details - [Permissioning](./permissioning/README.md)

## Block Explorers
There are two options of Block Explorers,
- [Epirus Explorer](./block-explorers/epirus-explorer/README.md)
    - Developed by Web3Labs
- [VMBC Explorer](./block-explorers/vmbc-explorer/README.md)
    - Developed by VMBC

## Sample DApps
These are Ethereum Sample DApps developed to showcase conformance to various aspects of Ethereum in VMBC. These Sample DApps have been developed in a generic form, such that these can run on any Ethereum based Blockchain. (These have been verified to work in Public Ethereum Testnet such as Goerli) 

Following are the Sample DApps,
- [ERC20 Swap](./sample-dapps/erc20-swap/README.md)
    - During DApp boot up time, it deploys few ERC20 Token Smart Contracts
    - Provides a way to Transfer ERC20 Tokens across accounts
    - Provides a way to Swap across couple of types of ERC20 Tokens across accounts
- [NFT Platform](./sample-dapps/nft-platform/README.md)
    - During DApp boot up time, it deploys ERC721 based Smart Contract
    - Provides a Platform to,
        - Mint NFTs
        - Transfer NFTs across accounts
        - View all NFTs and their History

Few Notes:
- These both Sample DApps are UI based DApps
- To consume these DApps the ports exposed by these DApps should be available to a System with UI

# Popular tools to use
- Hardhat
- Truffle
- Remix
- Metamask
- Mythril
