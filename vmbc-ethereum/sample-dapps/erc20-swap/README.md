# ERC20-Swap

This is a Ethereum Sample DApp which comes with few pre-deployed ERC20 based smart contracts. Few of the Ethereum Accounts are are pre-supplied with tokens to get started.

## Features
- Transfer two types of ERC20 based Tokens across accounts
   - GST and SCT
- Swap Tokens among these two types with customizable rate
   - SCT to GST
   - GST to SCT

## Pre-requisites
- VMBC has been deployed
- Suggested and Supported Stack
    - MAC Operating System
    - Google Chrome browser
    - Metamask Wallet - [https://metamask.io/](https://metamask.io/)
- Connecting Metamask to VMBC and Reset Accounts - [See Appendix](../../appendix.md#connecting-metamask-to-vmbc)

## Running DApp
There are two ways to run this DApp

### Command Line Based
- This option is only supported for MAC Operating System
- Execute following commands to run the DApp through command line
- At command line, this app defaults to port `3000`

```sh
# Change to Source Directory of ERC20-Swap DApp
cd vmware-blockchain-samples/vmbc-ethereum/sample-dapps/erc20-swap/source/erc20-swap

# Install the dependencies
npm install

# Export the VMBC_URL to the URL of deployed instance of VMware Blockchain
export VMBC_URL=http://127.0.0.1:8545

# Run the DApp
npm run start
```

The DApp website will be available on `http://localhost:3000`

### Helm Based

Follow the instructions in [helm-chart/README](./helm-chart/README.md)

## Using DApp
The accounts mentioned in [Accounts with Tokens](https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-dev-kit/vmbc-ethereum/sample-dapps/erc20-swap/source/erc20-swap/.env) are pre-supplied with tokens. You can use [this guide in Appendix](../../appendix.md#importing-accounts-in-metamask) to import these accounts into your Metamask wallet.

### Transfer Tokens
- Select a token from drop down
- Enter address of an Ethereum Account to which to transfer the tokens
- Enter the amount of tokens to send
- Click on `TRANSFER` button
- Interact with Metamask Pop Up Window to complete this Transaction

### Swap Tokens
- The Token selected on the top of the page acts as From Type for the Swap
- Select the Token to Swap to
- Enter the amount to swap
- Click on `SWAP` button
- Interact with Metamask Pop Up Window to complete this Transaction
