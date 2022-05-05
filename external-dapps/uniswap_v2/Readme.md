# Deploy Uniswap V2 contracts

This is a Hardhat setup to deploy the necessary contracts of Uniswap v2.

## Get Started

Setup

```bash
$ cd external-dapps
$ git clone https://github.com/Uniswap/v2-core.git
$ mv v3-core/contracts/* uniswap_v2/contracts/core/
$ mv v2-periphery/contracts/* uniswap_v2/contracts/core
```

Install packages:

```bash
$ cd uniswap_v2
$ npm i
```

Modify the condord ethereum endpoint and private keys as you wish in the `hardhat.config.js` file.

### Deploy the contracts

To deploy the contracts:

```bash
$ npx hardhat run --network concord scripts/deploy-uniswap.js
```