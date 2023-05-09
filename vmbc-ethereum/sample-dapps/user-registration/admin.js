const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');

const listenUserRegisterStart = async () => {
    
    //  event signature hash
    let eventSignatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)"));
    console.log("Listening for user events......");
    const filter = {
        address: common.REG_CONTRACT_ADDRESS,
        topics: [eventSignatureHash]
    };

    common.REG_CONTRACT.on(filter, (caller, userIndex, userAdminIdentifier, event) => {
        console.log(`Received event: ${event.event}`);
        console.log(`Received event caller: ${caller}`);
        console.log(`Received event userIndex: ${userIndex}`);
        console.log(`Received event userAdminIdentifier: ${userAdminIdentifier}`);

    });
}

const deployContract = async () => {
    common.REG_CONTRACT_ABI = await register.compileContract();
    common.REG_CONTRACT_ADDRESS = await register.deployContract(register.admin1AccountKeyPair);
    
    console.log("common contract address: ", common.REG_CONTRACT_ADDRESS);
}

const listenUserEvent = async () => {
    await listenUserRegisterStart();
}

const populateContractObject = async () => {
    await register.adminGetRegContract();
}

deployContract();
populateContractObject();
listenUserEvent();
