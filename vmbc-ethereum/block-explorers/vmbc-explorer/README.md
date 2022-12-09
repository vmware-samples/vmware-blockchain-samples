# VMware Blockchain Explorer

A web application has been designed and implemented with universal search, block and transaction detail views. The Auto refresh feature will keep the dashboard live with the updated details. The refresh interval is set to disabled by default, and it can be altered as per the needs, and also it can be disabled when it's not needed. The Browser cache feature will keep accumulating the data fetched in local storage, which will prevent duplicate requests to the EthRPC API. It uses Angular With Clarity Design Framework to adhere to VMWare Web Application Standards. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. The explorer will connect to blockchain only when its deployed and configured with a specific instance URL. With the help of cache and auto refresh interval, the interaction between the blockchain and the explorer can be improved further.

## Features
Using the UI, one can navigate and view following data from Blockchain,
- Dashboard containing summary of total number of Blocks and Transactions
- Capability to search for Blocks, Transactions and Accounts
- Blocks Page indexed by block number sequenced based on their creation time. When you click through a block, more details about the block are shown,
  - Timestamp
  - Transaction
  - Size
  - Hash
  - Parent Hash
- Transactions Page sequenced by their Block number and sequenced based on their timestamp. When you click through a transaction, more details about the block are shown,
  - Transaction Hash
  - Timestamp
  - Block Number
  - From and To

## Running VMware Blockchain Explorer

Follow the instructions in [helm-chart/README](./helm-chart/README.md)

## Limitations
- Genesis Block is not shown in UI but counted in Dashboard for Total Number of Transactions and Blocks
