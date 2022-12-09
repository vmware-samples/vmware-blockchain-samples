# Epirus for VMWare Blockchain

### Overview

Epirus is a data and analytics platform for VMWare Blockchain for Ethereum.

It provides a rich API, and easy to use interface to provide information on the various assets such as tokens, and smart contracts deployed on blockchains. 

### Features

Epirus works by ingesting raw blockchain data and restructuring it to provide information about activity taking place on the blockchain.

This information is presented in its user interface. Epirus provides views of the following blockchain data:

- Accounts
- Blocks
- Transactions
- Smart contracts
- Tokens

By browsing to the relevant tab in Epirus, you are presented with the associated blockchain data.

In addition you can use its search functionality to locate specific accounts, blocks, transactions or contracts by their address or hash.

### Free plan

You can run the developer edition of Epirus for VMWare Blockchain by following the instructions available [here](https://github.com/web3labs/epirus-free).

```
git clone https://github.com/web3labs/epirus-free.git
cd epirus-free
```
#### start epirus
```
docker-compose pull
NODE_ENDPOINT=http://<node-ip-address>:<rpc-port>/ docker-compose up
```
#### stop epirus
```
docker-compose down
```
Where `node-ip-address` is the ip address of the node you are running, and `rpc-port` is the RPC API HTTP port.

You will then be able to access the Epirus instance at [http://localhost/](http://localhost/)

### Hosted plans

Web3 Labs provides hosted plans that provides additional functionality including:
- Custom branding and hosting at a custom domain
- Dedicated views of tokens
- Smart contract management and source code upload
- OpenAPI back-end 
- Integrations with business intelligence tools such as Tableau Microsoft PowerBI and Qlik
- Production SLAs
- Large transaction volumes (100,000,000+)

You can view more information on these plans [https://www.web3labs.com/blockchain-explorer-epirus-plans](https://www.web3labs.com/blockchain-explorer-epirus-plans), or contact Web3 Labs directly via [hi@web3labs.com](mailto:hi@web3labs.com?subject=Epirus hosted plans).
