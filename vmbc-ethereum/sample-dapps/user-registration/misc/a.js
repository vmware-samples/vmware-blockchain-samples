const ethers = require("ethers");

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PersonCreated(uint256,uint256)")));

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)")));
