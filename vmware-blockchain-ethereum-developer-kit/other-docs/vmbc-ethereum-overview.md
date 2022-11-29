# (WIP) VMware Blockchain Ethereum Ecosystem Overview
VMware Blockchain technology provides enterprise-based companies with an innovative business transformation opportunity by allowing them to build or digitize existing business networks. The Ethereum technology stack, which contains smart contracts, developer tools, wallets, and an overall ecosystem, is a significant and mature stack to build or digitize existing blockchain networks. Several enterprise-critical gaps exist in public and permissioned Ethereum platforms despite Ethereum's significance and maturity. For example, limited throughput, lack of robust privacy capabilities without trade-off security, variable transaction costs and finality, and the lack of enterprise-grade services for mission-critical use cases.

VMware Blockchain with the Ethereum ecosystem is built using open enterprise-centric architecture. The solution is an Ethereum Virtual Machine (EVM) compatible decentralized and permissioned infrastructure platform that provides trust, predictable costs, and instant transaction finality while being Byzantine Fault Tolerant.

VMware Blockchain with Ethereum comprises blockchain nodes running the open-source EVM evmone 0.8.2, orchestration utilities, Solidity 0.8.16, and third-party integrations. As a result, developers can construct or extend a platform on any public or private cloud to deploy their DApps and smart contracts leveraging standard tools such Truffle, HardHat, and integrations with MetaMask Institutional. 

# Terminology
VMware Blockchain terminologies and concepts are commonly used throughout product documentation.

| Terminology | Description |
| --- | ----------- |
| Authenticated Key-Value Ledger  | Proves facts about smart contracts on the platform and allows access to a privacy-aware verifiable source of truth. VMware Blockchain stores the state of the blockchain in an authenticated key-value data structure. This data structure is part of the Replica nodes in the Replica network. The authenticated data structure is implemented as a sparse Merkle tree where the application data keys are the tree leaves. Application data keys have metadata allowing the Replica Network to implement privacy controls. |
| Block | Shows results of the executed transactions that have been committed to the blockchain ledger |
| Blockchain | A data structure that holds a group of records. These groups of records create a block, and these blocks are linked using cryptography. Each block contains a cryptographic hash of the previous block. The records are saved as a list of keys and their values, which comprise the state of the blockchain. |
| Client node | Allows sending requests to the Replica Network and receiving the results after running these requests. |
| BFT protocol | This protocol is the communication between the Replica nodes that allows them to synchronize. It is the consensus mechanism used by the replica network. The nodes must agree on which requests are executed, the order of execution, and a process to maintain State Machine on all the Replica nodes. The protocol can tolerate slower Replica nodes than others, disconnected or failing Replica nodes, and even malicious Replica nodes.  |
| Decentralized Applications (DApps) | An application that keeps some or all its state on the blockchain. |
| Ethereum Client APIs  | The Ethereum open-source community builds and maintains various libraries, allowing the user application to connect to and communicate with the Ethereum blockchain. VMware Blockchain supports APIs with the JSON format. |

Todo: More Terms to be added here

# Architecture
VMware Blockchain is an enterprise-grade decentralized trust platform. VMware Blockchain enables you to transact and share data securely. With VMware Blockchain, you can create permissioned decentralized business networks. The decentralized trust platform removes the need to rely on a central repository of data that is a single point of failure.

Figure 1 VMware Blockchain with Ethereum Request Flow

##### Add figure here

You can refer to the numbers in the diagram and read the corresponding description to learn about each step that describes the VMware Blockchain with Ethereum request flow.

