# VMBC Ethereum Security

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