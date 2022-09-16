const Greetings = artifacts.require("./Greetings.sol");

module.exports = function(deployer) {
      deployer.deploy(Greetings);
};