# (WIP) ERC20-Swap

This is a Ethereum Sample DApp which comes with few pre-deployed ERC20 based tokens. The accounts mentioned in [Accounts with Tokens](.env) are pre-supplied with tokens to get started.

## Features
- Transfer two types of ERC20 based Tokens across accounts
   - GST and SCT
- Swap Tokens among these two types with customizable rate
   - SCT to GST
   - GST to SCT
## Running DApp
There are two ways to run this DApp

### Command Line Based
- This option is only supported for MAC Operating System
- Execute following commands to run the DApp through command line
- At command line, this app defaults to port `3000`

```sh
# Install the dependencies
npm install

# Export the VMBC_URL to the URL of deployed instance of VMware Blockchain
export VMBC_URL=http://127.0.0.1:8545

# Run the DApp
npm run start
```

The DApp website will be available on `http://localhost:4200`

### Helm Based
#### Deployment
- Pre-requisites
   - Have a running Kuberenetes instance
   - Install Helm (https://helm.sh/docs/intro/install/)
   - Install kubectl (https://kubernetes.io/docs/tasks/tools/#kubectl)

- Once above pre-requisites are met, you can execute following command with replacing of various variables appropriately
   - `<registry-url>`: URL of the Registry containing Docker image of the DApp
   - `<registry-username>`: Username for registry
   - `<registry-password>`: Password for registry
   - `<blockchain-url>`: URL of VMware Blockchain 
```sh
# Helm install the DApp
helm install erc20-swap . --set global.imageCredentials.registry=<registry-url> --set global.imageCredentials.username=<registry-username> --set global.imageCredentials.password=<registry-password> --set global.image.repository=vmbc-eth-erc20-swap --set global.image.tag=<image-tag> --set blockchainUrl=<blockchain-url>
```
#### Reaching UI of the DApp
##### Minkube
```sh
# This command will take the control to the webpage of the DApp in default browser
minikube service erc20-swap-service
```

##### Standard Kubernetes Deployment (with External IP support)
```sh
# Use the External IP and the Port provided in the output of following command
kubectl get service erc20-swap-service
```

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