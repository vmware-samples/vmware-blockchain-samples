const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
const email = require('./mail');
require('log-timestamp');

const listenUserRegisterStart = async () => {
    
    //  event signature hash
    let eventSignatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)"));
    console.log("Listening for user events......");
    const filter = {
        address: common.REG_CONTRACT_ADDRESS,
        topics: [eventSignatureHash]
    };

   
    common.REG_CONTRACT.on(filter, async (caller, userIndex, userAdminIdentifier, event) => {
        console.log(`Received event: ${event.event}, caller: ${caller}, userIndex: ${userIndex}, userAdminIdentifier:  ${userAdminIdentifier}`);
        // extract topic from the log
        const filter1 = {
            topics: [eventSignatureHash]
        }

        common.REG_CONTRACT = new ethers.Contract(common.REG_CONTRACT_ADDRESS, common.REG_CONTRACT_ABI, common.PROVIDER);

        // TODO: Vijay
        let response = await common.PROVIDER.getLogs(filter1);
        console.log("response is : ", response);
        if (response && response[0].topics[0]) {
            if (response[0].topics[0] == eventSignatureHash ) {
                let publicKey = await common.REG_CONTRACT.userIndexToPublickey(userIndex);
                //got the publicKey as bytes, now get the eamil
                let uData = await common.REG_CONTRACT.userData(publicKey)
                let encryptedEmail = uData.data00;
                let arrayEmail = ethers.utils.arrayify(encryptedEmail);
                console.log("encrypted Email: ", Buffer.from(arrayEmail).toString('utf8'));
                //const message = await ethCrypto.decryptWithPrivateKey();
                // send email with otp
                let response = await email.sendMailNow();
                console.log("email send response: ", response);
    
            }
        }
        
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

const adminOps = async () => {
await deployContract();
await populateContractObject();
await listenUserEvent();
}

adminOps();
