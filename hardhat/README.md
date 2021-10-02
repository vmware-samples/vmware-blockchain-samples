# Security Token Deployer

This deploys erc20 tokens to VMware blockchain using [hardhat](https://hardhat.org/). More ERC20 token and ERC20 family examples coming soon.


## Getting Started with Metamask and Concord

### Install postgresql for storing smart contract addresses
Follow steps in https://www.linode.com/docs/guides/how-to-install-postgresql-on-ubuntu-16-04/ to install postgres with username "postgres" and password "postgres"

### Configure postgresql for storing smart contract addresses
```bash
su - postgres
psql
postgres=# CREATE EXTENSION hstore;
postgres=# CREATE TABLE contract (id SERIAL PRIMARY KEY, version TEXT, address TEXT, attributes hstore);
postgres=# CREATE INDEX idx_contract_attrs ON contract USING GIN(attributes);
```

### Smart contract address add and search example in postgres
```bash
INSERT INTO contract (version, address, attributes) VALUES ('1', '0xc2b3150D03A3320b6De3F3a3dD0fDA086C384eB5', 'name => "GenericSecurityToken"');
sudo -Hiu postgres -H -- psql -U postgres -c "SELECT address FROM contract WHERE attributes -> 'name' = 'GenericSecurityToken'"
```

### Configure postgresql for storing smart contract addresses
```bash
su - postgres
psql
postgres=# drop table contract;
```

### Install other dependencies including postgres for javascript
```bash
yarn install
yarn add pg
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
