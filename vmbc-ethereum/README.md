---
home: false
---

## Disclaimer: This is a Staging Branch that has Work in Progress items. It is not intended for public consumption

# VMware Blockchain for Ethereum Overview 

VMware Blockchain (VMBC) for Ethereum is an enterprise-grade blockchain platform that powers business ecosystems, digital asset experiences, and dApps.

The Ethereum technology stack — from  Ethereum Virtual Machine (EVM), Solidity smart contracts, APIs, developer tools, and its overall ecosystem — is the broadest and most mature stack on which to build blockchain networks. Yet, there are several critical gaps Ethereum platforms have that make them difficult to use for enterprise use cases, such as lack of robust privacy and scalability for complex workloads, governance mechanisms, and enterprise-class operational support characteristics. To address these gaps, VMware launched VMware Blockchain for Ethereum, available in the beta version. VMware Blockchain for Ethereum is built using open enterprise-centric architecture. The solution is an EVM-compatible decentralized and permissioned infrastructure platform that provides trust, and instant transaction finality while being Byzantine Fault Tolerant.

VMware Blockchain for Ethereum comprises blockchain nodes running the open-source EVM evmone 0.9.1, orchestration utilities, Solidity 0.8.19, and third-party integrations. As a result, developers can build on any public or private cloud to deploy their dApps and smart contracts leveraging standard tools such as Truffle, HardHat, and integrations with MetaMask.

## Architecture

VMware Blockchain for Ethereum is an enterprise-grade decentralized trust platform that enables you to transact and share data securely. With VMware Blockchain, you can create permissioned decentralized business networks. In addition, the decentralized trust platform removes the need to rely on a central data repository that is a single point of failure.

VMware Blockchain comprises one or more Client Nodes and a Validator Network. The Client nodes provide dApps access to the blockchain data by exposing an ETH JSON RPC interface for sending and receiving requests to and from the Validator Network. The Validator Network is a network of n Validator nodes, where n=3f+1, that participate in the BFT consensus protocol (Where f stands for the number of failed validators that the network can seamlessly tolerate without downtime). Each Validator node has an EVM execution engine, which stores the state in an authenticated key-value ledger.

![VMware Blockchain for Ethereum Request Flow](./vmbc-with-ethereum-request-flow.png)

Refer to the numbers in the diagram and read the corresponding description to learn about each step that describes the VMware Blockchain for Ethereum request flow.
1.	The dApp creates and signs a request using a local or an external wallet and awaits a response. The request can vary from loading a new smart contract, listing the existing active smart contracts, or activating a function within a current smart contract. For example, a request can either start a smart contract function that fetches a balance that does not alter the state of the Blockchain or activates a smart contract function that transfers funds from one party to another, which changes the state.

2.	The request is created and sent as an ETH JSON RPC request.

3.	The Client Service component in the VMware Blockchain Client node receives the request and sends it to the Validator Network. This component also ensures that at least 2f+1 replies are received from the Validator Network before sending the response back to the dApp.

4.	The Validator Network receives the requests and processes them using a BFT consensus algorithm.

