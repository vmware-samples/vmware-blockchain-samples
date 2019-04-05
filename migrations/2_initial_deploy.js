/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

var OrdersProxy = artifacts.require("./OrdersProxy.sol");
var Orders = artifacts.require("./OrdersV1.sol");
var Document = artifacts.require("./Document.sol");

module.exports = function(deployer, network, accounts) {
  let proxyContract;

  deployer.deploy(Orders)
    .then(contract => {
      console.log("Deploying proxy contract");
      return deployer.deploy(OrdersProxy, contract.address);
    })
    .then(contract => {
      proxyContract = contract;
      console.log("Deployed at ", proxyContract.address);
      return proxyContract
    });
};
