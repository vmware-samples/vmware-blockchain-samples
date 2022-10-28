# Setup Permissioning

## Configure Setup of Permissioning required for Artemis
* `config.json` can be modified for any need of setting up of permissioning

### About `config.json`

* `blockchain`: Specify the endpoint of Blockchain

* `permissioning`: Takes details about the permissioning configured in Blockchain
    * `contractAddress`: Contract address of Permissioning contract (from `genesis.json`)
    * `adminAccount`: Details about the admin account (one of the accounts from `alloc` in `genesis.json`)
        * `address`: Address of the admin account
        * `privateKey`: Private key of the admin account 

* `accounts`: Accounts which need any permissioning handling/setup. This takes an array of accounts with permission details
    * `address`: Address of the account
    * `privateKey`: Private key of the account
    * `permissions` : Permission details
        * `addPermissions`: Permissions needed to be added. Takes "READ", "WRITE" and "DEPLOY" as parameters
        * `removePermissions`: Permissions needed to be removed. Takes "READ", "WRITE" and "DEPLOY" as parameters


## Quick Steps
```sh
# Install required dependency packages
npm install

# Configure config.json

# Run following to setup permissioning
node setup-permissioning.js
```