5.	The EVM execution engine executes these requests on every Validator node. Some requests perform a read operation from the Blockchain state while others write new values. The state is captured in an authenticated key-value store on each Validator node using a [RocksDB](https://rocksdb.org/) (5.1).

6.	After the request execution is completed, 2f+1 execution results are returned to the Client node.

7.	The Client node validates that the 2f+1 results have been received and then send the result to the dApp.

## Ethereum Concepts
VMware Blockchain for Ethereum is an enterprise-grade private blockchain based on Ethereum. Therefore, certain VMware Blockchain for Ethereum features must be aligned with the Ethereum ecosystem.

#### Supported Ethereum JSON RPC API Endpoints
VMware Blockchain for Ethereum supports the standard interface for Ethereum clients and enterprise Ethereum requirements [API Reference](https://ethereum.org/en/developers/docs/apis/json-rpc). For details, see [Supported API Endpoints](./supported-apis.md).

#### Free-Gas Mode
In a public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the gas price based on supply and demand for the network's computational power to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network, making it too expensive for malicious users to spam the network.
VMware Blockchain for Ethereum is a private, permissioned, and managed network. Therefore, charging for computation power or protecting it from malicious use is not required. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain for Ethereum has free-gas mode enabled by default.

## Beta Registration
VMware Blockchain for Ethereum is currently in the Beta development stage. Users can deploy the code on a cloud environment or as a standalone developer kit. The product supports the ETH RPC API and enables users to run Solidity applications seamlessly.

To get started, sign up for the [Beta program](https://via.vmw.com/3HlJCD). Upon signing the Beta License Agreement form, you receive an exclusive invite to our VMware Blockchain Beta Slack channel to access the developer kit, previous webinar recordings, and other resources. 

##  Quick Start Guide
This quick start guide provides information on deploying VMware Blockchain for Ethereum and running applications. It also provides sample applications and instructions on configuring the various features and capabilities of VMware Blockchain for Ethereum.

VMware Blockchain for Ethereum Documentation, see [https://vmware-samples.github.io/vmware-blockchain-samples](https://vmware-samples.github.io/vmware-blockchain-samples).

### System Requirements
Make sure that your environment meets the specific system requirements. 
- [Minikube](./vmbc-deployment/README.md#system-requirements-for-minikube)
- [Cloud Deployment](./vmbc-deployment/README.md#system-requirements-for-aws-eks)

### Deployment Options
You can use the developer kit or the cloud option to deploy VMware Blockchain for Ethereum. 
- [Developer Kit Deployment](./vmbc-deployment/README.md#developer-kit-deployment---system-requirements-and-prerequisites)
    - [VMware Blockchain for Ethereum Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)
    - [VMware Blockchain for Ethereum Deployment with Logging Collector](./vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging/README.md)
- [Cloud Deployment](./vmbc-deployment/README.md#amazon-eks)
    - [VMware Blockchain for Ethereum Deployment](./vmbc-deployment/vmbc-four-node-one-client-deployment/README.md)

### Permissioning
Permissioning allows the blockchain administrator to restrict access to the blockchain to specific accounts. The following forms of permissioning are supported:
- Read permissioning: Administrators restrict access to the blockchain via issuing certificates or JWT tokens to authenticated users/applications. Only users/applications who present a valid certificate/token will be granted access to the blockchain.
- Write permissioning: This feature uses a pre-deployed Permissioning Smart Contract. Users who both have read access and have been granted write access via the permissioning smart contract, can write to or deploy contracts on the blockchain.

Note: Both forms of permissioning are disabled by default, and everyone has both read and write access to the blockchain. You must enable these features before deploying VMware Blockchain for Ethereum. For details, see [Permissioning](https://github.com/vmware-samples/vmware-blockchain-samples/blob/eth-doc/vmbc-ethereum/permissioning/README.md).

### Privacy
The privacy of digital asset custody is a critical requirement for enterprises considering adopting blockchain. The requirement gets exacerbated with Central Bank Digital Currencies, where governments want to balance accountability with privacy to prevent money laundering or tax fraud.
VMware Blockchain for Ethereum addresses this need by supporting any ERC20 smart contract that can be extended to convert public tokens to private tokens. These private tokens can be transacted privately, subject to a limit set by the administrator.
No one, including the administrator, can view the private transaction details, such as the source, target, or amount transacted. The platform uses Zero Knowledge Proofs to guarantee that the transaction is valid and ensures no double-spending. The privacy solution is currently in Tech Preview, and the APIs might change in future releases. For details, see [Privacy](https://github.com/vmware-samples/vmware-blockchain-samples/blob/eth-doc/vmbc-ethereum/privacy/README.md).

### Security
VMware Blockchain for Ethereum provides several security features to secure blockchain data and communication. For details, see details [Security](https://github.com/vmware-samples/vmware-blockchain-samples/blob/eth-doc/vmbc-ethereum/security.md).

### Observability
ADD INTRO HERE + LINK TO THE OBSERVABILITY DOC (ROHINI)

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

- HardHat
- Truffle
- Remix
- Metamask
- Mythril
- Slither
