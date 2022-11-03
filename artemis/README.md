# Artemis

## NFT platform on VMware Blockchain.
The goal of this project is to build an NFT platform, conforming to ERC 721 standards, on top of VMware Blockchain (Concord).Developed a client-side application that communicates with VMBC to mint and transfer NFTs. The platform allows users to create digital art NFTs on VMware blockchain by providing a title, an image URL and artist name.

# Setting Up Environment

## Metamask
Download metamask on google chrome and create a wallet. 

Once NFT plaform is up and running make sure to check connection of the account user. If metamask isn't automatically conncected manually connect it to your account. 

## VMware Blockchain

Setup VMware Blockchain as a pre-setup.

## Setup

This UI-app uses Clarity bootstrapping called Ganymede, which had been linked as a submodule, thus submodule update is needed:

```bash
git submodule update --init --recursive
```

Install application dependencies (node v14 preferred)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Close the session and reopen and `nvm` command will be available to your system.

```bash
nvm install 14  # installs node v14
nvm alias default 14 # sets default system node version to 14
```

Install depedencies for contracts and UI:

```bash
npm i  # in project root

cd clarity; # in clarity folder (main UI)
npm i
```

Deploy contracts on VMware Blockchain or any network by configuring and specifying the network.
```bash
npm install hardhat @nomiclabs/hardhat-waffle
# Keep a note of the output of following command which is the contract address
npx hardhat run --network vmbc_local scripts/deploy.js
```

Update the above generated contract address in `./clarity/src/app/main/digital-arts.service.ts` in both the entries of `contractAddrs`

Run NFT Platform on clarity directory
```bash
npm run start
```

Finally go to http://localhost:4200 to interact with the platform.
