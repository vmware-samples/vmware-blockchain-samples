# Ocean Bound Plastics Contracts

## Build

```bash
docker-compose build
```

## Compile contracts

```bash
docker-compose run obp truffle compile
```
## Deploy Contracts

Open `truffle-config.js` and update the vmbc endpoint, private key and from address.

```javascript
vmbc: {
  provider: () => new HDWalletProvider('<privateKey>', '<endpoint>'),
  network_id: "*",
  from: '<address>'
},
```


Then deploy

```bash
docker-compose run obp truffle migrate --reset --network=vmbc
```

Run deploy anytime you've updated the contracts.  It will deploy new contracts thus a new contract address.  This can easily be found in the build metadata specifically located at `build/contracts/OrdersV1.json` and retrieve the contract address at `networks.5000.address`.


## Dev Environment

To bring up an ethereum developement server (ganache) and simultaneously deploy contracts use the command below.

```bash
docker-compose up
```

To interact with the contracts the eth rpc endpoint will be at `localhost:7545`.

The contract address will be in `build/contracts/OrdersV1.json` at `networks.5777.address`.
