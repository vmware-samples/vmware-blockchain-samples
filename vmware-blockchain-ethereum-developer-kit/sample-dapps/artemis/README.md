# (WIP) Artemis

## NFT platform on VMware Blockchain

The goal of this project is to build an NFT platform, conforming to ERC 721 standards,
on top of VMware Blockchain (Concord).Developed a client-side application that communicates
with VMBC to mint and transfer NFTs. The platform allows users to create digital art NFTs
on VMware blockchain by providing a title, an image URL and artist name.

## Setting Up

### Running VMware Blockchain

VMware Blockchain (Ethereum) must be running and accessible via a valid EthRPC

### Node.js with NVM

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

## Installing Dependencies

Installing the Node.js dependencies is simple:

```bash
npm i 
```

To start the dev site:

```bash
npm run start
```

The dev site will be available on `http://localhost:4200`

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