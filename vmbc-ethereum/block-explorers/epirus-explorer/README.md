# Sirato for VMWare Blockchain

![alt text](sirato-dashboard.png "Sirato dashboard")

### Overview

Sirato is a data and analytics platform for VMWare Blockchain for Ethereum.

It provides a rich API, and easy to use interface to provide information on the various assets such as tokens, and smart contracts deployed on blockchains. 

### Features

Sirato works by ingesting raw blockchain data and restructuring it to provide information about activity taking place on the blockchain.

This information is presented in its user interface. Sirato provides views of the following blockchain data:

- Accounts
- Blocks
- Transactions
- Smart contracts
- Tokens

By browsing to the relevant tab in Sirato, you are presented with the associated blockchain data.

In addition you can use its search functionality to locate specific accounts, blocks, transactions or contracts by their address or hash.

### Free plan

![alt text](sirato-transactions.png "Sirato transactions")

You can run the developer edition of Sirato for VMWare Blockchain by following the instructions available [here](https://github.com/web3labs/Sirato-free).

```
git clone https://github.com/web3labs/Sirato-free.git
cd Sirato-free
NODE_ENDPOINT=http://<node-ip-address>:<rpc-port>/ docker-compose up
docker-compose pull
```

Where `node-ip-address` is the ip address of the node you are running, and `rpc-port` is the RPC API HTTP port.

You will then be able to access the Sirato instance at http://localhost/

Alternatively, you can use Kubernetes following the instructions [here](https://github.com/web3labs/epirus-free/tree/master/k8s).

### Hosted plans

![alt text](sirato-verified-sourcecode.png "Sirato verified sourcecode")

Web3 Labs provides hosted plans that provides additional functionality including:

- Custom branding and hosting at a custom domain
- Dedicated views of tokens
- Smart contract management and source code upload
- OpenAPI back-end 
- Integrations with business intelligence tools such as Tableau Microsoft PowerBI and Qlik
- Production SLAs
- Large transaction volumes (100,000,000+)

You can view more information on these plans https://www.web3labs.com/blockchain-explorer-sirato-plans, or contact Web3 Labs directly via [hi@web3labs.com](mailto:hi@web3labs.com?subject=Sirato hosted plans).

### Todo: Limitations
- Currently Epirus Explorer does not support running on Apple M1 MAC
  - Find a Link to their issue reference (official)