1. The DApp creates and signs a request using a local or an external wallet and awaits a response. The request can be to load a new smart contract, list the existing active smart contracts, or activate a function within a current smart contract. For example, this request can start a smart contract function that fetches a balance that does not change the state or activate a smart contract function that transfers funds from one party to another, which changes the state.
2. The request is created and sent as an ETH JSON RPC request.
3. The Client Service component in the VMware Blockchain Client node receives the request and sends it to the Replica Network. This component controls the consensus and ensures at least 2f+1 replies are received from the Replica Network before responding.
4. The Replica Network receives the requests processed using a BFT consensus algorithm.
5. The EVM execution engine executes these requests on every Replica node. Some requests write new values to the state, which changes the state. The state is captured in an authenticated key-value store on each Replica node in a RocksDB (5.1).
6. After the request execution is completed, 2f+1 signed execution results are returned to the Client node.
7. The Client node validates that the 2f+1 results have been received and then sends them to the application.


# Deployment Terminology (Needs Updating)

VMware Blockchain can be deployed on both vSphere as an on-premises solution and Amazon Web Services (AWS) platforms. The Replica nodes operate in an isolated fault domain under the same data center or a different data center belonging to other partners in the network, which significantly increases the fault tolerance. The supported deployment topology is four Replica nodes with one Client node. 

**Note**: The Client node is stateless and does not contain any data. It serves as a connecting gateway for Solidity-based DApps to the VMware Blockchain Replica Network. 

For additional information regarding the deployment topology, see VMware Blockchain deployment topology. 

With the VMware Blockchain Orchestrator application, you can perform the following operations:

Create an Ethereum blockchain deployment that consists of Replica and Client nodes natively on vSphere and EC2 instances. 
Configure the deployment parameters such as the location of nodes, Client node grouping, and monitoring and logging for all the deployed VMware Blockchain

# Security Features
VMware Blockchain provides several security features to keep blockchain data secure. These security features are supported by the VMware Blockchain platform and are not specific to the Ethereum implementation.

## Cryptographic Algorithms
VMware Blockchain uses industry-standard cryptographic algorithms for various functions within the product. The functions include key exchange, data integrity, and hashing for digital signatures.

SHA-2 and SHA-3 are cryptographic hash functions used to secure transactions.

The two-way TLS pinned certificate authentication with TLS 1.3, OpenSSL 1:1:1, and secp384r1 curves mechanism secures the communication channels between the Replica and Client nodes. The Read and Write requests are protected for the Replica and Client nodes. 

The BLS multi-signature scheme prevents rogue attacks on the internal Concord-BFT signatures.

## Replica and Client Node Communication Security
The Client nodes communicate with the Replica network to access the data stored on the Replica nodes. The exchange between the Client and Replica nodes must be secured to avoid malicious attacks. VMware Blockchain implements various cryptographic algorithms to ensure secure communication.

### Replica Network Security
The communication between the Replica nodes in the network occurs over a TLS connection, authenticated on both sides using pinned certificates. These certificates are installed during the trusted setup phase.

Each Replica node maintains its private keys for signing the Concord-BFT consensus protocol messages and additional keys for signing the execution outcome.

### Client Node to Replica Node and Vice Versa Security
The connection between the Client and Replica nodes is secured using TLS 1.3.

Each Client node maintains a private authentication key, which allows the Client Nodes to self-authenticate to the Replica node.

### Client Node Ethrpc API Endpoint Authentication and Security

Ethrpc API endpoint authentication and TLS security are not currently supported in VMware Blockchain.

As a best practice, use a reverse proxy, such as Nginx, in the same network segment.

**Note**: The traffic between the Nginx and Ethrpc API endpoint on the Client node is unencrypted.

## Key Management
VMware Blockchain uses decentralized key generation and multi-signature schemes.

Each Replica node starts with an assigned set of bootstrap keys during the initial system setup. The operator generates these keys, and they are used by the BFT consensus mechanism to agree on the published keys.

Every Replica node must generate a new set of private and public keys for the system to become operational and handle external requests. The keys must be published to the rest of the Replica Network using the previously assigned bootstrap keys and the consensus mechanism.

After the new key pair is published, the old one is deleted from all the Replica nodes. The new keys are saved on the VMware Blockchain reserved pages.

