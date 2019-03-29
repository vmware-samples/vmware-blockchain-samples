# Supply Chain dApp

## Intro

This is a demonstration of a supply chain dApp on VMware Blockchain or other ethereum based blockchain.


## Deploy and interact with our contracts.

Please refer to the [truffle documentation](https://truffleframework.com/docs/truffle/overview) for more info.

First update your the truffle-config.js file to point at a deployed blockchain instance

Then deploy the supply chain contracts:

```shell
npm install

truffle migrate
```

Now lets interact with the contracts:

```shell
truffle console
```

In the console:
```shell

# Get our deployed contract
let contract;
Orders.deployed().then(function(c){ contract = c});

# Create an order
contract.create(web3.fromAscii("Apples"), 100);

# Get the order address we just created
contract.orders.call(0)
'0xf0de5c223985434b12b8c858ccfa9b9a309a0251'

# Initialize the order into our ABI
let order = Order.at('0xf0de5c223985434b12b8c858ccfa9b9a309a0251');

# Lets set our owners
order.setOwners.sendTransaction('0xfa1a4c33aa682d34eda15bf772f672edddac13aa', '0xfa1a4c33aa682d34eda15bf772f672edddac13aa', '0xfa1a4c33aa682d34eda15bf772f672edddac13aa', '0xfa1a4c33aa682d34eda15bf772f672edddac13aa', '0xfa1a4c33aa682d34eda15bf772f672edddac13aa');
'0x221030d0af4734a7e8c8dade5cdd945e9940efa35725daaee3315ff908dd108b'

# Approve transaction
order.approve.sendTransaction();
'0xdef210546df026c422f7e1c01785abbf147ec2ae95a7d2a96bf8b8e6edfa345e'

# Get meta data
order.meta.call();
[ '0x4170706c65730000000000000000000000000000000000000000000000000000',
  BigNumber { s: 1, e: 2, c: [ 100 ] },
  false ]

# Make the meta data more readable
 web3.toAscii('0x4170706c65730000000000000000000000000000000000000000000000000000');
'Apples\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'

# Even more readable
web3.toUtf8('0x4170706c65730000000000000000000000000000000000000000000000000000');
'Apples'

```

## Test Contracts

First, make sure ganache is up and running.  Download [here](https://truffleframework.com/ganache) if you don't already have setup.

Then to test, go to the command line and run:

```shell
truffle test
```

## Angular Development

Two flavors for development:

Ganache
```
npm run start:ganache
```

VMware Blockchain
```
npm run start:vmware
```

Before running these servers make sure to update the `proxy.conf.json` file with the path to either ganache or vmware blockchain.

### Dev Server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Style Guide and Overall Structure

Use the angular cli generate commands and this [styleguide](https://angular.io/guide/styleguide#overall-structural-guidelines) for style guidance.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

