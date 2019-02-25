var Orders = artifacts.require("./Orders.sol");

module.exports = function(deployer) {
  deployer.deploy(Orders);
};
