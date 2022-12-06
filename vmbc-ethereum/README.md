---
home: false
---
# (WIP) VMware Blockchain Ethereum Overview

VMware Blockchain technology provides enterprise-based companies with an innovative business transformation opportunity by allowing them to build or digitize existing business networks.

The Ethereum technology stack, which contains smart contracts, developer tools, wallets, and an overall ecosystem, is a significant and mature stack to build or digitize existing blockchain networks.

Then why not use the public Ethereum network? Because there are several enterprise-critical gaps that exist in public and permissioned Ethereum platforms despite Ethereum's significance and maturity. For example, limited throughput, lack of robust privacy capabilities without trade-off security, variable transaction costs and finality, and the lack of enterprise-grade services for mission-critical use cases.

VMware Blockchain with the Ethereum ecosystem is built using open enterprise-centric architecture. The solution is an Ethereum Virtual Machine (EVM) compatible decentralized and permissioned infrastructure platform that provides trust, predictable costs, and instant transaction finality while being Byzantine Fault Tolerant.

VMware Blockchain with Ethereum comprises blockchain nodes running the open-source EVM evmone 0.8.2, orchestration utilities, Solidity 0.8.16, and third-party integrations. As a result, developers can construct or extend a platform on any public or private cloud to deploy their DApps and smart contracts leveraging standard tools such as Truffle, HardHat, and integrations with MetaMask Institutional.

## Architecture
VMware Blockchain is an enterprise-grade decentralized trust platform. VMware Blockchain enables you to transact and share data securely. With VMware Blockchain, you can create permissioned decentralized business networks. The decentralized trust platform removes the need to rely on a central repository of data that is a single point of failure.

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
Todo(Akhil): Mia is working on the blurb which can be added here. Once recieved, add here.

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

VMware Blockchain is a private, permissioned, and managed network. Therefore, it is not required to charge for computation power or protect it from malicious use. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain supports a free-gas mode.

