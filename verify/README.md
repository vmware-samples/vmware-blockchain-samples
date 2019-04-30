## Flatten Contracts and Upload to VMware blockchain

Install truffle-flattener

```
npm install -g truffle-flattener
```

Flatten contracts

```
mkdir truffle-flattener
truffle-flattener contracts/OrdersV1.sol > truffle-flattener/OrdersV1Flattened.sol
truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol
```

Update the configuration in verify.js with the correct host and basic authentication username and password.

```
  const username = '<username>';
  const password = '<password>';
  const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

  const options = {
    host: "localhost",
    port: 8080,
    path: "/api/concord/contracts/" + address,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    }
  };
```

Verify and upload contracts to Helen
```
npm run verify_contracts:vmware
```