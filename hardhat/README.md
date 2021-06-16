# Security Token Deployer

This deploys erc20 tokens to VMware blockchain using [hardhat](https://hardhat.org/). More ERC20 token and ERC20 family examples coming soon.


## Getting Started with Metamask and Concord

### Install dependencies
```bash
yarn install
```

Make sure you have VMware Concord up and running.  If you don't have it running locally, make sure to update `hardhat.config.ts:networks:concord` to the correct URL path.

### Deploy ERC20 Smart Contracts
```bash
yarn deploy:vmware
```

Let's go to Metamask and transfer coins from our ERC20 application. If you haven't already install Metamask [here](https://metamask.io/).
### Setup Metamask
#### Add the concord network
1. Add the concord network by going to `Settings > Networks > Add Network`
1. Add the network name `Concord`, RPC URL `http://localhost:8545` and Chain Id `5000`
1. Exit out of settings
#### Add accounts
1. Click on the top right avatar button and click import account
1. Open the `hardhat/.env` file and import the three accounts by using the private keys

#### Add tokens
1. On Alice's account token tab click `Add Token`
1. Select the custom token tab
1. Grab one of the token smart contract addresses from the `hardhat/deploy/token-list.json` file.
1. Add this contract address to Metamask.
1. Now, you can start transferring tokens in Metamask.


## Test

```bash
yarn test
```
