# (WIP) ERC20-Swap

This is a Ethereum Sample DApp which comes with few pre-deployed ERC20 based tokens. The accounts mentioned in [Accounts with Tokens](.env) are pre-supplied with tokens to get started.

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
- Connecting Metamask to VMBC - [See Appendix](#connecting-metamask-to-vmbc)

## Running DApp
There are two ways to run this DApp

### Command Line Based
- This option is only supported for MAC Operating System
- Execute following commands to run the DApp through command line
- At command line, this app defaults to port `3000`

```sh
# Change to Source Directory of ERC20-Swap DApp
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/vmbc-ethereum/sample-dapps/erc20-swap/source/erc20-swap

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

# Appendix
## Connecting Metamask

Metamask is available on Google Chrome as an extension, and this is a key requirement
to this NFT sample.

If you have never added your blockchain's EthRPC URL and the chain Id (default 5000)
as a separate network on Metamask, you can click on user profile picture to open the
dropdown menu and click `Settings` > `Networks` > `Add Network` > `Add Network Manually`
and provide:

- Network Name: (Can be freely chosen)
- New RPC URL: (Your blockchain's EthRPC URL aka. `VMBC_URL`)
- Chain ID: (Your blockchain's `chainId`, default is usually 5000)
- Currency Symbol: (Can be freely chosen)
- Block explorer URL: (optional)

Metamask might not have connected ever on localhost:4200 site, if this is the case,
you can connect Metamask to the dev site by clicking on `Not Connected` status icon
and clicking `Connect`

## Importing Accounts in Metamask
- [How to Import Accounts in Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#:~:text=Click%20the%20circle%20icon%20at,key%20and%20click%20%E2%80%9CImport%E2%80%9D.)