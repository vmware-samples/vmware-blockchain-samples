---
home: false
---
# VMware Blockchain for Ethereum Overview 

VMware Blockchain technology provides enterprise-based companies with an innovative business transformation opportunity allowing them to build or digitize existing business networks.

The Ethereum technology stack contains smart contracts, developer tools, wallets, and an overall ecosystem, a comprehensive stack for building or digitizing existing blockchain networks.

Several enterprise-critical gaps exist in public and permissioned Ethereum platforms despite Ethereum's significance and maturity. For example, limited throughput, lack of robust privacy capabilities without trade-off security, variable transaction costs and finality, and enterprise-grade services for mission-critical use cases.

## Why Use VMware Blockchain for Ethereum? 

The VMware Blockchain technology is built using an open enterprise-centric architecture with an Ethereum Virtual Machine (EVM). As a result, it is a compatible decentralized and permissioned infrastructure platform that provides trust, predictable costs, and instant transaction finality while being Byzantine Fault Tolerant.

VMware Blockchain for Ethereum comprises blockchain nodes running the open-source EVM evmone 0.8.2 version, orchestration utilities, Solidity 0.8.16 version, and third-party integrations. As a result, developers can construct or extend a platform on any public or private cloud to deploy their dApps and smart contracts leveraging standard tools such as Truffle, HardHat, and integrations with MetaMask Institutional.

## Architecture

VMware Blockchain is an enterprise-grade decentralized trust platform that enables you to transact and share data securely. With VMware Blockchain, you can create permissioned decentralized business networks. In addition, the decentralized trust platform removes the need to rely on a central data repository that is a single point of failure.

VMware Blockchain comprises one or more Client Nodes and a Replica Network. The Client nodes provide dApps access to the blockchain data by exposing an ETH JSON RPC interface for sending and receiving requests to and from the Replica Network. The Replica Network is a network of n replicas, where n=3f+1, that participate in the BFT consensus protocol. Each Replica node has an EVM execution engine, which stores the state in an authenticated key-value ledger.

![VMware Blockchain for Ethereum Request Flow](./vmbc-with-ethereum-request-flow.png)

Refer to the numbers in the diagram and read the corresponding description to learn about each step that describes the VMware Blockchain for Ethereum request flow.
1.	The dApp creates and signs a request using a local or an external wallet and awaits a response. The request can vary from loading a new smart contract, listing the existing active smart contracts, or activating a function within a current smart contract. For example, a request can either start a smart contract function that fetches a balance that does not alter the state or activate a smart contract function that transfers funds from one party to another, which changes the state.

2.	The request is created and sent as an ETH JSON RPC request.

3.	The Client Service component in the VMware Blockchain Client node receives the request and sends it to the Replica Network. This component controls the consensus and ensures at least 2f+1 replies are received from the Replica Network before responding.

4.	The Replica Network receives the requests processed using a BFT consensus algorithm.

5.	The EVM execution engine executes these requests on every Replica node. Some requests write new values to the state, which changes the state. The state is captured in an authenticated key-value store on each Replica node in a RocksDB (5.1).

6.	After the request execution is completed, 2f+1 signed execution results are returned to the Client node.

7.	The Client node validates that the 2f+1 results have been received and then sends them to the application.

## Ethereum Concepts
VMware Blockchain is an enterprise-grade private blockchain based on Ethereum. Therefore, certain VMware Blockchain features must be aligned with the Ethereum ecosystem.

#### Free-Gas Mode
In a public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the gas price based on supply and demand for the network's computational power to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network, making it too expensive for malicious users to spam the network.

VMware Blockchain is a private, permissioned, and managed network. Therefore, it is not required to charge for computation power or protect it from malicious use. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain has free-gas mode enabled.

