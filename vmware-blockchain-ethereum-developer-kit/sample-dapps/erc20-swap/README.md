# ERC20-Swap

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
minikube service erc20-swap
```

##### Standard Kubernetes Deployment (with External IP support)
```sh
# Use the External IP and the Port provided in the output of following command
kubectl get service erc20-swap-service
```

## Using DApp
This is a Single Page DApp, containing following sections,
   - Transfer
   - Swap
#### Transfer Section
- WIP

#### Swap Section
- WIP

#### Procedure

# Appendix
- [Importing Accounts in Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account#:~:text=Click%20the%20circle%20icon%20at,key%20and%20click%20%E2%80%9CImport%E2%80%9D.)