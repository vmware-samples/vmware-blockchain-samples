# NFT Platform

The goal of this project is to build an NFT platform, conforming to ERC 721 standards,
on top of VMware Blockchain (Concord).Developed a client-side application that communicates
with VMware Blockchain to mint and transfer NFTs. The platform allows users to create digital art NFTs
on VMware blockchain by providing a title, an image URL and artist name.

## Pre-requisites
- VMware Blockchain has been deployed
- Suggested and Supported Stack
    - MAC Operating System
    - Google Chrome browser
    - Metamask Wallet - [https://metamask.io/](https://metamask.io/)
- Setting up Metamask for VMware Blockchain
   - Connecting Metamask to VMware Blockchain- [See Appendix](../../appendix.md#connecting-metamask-to-vmbc)
   - Reset Metamask Account - [See Appendix](../../appendix.md#connecting-metamask-to-vmbc)

## Features
- View all NFTs in the Platform
- Mint an NFT
- Transfer an NFT
- View History of an NFT

#### Notes about NFT Platform and Write Permissioning
- NFT Platform Sample DApp supports running with Write Permissioning enabled in VMware Blockchain
- With default Admin Account
   - Both Command Line and Helm Based Running of DApp is supported
- If a non-default Admin Account is used only Command Line Running of DApp is supported

## Running DApp
There are two ways to run this DApp

### Command Line Based
- This option is only supported for MAC Operating System
- Execute following commands to run the DApp through command line
- At command line, this app defaults to port `4200`

#### Installing Node.js with NVM

Node.js version 14.20 and up is preferred. If Node.js is not available in your environment,
you can install it easily with NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

##  ! IMPORTANT: close the bash session and reopen so that the
## `nvm` command can be available in the new and all future sessions.
## If you don't want to close and reopen the terminal, you can run:
## source ~/.bashrc or source ~/.bash_profile to make the nvm command available

nvm install 14.20         # installs node v14
nvm alias default 14.20   # sets default system node version to 14

node -v                   # should print v14.20.X
npm -v                    # should print v6.14.X
```

#### Installing dependencies and running
```sh
# Change to Source Directory of NFT Platform DApp
cd vmware-blockchain-samples/vmbc-ethereum/sample-dapps/nft-platform/source/artemis

# Install the dependencies
npm install

# Export the VMBC_URL to the URL of deployed instance of VMware Blockchain
export VMBC_URL=http://127.0.0.1:8545

# If Write Permissioning is enabled and using non-default Admin Account
vim vmware-blockchain-samples/vmbc-ethereum/sample-dapps/nft-platform/source/artemis/hardhat.config.js
# Edit the accounts section of the network to the private key of your non-default admin account

# Run the DApp
npm run start
```

The DApp website will be available on `http://localhost:4200`

### Helm Based

Follow the instructions in [helm-chart/README](./helm-chart/README.md)

## Using DApp
On the top right corner of the screen you would see Contract with Address. This is the Smart Contract address of this NFT Platform.
### Navigating DApp
Regarding various Tabs in DApp,
- `All NFTs`: shows all the NFTs minted on the NFT Platform
- `Owned NFTs`: showes NFTs owned by you
- `Minted by You`: shows NFTs minted by you
- `Transfered`: shows NFTs transferred by you
### Minting an NFT
- Click on `MINT NEW TOKEN` button on the top right
- On the pop up window,
    - Enter Title of the NFT to be Minted
    - Enter name of the Artist
    - Enter URL of an image
- Click on `MINT` button
- Interact with Metamask Pop Up Window to complete this Transaction
- You would see result of Miniting in a Pop Up Window
    - On Success: you would be able to see transaction details
    - On Failure: you would see appropriate error message

### Transfering an NFT
- Pre-requisite for this operation is to Own an NFT
- Click on any one of your owned NFTs
- Click on `TRANSFER NFT` button
- On the pop up window,
    - Enter the address to which you would like to transfer this NFT
- Click on `TRANSFER` button
- Interact with Metamask Pop Up Window to complete this Transaction
- You would see result of Transfer in a Pop Up Window
    - On Success: you would be able to see transaction details
    - On Failure: you would see appropriate error message

### Details about an NFT
- Click on any of the NFT
- Here you would see details about the NFT such as,
    - NFT Name
    - NFT Artist
    - Current Owner of this NFT
    - Original Minter of this NFT
    - Number of times this NFT was transferred

### Notes about using this DApp when Write Permissioning is enabled:
- If Write Permissioning is enabled, to perform any write based interactions with VMware Blockchain such as Minting an NFT and Transferring an NFT can be only performed when the provided account has Write Permissions. For more information on how to provide Write Permissions to an Ethereum Account, read more about Permissioning [here](../../permissioning/README.md)