Every message transmitted on the Replica Network is then signed with the Replica node private key using the multi-signature scheme. To verify the signature, the receiver of the message must know the signing parties' exact order. The receiver also gets a bit-vector of signers with the message transmitted with a multi-signed message.

### Transaction Signing and Verification
VMware Blockchain with Ethereum supports transaction signing using the same method supported in public Ethereum. The DApp wallet application cryptographically signs transactions. The Replica Network verifies the signature before executing the command.

Transaction signing protects from non-repudiation. This mechanism lets the platform verify that every command originates from the right place so that commands are executed successfully and not rejected by the Replica Network.

### Replica Node Private and TLS Key Rotation
For security reasons, a system operator must be able to replace the Replica node private and TLS keys. The operation of changing keys is called key rotation. The key rotation operation does not require any downtime. An operator can initiate key rotation of a specific Replica node or rotate the keys for all the Replica nodes using a single command.

The key rotation is initiated from the reconfiguration tool. The private key of the operator signs the request for the key rotation, and the Replica Network validates the signature of the request before execution like any other command. For the operation to be successful, the platform must reach a consensus of N-f Replica nodes.

After the keys are rotated, the operation is logged on-chain, and relevant Replica nodes are informed about the new keys.

## Authenticated Key-Value Ledger
VMware Blockchain uses a key-value database, RocksDB, for persistent storage. Each Replica node contains RocksDB with the key-value pairs for every number of blocks. A checkpoint is created, and that checkpoint is cryptographically signed by the private key of each Replica node. The VMware Blockchain provides data integrity using a consensus mechanism.

# Ethereum Features
VMware Blockchain is an enterprise-grade private blockchain based on Ethereum. Therefore, certain VMware Blockchain features must be aligned with the Ethereum ecosystem.

## VMware Blockchain and Ethereum Genesis File
The VMware Blockchain genesis file defines the first block in the chain. It contains various configurations that define how the blockchain works.

The genesis file is provided as part of the deployment with default values. Therefore, if operators want to change the default values, they should update the genesis file before deployment.

Currently, the available setting is the free gas mode, enabling the ability not to specify gas fees. See Free Gas Mode.

Sample VMware Blockchain genesis file:

**Add Genesis File Example Here**

## EthRPC API Compatability
### JSON RPC API Endpoints
VMware Blockchain with Ethereum supports the EEA (Enterprise Ethereum Alliance) [Client specification standards](https://entethalliance.github.io/client-spec/spec.html#dfn-ethereum-json-rpc-api). The following JSON-RPC API endpoints are supported:

**API reference**: https://ethereum.org/en/developers/docs/apis/json-rpc/

 Terminology | Description |
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

**Todo: More Rows to be Added Above**

### JSON RPC API Batching
Multiple requests are batched into a single JSON object aligning with [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification) for optimizing the platform's performance.

## Free-Gas Mode
In a public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the gas price based on supply and demand for the network's computational power to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network, making it too expensive for malicious users to spam the network.

VMware Blockchain is a private, permissioned, and managed network. Therefore, it is not required to charge for computation power or protect it from malicious use. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain supports a free-gas mode. 

### Enable Free-Gas Mode 
When using the free-gas mode, large contracts do not fail due to lack of gas which is a likely scenario for public Ethereum, and the UI ease of use with tools such as Metamask is enhanced.

Note: Free-gas mode is not enabled by default since some DApps explicitly specify gas.

**Procedure**
1. Access the genesis.json file.
    a. The genesis.json file is located in the descriptors directory in VMware Blockchain Orchestrator deployment. The genesis.json file in the descriptors directory overrides the default genesis.json file.
2. Set the gasLimit parameter in the genesis.json to 0x7FFFFFFFFFFFFFFF to enable the free-gas option.
3. After the genesis.json file is defined,  the DApp should not specify the gas, the gas price, or the gas limit in the send transaction APIs. Instead, the system automatically calculates gas using eth_gasPrice and eth_estimateGas. 