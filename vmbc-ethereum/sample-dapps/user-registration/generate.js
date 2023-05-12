const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
const email = require('./mail');
require('log-timestamp');

const generateAccount = async () => {
    register.generateAccount();
}


generateAccount();
