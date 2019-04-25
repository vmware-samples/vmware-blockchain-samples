## Flatten Contracts and Upload to VMware blockchain

Install truffle-flattener

```
npm install -g truffle-flattener
```

Flatten contracts

```
truffle-flattener contracts/OrdersV1.sol > truffle-flattener/OrdersV1Flattened.sol
truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol
```

Verify and upload contracts to Helen
```
npm run verify_contracts:vmware
```