# VMBC Supported Ethereum JSON RPC API Endpoints
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
| eth_getTransactionByHash | Returns the information about a transaction requested by transaction hash.|
| eth_getTransactionCount | Returns the number of transactions sent from an address.|
| eth_getTransactionReceipt | Returns the receipt of a transaction by transaction hash.|
| eth_sendRawTransaction | Creates a message call transaction or a contract creation for signed transactions.|
| eth_subscribe | Subscribe to logs that are included in new imported blocks and match the given filter criteria. This uses the WebSocket interface. |
| eth_unsubscribe | Cancel a current subscription. This uses the WebSocket interface. |
| net_version | Returns the current network ID.|

 Construct | Description |
| --- | ----------- |
| JSON RPC API Batching | Multiple requests are batched into a single JSON object aligning with [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification) for optimizing the platform's performance.|
