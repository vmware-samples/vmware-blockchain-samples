/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

var Orders = artifacts.require("./Orders.sol");

module.exports = function(deployer) {
  deployer.deploy(Orders);
};
