/*
 * Copyright 2019 VMware, all rights reserved.
 */

const OrdersProxy = artifacts.require("OrdersProxy");
const Orders = artifacts.require("OrdersV1");

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
    const transaction = await orders.create.sendTransaction(web3.fromUtf8('Apples'), 100);
    const orderAddress = await orders.orders.call(0);
    const ordersLength = await orders.getAmount.call();

    expect((new web3.BigNumber(ordersLength)).toString()).to.equal('1');
    expect(orderAddress).to.be.a('string');
  });

  it("should create a 1000 orders", async () => {
    for (let index = 0; index < 100; index++) {
      await orders.create.sendTransaction(web3.fromUtf8('Apples'), index);
    }
    const ordersLength = await orders.getAmount.call();

    expect((new web3.BigNumber(ordersLength)).toString()).to.equal('101');
  });
});
