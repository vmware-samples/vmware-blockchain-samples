const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
require('log-timestamp');

const listenUserRegisterStart = async () => {
    
    //  event signature hash
    let eventSignatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)"));
    console.log("Listening for user events......");
    const filter = {
        address: common.REG_CONTRACT_ADDRESS,
        topics: [eventSignatureHash]
    };

    common.REG_CONTRACT.on(filter, (caller, userIndex, userAdminIdentifier, event) => {
        console.log(`Received event: ${event.event}, caller: ${caller}, userIndex: ${userIndex}, userAdminIdentifier:  ${userAdminIdentifier}`);
        // extract topic from the log
        const filter1 = {
            topics: [eventSignatureHash]
        }
        common.PROVIDER.getLogs(filter1).then(response => {
            console.log(response[0].topics[0]);
            if (response[0].topics[0] == eventSignatureHash) {
                /*common.REG_CONTRACT.userIndexToPublickey(userIndex).then(publicKey => {
                    //got the publicKey as bytes, now get the eamil
                    common.REG_CONTRACT.userData(publicKey).then(uData => {
                        let encryptedEmail = uData.data00;
                        // send email with otp
                    });
                });*/
            }
        });

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
