/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

const OrdersProxy = artifacts.require("OrdersProxy");
const Orders = artifacts.require("OrdersV1");
const OrdersUpgrade = artifacts.require("OrdersV2");
const OrderUpgrade = artifacts.require("OrderV2");
const config = require('../config.js');

contract("Upgrade Test", async accounts => {
  let orders, ordersUpgraded, orderUpgraded, ordersProxy;

  it("should upgrade to version 2", async () => {
    await Orders.defaults({ from: accounts[0] });
    // Need to set our Orders contract to the Orders Proxy when making
    // calls
    ordersProxy = await OrdersProxy.deployed();
    orders = await Orders.at(ordersProxy.address);
    ordersUpgraded = await OrdersUpgrade.new();
    await ordersProxy.upgradeTo.sendTransaction(
      ordersUpgraded.address, {from: accounts[config.test.accountIndex]}
    );


    // Switch to Orders proxy contract, with OrdersV2 ABI
    await OrdersUpgrade.defaults({ from: accounts[1] });
    ordersUpgraded = await OrdersUpgrade.at(ordersProxy.address);

    const version = await ordersUpgraded.getVersion.call();

    expect(version).to.equal("2.0");
  });

  it("the newly created order should be the upgraded order contract", async () => {
    await ordersUpgraded.create.sendTransaction(web3.utils.fromUtf8('Apples'), 100);

    const ordersLength = await ordersUpgraded.getAmount.call();
    orderAddress = await ordersUpgraded.orders.call(ordersLength - 1);
    orderUpgraded = await OrderUpgrade.at(orderAddress);

    const testString = await orderUpgraded.testUpgrade.call();
    expect(testString).to.equal('hello world');
  });
});
