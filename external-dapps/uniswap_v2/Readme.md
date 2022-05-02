# Deploy Uniswap V2 contracts

This is a Hardhat setup to deploy the necessary contracts of Uniswap v2.

## Get Started

Install packages:

```
npm i
```

Modify the condord ethereum endpoint and private keys as you wish in the `hardhat.config.js` file.

### Deploy the contracts

To deploy the contracts:

```
npx hardhat run --network concord scripts/deploy-uniswap.js
```