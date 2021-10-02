/*
 * Copyright 2019 VMware, all rights reserved.
 */

const OrdersProxy = artifacts.require("OrdersProxy");
const Orders = artifacts.require("OrdersV1");
const config = require('../config.js');

contract("Orders Test", async accounts => {
  let orders, ordersProxy;

  it("should store and create an order", async () => {
    // MUst change default from account, because AdminUpgrade
    // doesn't allow the admin to make fallback function calls
    await Orders.defaults({from: accounts[1]});
    // Need to set our Orders contract to the Orders Proxy when making
    // calls
    ordersProxy = await OrdersProxy.deployed();
    orders = await Orders.at(ordersProxy.address);

    await ordersProxy.changeAdmin.sendTransaction(accounts[2]);
    const transaction = await orders.create.sendTransaction(web3.utils.fromUtf8('Apples'), 100);
    const orderAddress = await orders.orders.call(config.test.orderIndex);
    const ordersLength = await orders.getAmount.call();
    expect(ordersLength.toString()).to.equal(config.test.orderLength);
    expect(orderAddress).to.be.a('string');
  });

  it("should create a 100 orders", async () => {
    for (let index = 0; index < 100; index++) {
      await orders.create.sendTransaction(web3.utils.fromUtf8('Apples'), index);
    }
    const ordersLength = await orders.getAmount.call();

    expect(ordersLength.toString()).to.equal(config.test.createOrders);
  });
});
