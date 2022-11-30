## VMware Blockchain Ethers Extension
- This is an extension of ethers (https://github.com/ethers-io/ethers.js)
- Usage in all aspects remains same, except there is an introduction of new Provider, `VmbcJsonRpcProvider`
- `VmbcJsonRpcProvider` is an extension of `JsonRpcProvider`
- Introduces a new function i.e `setSigningKey()` which can receive signing key to enable read permissioning
- Following usage guide provides an example of usage of provider and its newly introduced function


### Usage Guide

```js
// Using ethers-extension
const ethers = require("@vmware-blockchain/ethers-extension");

// Creating an object of VmbcJsonRpcProvider
providerVmbc = new ethers.providers.VmbcJsonRpcProvider("127.0.0.1:8545");

// Setting signing key for the provider for communicating with VMware Blockchain which has read permissioning enabled
providerVmbc.setSigningKey({readPermissioningKeyOrEnable: "0xf61ac24a7d0af636dbdee18a146afda453df2118e95ff765dbf843620f931722"});
```

For more information about Permissioning and Read Permissioning refer to documentation of [Permissioning](../../permissioning/README.md)