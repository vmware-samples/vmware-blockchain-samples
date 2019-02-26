/*
 * Copyright 2019 VMware, all rights reserved.
 */

const Orders = artifacts.require("Orders");
const Order = artifacts.require("Order");

contract("Order Test", async accounts => {

  it("should store and create an order", async () => {
    const orders = await Orders.deployed();
    const transaction = await orders.create.sendTransaction(web3.utils.fromUtf8('Apples'), 100);
    const orderAddress = await orders.orders.call(0);
    const ordersLength = await orders.getAmount.call();

    expect(transaction.receipt.status).to.equal(true);
    expect(web3.utils.BN(ordersLength).toString()).to.equal('1');
    expect(orderAddress).to.be.a('string');
  });

  it("should create a 1000 orders", async () => {
    const orders = await Orders.deployed();
    for (let index = 0; index < 1000; index++) {
      await orders.create.sendTransaction(web3.utils.fromUtf8('Apples'), index);
    }
    const ordersLength = await orders.getAmount.call();

    expect(web3.utils.BN(ordersLength).toString()).to.equal('1001');
  });
});
