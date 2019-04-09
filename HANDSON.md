# Hands On with VMware Blockchain

### Introduction

This is for someone to familiarize themselves with smart contracts, solidity, web3, and Ethereum technologies and understand the common patterns for development practices and learn how Blockchain and smart contracts work.

## Reference

The main section of the code we will be referring to today is the `./contracts` folder.

[Truffle](https://truffleframework.com/docs/truffle/overview) is a smart contract framework for deploying and migrating contracts.

## Setup

Please follow the quick setup with docker setup in the [readme](https://github.com/vmware-samples/vmware-blockchain-samples/blob/master/README.md#quick).

## Lessons

The exercises for this session include, defining access control, proxying a smart contract for versioning, and configuring storage.

### Access Control

Access control is one of the most common coding patterns because Blockchain smart contracts are open source and need and the right authority to be delegated to the appropriate user.

Let's modify the access control the file `./contracts/OrderAccessControl.sol`.

Set the `onlyAuditor` modifier from `auditor` to `address(0)`, which sets the modifier to null.

```
  modifier onlyAuditor() {
    require(
      msg.sender == address(0),
      "Only the Auditor has access."
    );
    _;
  }
```

Now let's reset our contracts using our docker container.

```
docker-compose run supply-chain truffle migrate --reset --network=vmware
```

Now if we go to the UI, create an order, switch to the Auditor persona.

Click Approve and you notice an error message.

```
Error: �y� Only the Auditor has access
```


### Versioning

Versioning is very important in software development, but not so apparent with smart contracts because they are stateful and immutable.  The truffle framework we are using today allows you to migrate smart contracts from one to the next. However, new contract addresses are created, which become problematic because you need to broadcast the new smart contract address to everyone using it with the newly updated smart contract information.

Proxying a contract is the preferred way to go for smart contract versioning.  Let's review how to do this.

In the contracts folder we have `OrdersV1.sol` and `OrdersV2.sol`.  `OrdersV1.sol` is already deployed and is being proxied by the `OrdersProxy.sol` smart contract, now we are going to update it with `OrdersV2.sol`.

Open the `./migrations` folder and create a new file called `3_order_update.js`. 

Now let's point the `OrdersProxy.sol` contract at `OrdersV2.sol`.

Add this code to your newly created migrations file.

```
var OrdersProxy = artifacts.require("./OrdersProxy.sol");
var OrdersV2 = artifacts.require("./OrdersV2.sol");

module.exports = function(deployer, network, accounts) {
  let ordersProx,
    ordV2;

  deployer.deploy(OrdersV2)
    .then(o => {
        ordV2 = o;
        return OrdersProxy.deployed()
      })
    .then(proxy => {
      ordersProx = proxy
      // Upgrading our contract to version 2
      return ordersProx.upgradeTo.sendTransaction(ordV2.address);
    });
}

```

Then run our truffle migrate.
```
docker-compose run supply-chain truffle migrate --network=vmware
```

We get our deployed proxy contract and deploy the order version 2 contract. Then do a trick to use our truffle ABI interface, set the `OrdersV2` artifact to our `OrderProxy` address so that we can access the methods, such as `getVersion`.

Open up truffle console and test our new upgraded proxy.
```
docker-compose run supply-chain truffle console  --network=vmware

> let ordersV2, proxy, accounts;
> web3.eth.getAccounts((err, res) => accounts = res);
> OrdersProxy.deployed().then(p => proxy = p);
> OrdersV2.defaults({from: accounts[1]});
> OrdersV2.at(proxy.address).then(o => ordersV2 = o);
> ordersV2.getVersion.call();
```

### Storage

Document storage is usually frowned upon on public blockchains because it is expensive.  But we will review how to store a `200kb` json document on our `32kb` block, that isn't very compute intensive.

Store document
```
  private async inEventStore(order, file) {
    const deflated = pako.deflate(file, { to: 'string' });

    this.docContract = await this.Doc.new();
    await this.docContract.inEvent(deflated);
    return this.storeAuditDocumentOrder(order, this.docContract.address);
  }
```

Get Document
```
  async getDocument(docAddress: string): Promise<any> {
    this.docContract = await this.Doc.at(docAddress);

    return this.docContract.getPastEvents('DocumentEvent', { fromBlock: 0, toBlock: 'latest' })
      .then(events => {
        if (events && events[0] && events[0].returnValues[0]) {
          return pako.inflate(
            events[0].returnValues[0],
            { to: 'string' }
          );
        } else {
          throw Error('Event or document not present');
        }
      });
  }
```



