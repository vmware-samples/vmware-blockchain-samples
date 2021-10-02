# Artemis

## NFT platform on VMware Blockchain.
The goal of this project is to build an NFT platform, conforming to ERC 721 standards, on top of VMware Blockchain (Concord).Developed a client-side application that communicates with VMBC to mint and transfer NFTs. The platform allows users to create digital art NFTs on VMware blockchain by providing a title, an image URL and artist name.

# Setting Up Environment

## Metamask
Download metamask on google chrome and create a wallet. 

Once NFT plaform is up and running make sure to check connection of the account user. If metamask isn't automatically conncected manually connect it to your account. 

## Concord

Follow the below link to get VMware Blockchain running on your local computer.

[Concord setup link](https://confluence.eng.vmware.com/pages/viewpage.action?spaceKey=BLOC&title=Eth+Onboarding)

## Setup

Install application dependencies

```bash
npm i -g @jovian/ganymede-clr
```
```bash
npm install
```
Deploy contracts on Concord or any network by specifying network instead of development can use Ganaches or any other network.
```bash
truffle migrate --reset --network=development
```

Deploy contracts on VMware Blockchain
```bash
truffle migrate --reset //Since default network is Concord
```
Run NFT Platform on clarity directory
```bash
gany set
```
```bash
npm install
```
```bash
npm run start
```

Finally go to http://localhost:4200 to interact with the platform. 

