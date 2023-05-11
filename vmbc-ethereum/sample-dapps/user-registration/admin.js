const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
const email = require('./mail');
require('log-timestamp');

let OTP = {};
const listenUserRegisterStart = async () => {
    
    //  event signature hash
    let eventSignatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)"));
    console.log("Listening for user events......");
    const filter = {
        address: await common.REG_CONTRACT_ADDRESS,
        topics: [eventSignatureHash]
    };

   
    common.REG_CONTRACT.on(filter, async (caller, userIndex, userAdminIdentifier, event) => {
        console.log(`Received event: ${event.event}, caller: ${caller}, userIndex: ${userIndex}, userAdminIdentifier:  ${userAdminIdentifier}`);
        // extract topic from the log
        const filter1 = {
            topics: [eventSignatureHash],
            address: await common.REG_CONTRACT_ADDRESS
        }

        common.REG_CONTRACT = new ethers.Contract(common.REG_CONTRACT_ADDRESS, common.REG_CONTRACT_ABI, common.PROVIDER);

        let ADMIN_WALLET = new ethers.Wallet(process.env.ADMIN1_PRIVATE_KEY, common.PROVIDER);
        const contractWithSigner = common.REG_CONTRACT.connect(ADMIN_WALLET);

        let message = register.admin1AccountKeyPair.publicKey;
        let messageHash = ethers.utils.keccak256(message);
        let signature = await ADMIN_WALLET.signMessage(ethers.utils.arrayify(messageHash));

        // TODO: Vijay
       
        // userIndex --> generated otp
        // match this value in blockchain and approve
        let response = await common.PROVIDER.getLogs(filter1);
        console.log("response is : ", response);
        if (response && response[0].topics[0] && response[0].topics[1]) {
            if (response[0].topics[0] == eventSignatureHash && response[0].topics[1] == 0 ) {
                let publicKey = await common.REG_CONTRACT.userIndexToPublickey(userIndex);
                //got the publicKey as bytes, now get the eamil
                let uData = await common.REG_CONTRACT.userData(publicKey)
                let encryptedEmail = uData.data00;
                let arrayEmail = ethers.utils.arrayify(encryptedEmail);
                let decryptedEmail = Buffer.from(arrayEmail).toString('utf8');
                console.log("decrypted Email: ", decryptedEmail);
                //const message = await ethCrypto.decryptWithPrivateKey();
                // send email with otp
                let otp = await email.generateOtp();
                let response = await email.sendMailNow(otp);
                console.log("email send response: ", response);
                OTP[userIndex] = otp;
            }
        }

        if (response && response[0].topics[0] && response[0].topics[1]) {
            if (response[0].topics[0] == eventSignatureHash && response[0].topics[1] == 1 ) {
                // verify the otp
                let publicKey = await common.REG_CONTRACT.userIndexToPublickey(userIndex);
                console.log("publicKey in Complete: ", publicKey)
                //got the publicKey as bytes, now get the otp
                let uData = await common.REG_CONTRACT.userData(publicKey)
                let encryptedOtp = uData.data01;
                let arrayOtp = ethers.utils.arrayify(encryptedOtp);
                let decryptedOtp = Buffer.from(arrayOtp).toString('utf8');
                console.log("decrypted Otp: ", decryptedOtp);
                console.log("memory Otp: ", OTP[userIndex]);
                // approve the user registration if the OTP matches
                if (OTP[userIndex] == decryptedOtp) {
                    let response = await contractWithSigner.newUserRegisterAdminApprove(publicKey,  ethers.utils.toUtf8Bytes(register.admin1AccountKeyPair.publicKey),  ethers.utils.toUtf8Bytes(register.admin1AccountKeyPair.publicKey), signature);
                    console.log("approve is : ", response);
                    console.log("approved public is : ", publicKey);
                } else {
                    console.log("Error: OTP doens't match!. User registration failed !");
                }
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