#### Supported Ethereum JSON RPC API Endpoints
VMware Blockchain for Ethereum supports the standard interface for Ethereum clients and Enterprise Ethereum Requirements [API Reference](https://ethereum.org/en/developers/docs/apis/json-rpc). For details, see [Supported API Endpoints](./supported-apis.md).

## Beta Registration
VMware Blockchain for Ethereum is currently in the Beta development stage. Users can deploy the code on a cloud environment or as a standalone developer kit. The product supports the ETH RPC API and enables users to run Solidity applications seamlessly.

To get started, sign up for the [Beta program](https://via.vmw.com/3HlJCD). Upon signing the Beta License Agreement form, you receive an exclusive invite to our VMware  Blockchain Beta Slack channel where you can access the developer kit, previous webinar recordings, and other resources. 

##  Quick Start Guide
This quick start guide provides information on deploying VMware Blockchain for Ethereum and running applications. It also provides sample applications and instructions on configuring the various features and capabilities of VMware Blockchain for Ethereum.

VMware Blockhain for Ethereum Documentation, see [https://vmware-samples.github.io/vmware-blockchain-samples](https://vmware-samples.github.io/vmware-blockchain-samples).

### System Requirements
Make sure that your environment meets the specific system requirements. 
- [Minikube](./vmbc-deployment/README.md#system-requirements-for-minikube)
- [Cloud Deployment](./vmbc-deployment/README.md#system-requirements-for-aws-eks)

### Deployment Options
You can use the developer kit or the cloud option to deploy VMware Blockchain for Ethereum. 
- [Developer Kit Deployment](./vmbc-deployment/README.md#developer-kit-deployment)
    - [VMware Blockchain for Ethereum Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
    - [VMware Blockchain for Ethereum Deployment with Logging Collector](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)
- [Cloud Deployment](./vmbc-deployment/README.md#cloud-deployment)
    - [VMware Blockchain for Ethereum Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)

### Permissioning
Permissioning introduces account permissioning per Enterprise Ethereum Alliance (EEA) specifications. This feature is designed to work using a pre-deployed [Permissioning Smart Contract](https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-dev-kit/vmbc-ethereum/permissioning/contracts/Permissioning.sol). The following forms of permissioning are available:
- Write Permissioning - Write-related interactions with VMware Blockchain for Ethereum are permissioned.
- Read-Write Permissioning - Both read and write interactions with VMware Blockchain for Ethereum are permissioned.

Note: The permissioning is disabled by default. You must enable this feature before deploying VMware Blockchain for Ethereum. For details, see  [Permissioning](./permissioning/README.md).

### Privacy
The privacy of digital asset custody is a critical requirement for enterprises considering adopting blockchain. The requirement gets exacerbated with Central Bank Digital Currencies, where governments want to balance accountability with privacy to prevent money laundering or tax fraud. 

VMware Blockchain for Ethereum addresses this need by supporting any ERC20 smart contract that can be extended to convert public tokens to private tokens. These private tokens can be transacted privately, subject to a limit set by the administrator. 

No one, including the administrator, can view the private transaction details, such as the source, target, or amount transacted. The platform uses Zero Knowledge Proofs to guarantee that the transaction is valid and ensures no double-spending. The privacy solution is currently in Tech Preview, and the APIs might change in future releases. For details, see [Privacy](./privacy/README.md).

### Security
VMware Blockchain for Ethereum provides several security features to keep blockchain data secure. These security features are supported by the VMware Blockchain platform and are not specific to the Ethereum implementation. For details, see details [Security](./security.md).

### Block Explorers
The following options of Block Explorers are available:
- [Epirus Explorer](./block-explorers/epirus-explorer/README.md) - Developed by Web3Labs
- [VMware Blockchain Explorer](./block-explorers/vmbc-explorer/README.md) - Developed by VMware Blockchain for Ethereum

### Sample dApps
The Ethereum sample dApps conform to various aspects of Ethereum in VMware Blockchain. These sample dApps are developed in a generic form to run on any Ethereum-based Blockchain. In addition, the sample dApps have been verified to work in Public Ethereum Testnet such as Goerli.

The sample dApps are UI-based. Therefore, the ports exposed by the sample dApps must be available to a system with UI for the dApps to work.

The following sample dApps are available:
- [ERC20 Swap](./sample-dapps/erc20-swap/README.md)
    - During boot-up, the dApp deploys some ERC20 token Smart Contracts
    - Supports transfer of ERC20 tokens across accounts
    - Supports swap across a couple of types of ERC20 tokens across accounts
- [NFT Platform](./sample-dapps/nft-platform/README.md)
    - During boot-up, the dApp deploys an ERC721-based Smart Contract
    - Provides a platform to mint NFTs, transfer NFTs across accounts, and view all the NFTs and their history

## Developer Tools

You can use the following tools to configure the sample dApps.

- Hardhat
- Truffle
- Remix
- Metamask
- Mythril
- Slither
