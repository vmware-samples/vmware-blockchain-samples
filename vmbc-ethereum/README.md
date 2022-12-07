---
home: false
---
# VMware Blockchain Ethereum Overview

VMware Blockchain technology provides enterprise-based companies with an innovative business transformation opportunity by allowing them to build or digitize existing business networks.

The Ethereum technology stack, which contains smart contracts, developer tools, wallets, and an overall ecosystem, is a significant and mature stack to build or digitize existing blockchain networks.

Then why not use the public Ethereum network? Because there are several enterprise-critical gaps that exist in public and permissioned Ethereum platforms despite Ethereum's significance and maturity. For example, limited throughput, lack of robust privacy capabilities without trade-off security, variable transaction costs and finality, and the lack of enterprise-grade services for mission-critical use cases.

VMware Blockchain with the Ethereum ecosystem is built using open enterprise-centric architecture. The solution is an Ethereum Virtual Machine (EVM) compatible decentralized and permissioned infrastructure platform that provides trust, predictable costs, and instant transaction finality while being Byzantine Fault Tolerant.

VMware Blockchain with Ethereum comprises blockchain nodes running the open-source EVM evmone 0.8.2, orchestration utilities, Solidity 0.8.16, and third-party integrations. As a result, developers can construct or extend a platform on any public or private cloud to deploy their DApps and smart contracts leveraging standard tools such as Truffle, HardHat, and integrations with MetaMask Institutional.

## Architecture
VMware Blockchain is an enterprise-grade decentralized trust platform. VMware Blockchain enables you to transact and share data securely. With VMware Blockchain, you can create permissioned decentralized business networks. The decentralized trust platform removes the need to rely on a central repository of data that is a single point of failure.

VMware Blockchain is comprised of one or more Client Nodes and a Replica network. The client nodes provide dApps access to the blockchain data by exposing an Eth RPC interface for sending and receiving requests to/from the Replica Network. The replica network is a network of n replicas (where n=3f+1) that participate in the BFT consensus protocol. Each Replica node has an EVM execution engine and it stores the state in an authenticated key-value ledger.

![VMBC with Ethereum Request Flow](./vmbc-with-ethereum-request-flow.png)

You can refer to the numbers in the diagram and read the corresponding description to learn about each step that describes the VMware Blockchain with Ethereum request flow.

1. The DApp creates and signs a request using a local or an external wallet and awaits a response. The request can be to load a new smart contract, list the existing active smart contracts, or activate a function within a current smart contract. For example, this request can start a smart contract function that fetches a balance that does not change the state or activate a smart contract function that transfers funds from one party to another, which changes the state.
2. The request is created and sent as an ETH JSON RPC request.
3. The Client Service component in the VMware Blockchain Client node receives the request and sends it to the Replica Network. This component controls the consensus and ensures at least 2f+1 replies are received from the Replica Network before responding.
4. The Replica Network receives the requests processed using a BFT consensus algorithm.
5. The EVM execution engine executes these requests on every Replica node. Some requests write new values to the state, which changes the state. The state is captured in an authenticated key-value store on each Replica node in a RocksDB (5.1).
6. After the request execution is completed, 2f+1 signed execution results are returned to the Client node.
7. The Client node validates that the 2f+1 results have been received and then sends them to the application.

VMware Blockchain with Ethereum is currently in Beta and can be deployed on a cloud environment or as a standalone developer kit. It supports the Eth RPC API and enables developers to run Solidity applications seamlessly.

