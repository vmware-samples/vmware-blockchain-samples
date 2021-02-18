const SecurityToken = artifacts.require("SecurityToken");

module.exports = async function (deployer) {
  deployer.deploy(SecurityToken, 'GenericToken', 'GT', 10000000).then(() => {
    deployer.deploy(SecurityToken, 'SecurityToken', 'ST', 10000000);

  });


};