#### VMBC Supported Ethereum JSON RPC API Endpoints
VMware Blockchian Ethereum supports the standard interface for Ethereum clients and Enterprise Ethereum Requirements [API Reference](https://ethereum.org/en/developers/docs/apis/json-rpc)

 Methods | Description |
| --- | ----------- |
| eth_accounts | Returns a list of Client node addresses.|
| eth_blockNumber | Returns the most recent block number.|
| eth_call | Executes a new message call immediately without creating a transaction on the blockchain.|
| eth_chainId (Reference is EIP-695) | Returns the current network or chain ID.|
| eth_estimateGas | Generates and returns an estimate of how much gas is required for the transaction to complete. The transaction is not added to the blockchain. |
| eth_gasPrice | Returns the current price per gas.|
| eth_getBalance | Returns the given address account balance.|
| eth_getBlockByHash | Returns the block hash.|
| eth_getBlockByNumber | Returns the block number.|
| eth_getBlockTransactionCountByHash | Returns the number of block transactions by block matching the given block.|
| eth_getBlockTransactionCountByNumber | Returns the number of block transactions by matching the given block number.|
| eth_getCode | Returns code at a given address.|
| eth_getLogs | Returns an array of all logs matching a given filter object.|
| eth_getStorageAt | Returns the value from a storage position at a given address.|
| eth_getTransactionByBlockHashAndIndex	 | Returns information about a transaction by block hash and transaction index position.|
| eth_getTransactionByBlockNumberAndIndex | Returns information about a transaction by block number and transaction index position.|
| eth_getTransactionByHash | Returns the information about a transaction requested by transaction hash.|
| eth_getTransactionCount | Returns the number of transactions sent from an address.|
| eth_getTransactionReceipt | Returns the receipt of a transaction by transaction hash.|
| eth_sendRawTransaction | Creates a message call transaction or a contract creation for signed transactions.|
| eth_subscribe | Subscribe to logs that are included in new imported blocks and match the given filter criteria. This uses the WebSocket interface. |
| eth_unsubscribe | Cancel a current subscription. This uses the WebSocket interface. |
| net_listening | Returns true if the Client node is actively listening for network connections.|
| net_version | Returns the current network ID.|

 Construct | Description |
| --- | ----------- |
| JSON RPC API Batching | Multiple requests are batched into a single JSON object aligning with [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification) for optimizing the platform's performance.|

### Permissioning
Permissioning feature introduces account permissioning in accordance with Enterprise Ethereum Alliance (EEA) specifications. This feature has been designed to work using a pre-deployed [Permissioning Smart Contract](https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-dev-kit/vmbc-ethereum/permissioning/contracts/Permissioning.sol). Following are the two forms of permissioning offered,
- Write Permissioning
    - Write related interactions with VMBC is permissioned
- Read-Write Permissioning
    - Both Read and Write interactions with VMBC is permissioned

Note: Permissioning feature is disabled by default in VMBC. You will have to enable this feature before deploying VMBC

To explore more details - [Permissioning](./permissioning/README.md)

### Privacy
The privacy of digital asset custody is a critical requirement for enterprises as they consider moving to blockchains. This gets exacerbated with Central Bank Digital Currencies where governments want to balance accountability with privacy in order to prevent money laundering or tax fraud. VMBC now provides a solution to this problem. Any ERC20 smart contract can be extended to convert the public tokens to private tokens.

To explore more details - [Privacy](./privacy/README.md)

### Security
VMware Blockchain provides several security features to keep blockchain data secure. These security features are supported by the VMware Blockchain platform and are not specific to the Ethereum implementation.

#### Cryptographic Algorithms
VMware Blockchain uses industry-standard cryptographic algorithms for various functions within the product. The functions include key exchange, data integrity, and hashing for digital signatures.

SHA-2 and SHA-3 are cryptographic hash functions used to secure transactions.

The two-way TLS pinned certificate authentication with TLS 1.3, OpenSSL 1:1:1, and secp384r1 curves mechanism secures the communication channels between the Replica and Client nodes. The Read and Write requests are protected for the Replica and Client nodes. 

The BLS multi-signature scheme prevents rogue attacks on the internal Concord-BFT signatures.

#### Replica and Client Node Communication Security
The Client nodes communicate with the Replica network to access the data stored on the Replica nodes. The exchange between the Client and Replica nodes must be secured to avoid malicious attacks. VMware Blockchain implements various cryptographic algorithms to ensure secure communication.

##### Replica Network Security
The communication between the Replica nodes in the network occurs over a TLS connection, authenticated on both sides using pinned certificates. These certificates are installed during the trusted setup phase.

Each Replica node maintains its private keys for signing the Concord-BFT consensus protocol messages and additional keys for signing the execution outcome.

##### Client Node to Replica Node and Vice Versa Security
The connection between the Client and Replica nodes is secured using TLS 1.3.

Each Client node maintains a private authentication key, which allows the Client Nodes to self-authenticate to the Replica node.

##### Client Node Ethrpc API Endpoint Authentication and Security
Ethrpc API endpoint authentication and TLS security are not currently supported in VMware Blockchain.

As a best practice, use a reverse proxy, such as Nginx, in the same network segment.

*Note*: The traffic between the Nginx and Ethrpc API endpoint on the Client node is unencrypted.

#### Key Management
VMware Blockchain uses decentralized key generation and multi-signature schemes.

Each Replica node starts with an assigned set of bootstrap keys during the initial system setup. The operator generates these keys, and they are used by the BFT consensus mechanism to agree on the published keys.

Every Replica node must generate a new set of private and public keys for the system to become operational and handle external requests. The keys must be published to the rest of the Replica Network using the previously assigned bootstrap keys and the consensus mechanism.

After the new key pair is published, the old one is deleted from all the Replica nodes. The new keys are saved on the VMware Blockchain reserved pages.

Every message transmitted on the Replica Network is then signed with the Replica node private key using the multi-signature scheme. To verify the signature, the receiver of the message must know the signing parties' exact order. The receiver also gets a bit-vector of signers with the message transmitted with a multi-signed message.

##### Transaction Signing and Verification
VMware Blockchain with Ethereum supports transaction signing using the same method supported in public Ethereum. The DApp wallet application cryptographically signs transactions. The Replica Network verifies the signature before executing the command.

Transaction signing protects from non-repudiation. This mechanism lets the platform verify that every command originates from the right place so that commands are executed successfully and not rejected by the Replica Network.

##### Replica Node Private and TLS Key Rotation
For security reasons, a system operator must be able to replace the Replica node private and TLS keys. The operation of changing keys is called key rotation. The key rotation operation does not require any downtime. An operator can initiate key rotation of a specific Replica node or rotate the keys for all the Replica nodes using a single command.

The key rotation is initiated from the reconfiguration tool. The private key of the operator signs the request for the key rotation, and the Replica Network validates the signature of the request before execution like any other command. For the operation to be successful, the platform must reach a consensus of N-f Replica nodes.

After the keys are rotated, the operation is logged on-chain, and relevant Replica nodes are informed about the new keys.

#### Authenticated Key-Value Ledger
VMware Blockchain uses a key-value database, RocksDB, for persistent storage. Each Replica node contains RocksDB with the key-value pairs for every number of blocks. A checkpoint is created, and that checkpoint is cryptographically signed by the private key of each Replica node. The VMware Blockchain provides data integrity using a consensus mechanism.

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
