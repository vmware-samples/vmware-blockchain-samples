# Hands on with blockchain

### Intro
This is for someone new to smart contracts, solidity, web3 and ethereum technologies to familiarize them self with common patterns for development practices or to get a better understanding of how blockchain and smart contracts work.

## Reference

Main section of the code we will be referring to today is the `./contracts` folder.

[Truffle](https://truffleframework.com/docs/truffle/overview) is a smart contract framework for deploying and migrating contracts

## Setup

Please follow the quick setup with docker setup in the [readme](https://github.com/vmware-samples/vmware-blockchain-samples/blob/master/README.md#quick).

## Lessons

### Access Control

Access control is one of the most common coding patterns because blockchain smart contracts are open to the world and need and the right authority needs to be delegated to the appropriate user.

Lets go and modify the access control by going to the the file `./contracts/OrderAccessControl.sol`

Set the `onlyAuditor` modifier to a 0x address, `address(0)`.  Basically setting it to null.

```
  modifier onlyAuditor() {
    require(
      msg.sender == address(0),
      "Only the Auditor has access."
    );
    _;
  }
```

Now lets reset our contracts again using our docker container

```
docker-compose run supply-chain truffle migrate --reset --network=vmware
```

Now if we go to the UI, create an order, switch to auditor persona, click approve, you will notice there is an error.

```
Error: �y� Only the Auditor has access
```


### Versioning

Versioning is very important in software development, but not so apparent with contracts because they are stateful and immutable.  The truffle framework we are using today allows you to migrate contracts from one to the next but then new contract addresses are created, which becomes problematic because you need to broadcast the new contract address to everyone using it with the newly created contract update.

Proxying a contract is the preferred way to go for contract versioning.  Lets review how to do this.

In the contracts folder we have `OrdersV1.sol` and `OrdersV2.sol`.  `OrdersV1.sol` is already deployed and is being proxied by the `OrdersProxy.sol` contract, but we are going to update it with `OrdersV2.sol`.

Lets go to our `./migrations` folder and create a new file and call it `3_order_update.js`. Now lets point the `OrdersProxy.sol` contract at `OrdersV2.sol`.

Add this to our newly created migrations file.
```
var OrdersProxy = artifacts.require("./OrdersProxy.sol");
var OrdersV2 = artifacts.require("./OrdersV2.sol");

module.exports = function(deployer, network, accounts) {
  let ordersProx,
    ordV2;

  OrdersProxy.deployed()
    .then(orders => {
        ordersProx = orders;
        return deployer.deploy(OrdersV2);
      })
    .then(ordersV2 => {
      ordV2 = ordersV2
      // Upgrading our contract
      return ordersProx.upgradeTo.sendTransaction(ordersUpgraded.address);
      })
    .then(() => {
      // Going to use 
      return OrdersV2.at(ordersProx.address)
      })
    .then(orderV2 => {
        return orderV2.getVersion.call();
      })
    .then(version => {
      console.log(`Our current version is ${version}`);
      });

};
```

Then run our truffle migrate.
```
docker-compose run supply-chain truffle migrate --network=vmware
```

So what happens here, we get our deployed proxy contract, then deploy the order version 2 contract. Then do a trick to use our truffle abi interface, set the `OrdersV2` artifact to our `OrderProxy` address so that we can access it's methods, such as `getVersion`.

### Storage

Document storage is usually frowned upon on public blockchains because it is expensive.  But we will review here how to store a `200kb` json document on our `32kb` block, that isn't very compute intensive.

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



