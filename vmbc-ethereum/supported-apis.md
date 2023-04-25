# VMware Blockchain Supported Ethereum JSON RPC API Endpoints
VMware Blockchain Ethereum supports the standard interface for Ethereum clients and Enterprise Ethereum Requirements [API Reference](https://ethereum.org/en/developers/docs/apis/json-rpc).<br />
With VMware Blockchain for Ethereum API response returns the method name in addition to the other mandatory fields. An example for net_version API is '{"id":67,"jsonrpc":"2.0","method":"net_version","result":"5000"}'.

 Methods | Description | Input/Output differences | Error Handling differences
| --- | ----------- | -------------- | ---------- | 
| eth_accounts | Returns a list of Client node addresses.| 
| eth_blockNumber | Returns the most recent block number.|
| eth_call | Executes a new message call immediately without creating a transaction on the blockchain.|
| eth_chainId (Reference is EIP-695) | Returns the current network or chain ID.|
| eth_estimateGas | Generates and returns an estimate of how much gas is required for the transaction to complete. The transaction is not added to the blockchain. | Returns fixed value 0x1ffffffffffffe.
| eth_gasPrice | Returns the current price per gas.| Returns fixed value of 0.
| eth_getBalance | Returns the given address account balance.|
| eth_getBlockByHash | Returns the block hash.| | Error message with: <br /> - block hash of invalid length: {"code":-32603,"message":"nibble missing in string"}.<br /> - non-hexadecimal characters provided in block hash: {"code":-32603,"message":"non-hex character"}.  
| eth_getBlockByNumber | Returns the block number.|
| eth_getBlockTransactionCountByHash | Returns the number of block transactions by block matching the given block.| | Error message with: <br /> - hash of invalid length: {"code":-32603,"message":"nibble missing in string"}. <br /> - non-hexadecimal characters provided in hash: {"code":-32603,"message":"non-hex character"}.
| eth_getBlockTransactionCountByNumber | Returns the number of block transactions by matching the given block number.| "pending" treated the same as "latest".
| eth_getCode | Returns code at a given address.| | Error message with: <br /> - address of invalid length: {"code":-32603,"message":"nibble missing in string"}.<br />  - with non-hexadecimal characters provided in address: {"code":-32603,"message":"non-hex character"}.
| eth_getLogs | Returns an array of all logs matching a given filter object.| "pending" treated the same as "latest". Supports single address as a filter parameter and not an array. | | Error message when response of this api contains more than 3k blocks: {"code":-32603,"data":"block range in the given request is not supported, max block range supported is 3000 blocks","message":"Server error"}.
| eth_getStorageAt | Returns the value from a storage position at a given address.| "pending" treated the same as "latest"
| eth_getTransactionByHash | Returns the information about a transaction requested by transaction hash.| | Error message with: <br /> - hash of invalid length: {"code":-32603,"message":"nibble missing in string"}.<br /> - with non-hexadecimal characters provided in hash: {"code":-32603,"message":"non-hex character"}.
| eth_getTransactionReceipt | Returns the receipt of a transaction by transaction hash.| | Error message with: <br /> - hash of invalid length: {"code":-32603,"message":"nibble missing in string"}.<br /> - non-hexadecimal characters are provided in hash: {"code":-32603,"message":"non-hex character"}.
| eth_getTransactionCount | Returns the number of transactions sent from an address. | "pending" treated the same as "latest". | Error message with: <br /> - address of invalid length: {"code":-32603,"message":"nibble missing in string"}.<br /> - non-hexadecimal characters are provided in the address: {"code":-32603,"message":"non-hex character"}.
| eth_sendRawTransaction | Creates a message call transaction or a contract creation for signed transactions.| "To" address as EOA is unsupported.
| eth_subscribe | Subscribe to logs that are included in new imported blocks and match the given filter criteria. This uses the WebSocket interface. | newHeads, newPendingTransactions and syncing are not supported.
| eth_unsubscribe | Cancel a current subscription. This uses the WebSocket interface. |
| eth_newFilter | Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state has changed, call eth_getFilterChanges. Filters are not saved in persistent storage - if a node restarts, the filters will be lost. | Supports single address as a filter parameter and not an array. | Error when maximum filter limit (i.e. 1000) has been reached: {"code":-32603,"data":"Maximum Number of Active Filter Limit reached","message":"Server error: Maximum Number of Active Filter Limit reached"}
| eth_newBlockFilter	| Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call eth_getFilterChanges. Filters are not saved in persistent storage - if a node restarts, the filters will be lost.| | Error when maximum filter limit(i.e. 1000) has been reached:{"code":-32603,"data":"Maximum Number of Active Filter Limit reached","message":"Server error: Maximum Number of Active Filter Limit reached"}.
| eth_uninstallFilter | Uninstalls a filter with given id. Should always be called when watch is no longer needed. Additionally Filters timeout when they aren't requested with eth_getFilterChanges for a period of time which is set 15 minutes for 1.9 Release.|
| eth_getFilterChanges | Polling method for a filter, which returns an array of logs which occurred since last poll. | "pending" treated the same as "latest". | Error with invalid filter_id: {"code":-32602,"data":"filter not found","message":"Invalid Parameters: filter not found"}
| eth_getFilterLogs | Returns an array of all logs matching filter with given id. | "pending" treated the same as "latest". | Error when response of this api contains more than 3k blocks: {"code":-32603,"data":"block range in the given request is not supported, max block range supported is 3000 blocks","message":"Server error"}.<br />  When invalid filter_id has been provided: {"code":-32602,"data":"filter not found","message":"Invalid Parameters: filter not found"}
| net_version | Returns the current network ID.|

 Construct | Description |
| --- | ----------- |
| JSON RPC API Batching | Multiple requests are batched into a single JSON object aligning with [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification) for optimizing the platform's performance.|

## Error Handling - Overall Approach
As per [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification), the "message" field in the error object has a short description of the error, such as "Server error" and the "data" field has an elaborate description of the error. VMware Blockchain for Ethereum error handling overall approach is slightly different from [Ethereum JSON RPC Standard](https://www.jsonrpc.org/specification) for aligning with the popular open ecosystem tools such as Hardhat and integration libraries such as Ethersjs. The "message" field in the error response has both the short decription of the error as per standard and additionally has an elaborate description of the error. An example for eth_getLogs API is "Invalid Parameters: fromBlock/toBlock and blockHash are not compatible, Specify one of them".

## Limitations
- Ethers.js Library v6 version is not supported with VMware Blockchain For Ethereum for below reasons:
  1.  Hardhat does not support Ethers.js v6 version
  2.  Ethers.js v6 version is not production grade yet
  3.  VMBC Ethereum API's and Dapps need to be changed to support Ethers.js v6 version

- eth_newfilter and eth_getLogs APIs support a single address and not a list of addresses as an input parameter
