/*
 * Copyright 2019 VMware, all rights reserved.
 */

const Orders = artifacts.require("Orders");
const Order = artifacts.require("Order");

contract("Orders Test", async accounts => {
  let orders, order, orderAddress;
  const states = [
    'Ordered',
    'Approved',
    'Audited',
    'AtWarehouse',
    'InTransit',
    'Delivered',
    'Revoked'
  ]

  before(async () => {
    // Create an order for testing
    orders = await Orders.deployed();
    await orders.create.sendTransaction(web3.utils.fromUtf8('Apples'), 100);
    orderAddress = await orders.orders.call(0);
    order = await Order.at(orderAddress);
  });

  it("should be owned by the creator and not the contract", async () => {
    const creator = await order.contractCreator.call();

    expect(creator).to.equal(accounts[0]);
  });

  it("should set owners, approve order with status and history updated correctly", async () => {
    const setOwners = await order.setOwners.sendTransaction(
      accounts[0], accounts[0], accounts[0], accounts[0], accounts[0]
    );
    const approve = await order.approve.sendTransaction();
    const record = await order.history.call(0);
    const state = await order.state.call();
    const meta = await order.meta.call();

    expect(setOwners.receipt.status).to.equal(true);
    expect(approve.receipt.status).to.equal(true);
    expect(states[state]).to.equal('Approved');
    expect(web3.utils.toUtf8(meta['product'])).to.equal('Apples')
    expect(web3.utils.BN(meta['amount']).toString()).to.equal('100');
    expect(record['who']).to.equal(accounts[0]);
    expect(web3.utils.toUtf8(record['action'])).to.equal('Approved');
    expect(web3.utils.toUtf8(record['action'])).to.equal('Approved');
    expect(web3.utils.isBN(record['when'])).to.equal(true);
    expect(new Date(web3.utils.isBN(record['when']).toString())).to.be.a('date');
  });

  it("should set owners, but not allow approval because we don't have access", async () => {
    let approve, errorMessage;
    const setOwners = await order.setOwners.sendTransaction(
      accounts[1], accounts[1], accounts[1], accounts[1], accounts[1]
    );

    try {
      approve = await order.approve.sendTransaction();
    } catch (error) {
      errorMessage = error;
    }

    expect(setOwners.receipt.status).to.equal(true);
    expect(approve).to.equal(undefined);
    expect(errorMessage.reason).to.equal('Only the Farmer has access.');
  });

  it("should not allow the order to be approved again", async () => {
    let errorMessage;
    const setOwners = await order.setOwners.sendTransaction(
      accounts[0], accounts[0], accounts[0], accounts[0], accounts[0]
    );

    try {
      await order.approve.sendTransaction();
    } catch (error) {
      errorMessage = error;
    }

    expect(setOwners.receipt.status).to.equal(true);
    expect(errorMessage.reason).to.equal('Invalid state.');
  });

  it("should go through the whole contract flow", async () => {
    let state;

    state = await order.state.call();
    expect(states[state]).to.equal('Approved');

    const validated = await order.validated.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('Audited');

    const storeAuditDocument = await order.storeAuditDocument.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('Audited');

    const warehouseReceivedOrder = await order.warehouseReceivedOrder.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('AtWarehouse');

    const warehouseReleasedOrder = await order.warehouseReleasedOrder.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('AtWarehouse');

    const receivedAndInTransit = await order.receivedAndInTransit.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('InTransit');

    const delivered = await order.delivered.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('Delivered');

    const confirmDelivery = await order.confirmDelivery.sendTransaction();
    state = await order.state.call();
    expect(states[state]).to.equal('Delivered');

    const historyLength = await order.getHistoryLength.call();

    expect(validated.receipt.status).to.equal(true);
    expect(storeAuditDocument.receipt.status).to.equal(true);
    expect(warehouseReceivedOrder.receipt.status).to.equal(true);
    expect(warehouseReleasedOrder.receipt.status).to.equal(true);
    expect(receivedAndInTransit.receipt.status).to.equal(true);
    expect(delivered.receipt.status).to.equal(true);
    expect(confirmDelivery.receipt.status).to.equal(true);
    expect(web3.utils.BN(historyLength).toString()).to.equal('8');
  });

  it("should revoke order", async () => {
    const revoke = await order.revoke.sendTransaction();
    const state = await order.state.call();

    expect(revoke.receipt.status).to.equal(true);
    expect(states[state]).to.equal('Revoked');
  });

  it("should update location and get current location", async () => {
    const locations = [
      ['37.7749 N', '122.4194 W'], // SF
      ['40.7128 N', '74.0060 W'], // NY
      ['51.5074 N', '0.1278 W'] // London
    ];

    locations.forEach(async loc => {
      await order.updateLocation.sendTransaction(
        web3.utils.fromUtf8(loc[0]), web3.utils.fromUtf8(loc[1])
      );
    });

    const locationLength = await order.getLocationLength.call();
    const currentLocation = await order.locationHistory.call(locationLength - 1);

    expect(web3.utils.BN(locationLength).toString()).to.equal('3');
    expect(web3.utils.toUtf8(currentLocation['latitude'])).to.equal(locations[locations.length - 1][0]);
    expect(web3.utils.toUtf8(currentLocation['longitude'])).to.equal(locations[locations.length - 1][1]);
  });

});