## VMBC Ethereum Beta Sign Up
To get started, [sign up for the beta program here](https://via.vmw.com/3HlJCD). Upon signing the Beta License Agreement form, you will receive an exclusive invite to our VMware Blockchain Beta Slack channel where you can access the developer kit, previous webinar recordings, and other resources. [Sign up](https://via.vmw.com/3HlJCD).

## System Requirements
Follow the links below for more information about System Requirements in different environments,
- [For Minikube](./vmbc-deployment/README.md#system-requirements-for-minikube)
- [For Cloud Deployment](./vmbc-deployment/README.md#system-requirements-for-aws-eks)

## High Level Overview
VMware Blockhain Ethereum Website: [https://vmware-samples.github.io/vmware-blockchain-samples](https://vmware-samples.github.io/vmware-blockchain-samples)

Following is a list of various elements of VMware Blockchain (VMBC) Ethereum,

- VMBC Deployment
    - [VMBC Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
        - VMBC Deployment using Helm
    - [VMBC Deployment with Logging Collector](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)
        - VMBC Deployment using Helm with Logging Collector
- [Permissioning](./permissioning/README.md)
    - Write and Read Permissioning feature with its Sample DApps
- [Privacy](./privacy/README.md)
    - Privacy feature with Private Token Transfer Sample DApp
- Block Explorers
    - [Epirus Explorer](./block-explorers/epirus-explorer/README.md)
        - Epirus is a data and analytics platform for VMBC Ethereum
    - [VMBC Ethereum Block Explorer](./block-explorers/vmbc-explorer/README.md)
        - Display Blocks and Transactions for VMBC Ethereum
- Sample DApps
    - [NFT Platform](./sample-dapps/nft-platform/README.md)
        - Digital Art NFT Platform
    - [ERC20-Swap](./sample-dapps/erc20-swap/README.md)
        - Transfer and Swap ERC20 Tokens

## Quick Start Guide
The following quick start guide provides information on how to deploy VMBC and run applications on it. It also provides sample applications and instructions on how to configure the various features and capabilities that are available on the VMBC Ethereum.

### Deploy VMware Blockchain Ethereum
#### Deployment Options
There are multiple form factor ways to deploy VMware Blockchain Ethereum namely, high level system requirements are provided below,
- [Developer Kit Deployment](./vmbc-deployment/README.md#developer-kit-deployment)
    - [VMBC Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
    - [VMBC Deployment with Logging Collector](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)
- [Cloud Deployment](./vmbc-deployment/README.md#cloud-deployment)
    - [VMBC Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)

### Ethereum Base Features
VMware Blockchain is an enterprise-grade private blockchain based on Ethereum. Therefore, certain VMware Blockchain features must be aligned with the Ethereum ecosystem.

#### Free-Gas Mode
In a public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the gas price based on supply and demand for the network's computational power to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network, making it too expensive for malicious users to spam the network.

VMware Blockchain is a private, permissioned, and managed network. Therefore, it is not required to charge for computation power or protect it from malicious use. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain by default has free-gas mode enabled.

#### VMBC Supported Ethereum JSON RPC API Endpoints
VMware Blockchian Ethereum supports the standard interface for Ethereum clients and Enterprise Ethereum Requirements [API Reference](https://ethereum.org/en/developers/docs/apis/json-rpc)

To explore more details - [Supported API Endpoints](./supported-apis.md)

### Permissioning
Permissioning feature introduces account permissioning in accordance with Enterprise Ethereum Alliance (EEA) specifications. This feature has been designed to work using a pre-deployed [Permissioning Smart Contract](https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-dev-kit/vmbc-ethereum/permissioning/contracts/Permissioning.sol). Following are the two forms of permissioning offered,
- Write Permissioning
    - Write related interactions with VMBC is permissioned
- Read-Write Permissioning
    - Both Read and Write interactions with VMBC is permissioned

Note: Permissioning feature is disabled by default in VMBC. You will have to enable this feature before deploying VMBC

To explore more details - [Permissioning](./permissioning/README.md)

### Privacy
The privacy of digital asset custody is a critical requirement for enterprises as they consider moving to blockchains. This gets exacerbated with Central Bank Digital Currencies where governments want to balance accountability with privacy in order to prevent money laundering or tax fraud. VMBC now provides a solution to this problem. Any ERC20 smart contract can be extended to convert the public tokens to private tokens. These private tokens can be transacted privately, subject to a limit set by the administrator. None, not even the administrator, can see the details of the private transaction, including the source, target or the amount transacted. The platform uses Zero Knowledge Proofs to guarantee that the transaction is valid and ensures that there is no double spending. The privacy solution is currently in Tech Preview - the APIs may change in the future.

To explore more details - [Privacy](./privacy/README.md)

### Security
VMware Blockchain provides several security features to keep blockchain data secure. These security features are supported by the VMware Blockchain platform and are not specific to the Ethereum implementation.

To explore more details - [Security](./security.md)

### Block Explorers
There are two options of Block Explorers,
- [Epirus Explorer](./block-explorers/epirus-explorer/README.md)
    - Developed by Web3Labs
- [VMBC Explorer](./block-explorers/vmbc-explorer/README.md)
    - Developed by VMBC

### Sample DApps
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

## Popular tools to use
- Hardhat
- Truffle
- Remix
- Metamask
- Mythril
- Slither
