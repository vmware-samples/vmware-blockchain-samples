const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
require('log-timestamp');

const userRegisterComplete = async () => {
    console.log("------------------------- User Registration Complete -------------------------");
    let privateKey = String(common.privateKey);
    let address = common.address;
    let publicKey = common.publicKey;
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, common.PROVIDER);

    REG_CONTRACT_ADDRESS = process.argv[2];
    if (REG_CONTRACT_ADDRESS === undefined) {
        console.log("Error: you have to pass contract address as arg 2");
        process.exit(1);
    }

    OTP = process.argv[3];
    if (OTP === undefined) {
        console.log("Error: you have to pass OTP as arg 3");
        process.exit(1);
    }

 
    common.REG_CONTRACT = new ethers.Contract(REG_CONTRACT_ADDRESS, common.REG_CONTRACT_ABI, common.PROVIDER);
    const contractWithSigner = common.REG_CONTRACT.connect(ACCOUNT_WALLET);

    let message = publicKey;
    let messageHash = ethers.utils.keccak256(message);
    let signature = await ACCOUNT_WALLET.signMessage(ethers.utils.arrayify(messageHash));
    let data = await common.REG_CONTRACT.isUserRegister(publicKey, signature);
    if (data == 0) {
        console.log("\x1b[34m%s\x1b[0m", "User address " + address + " has not registered.")
        console.log("\x1b[34m%s\x1b[0m", "User publickey " + publicKey + " has not registered.")
    }
    else {
        console.log("\x1b[34m%s\x1b[0m", "User address " + address + " has registered.")
        console.log("\x1b[34m%s\x1b[0m", "User publickey " + publicKey + " has registered.")
        return;
    }
    console.log("");

    let tx = "";
    let userPublicKey = ethers.utils.toUtf8Bytes(publicKey);
    let admin1PublicKey = ethers.utils.toUtf8Bytes(register.admin1AccountKeyPair.publicKey);
    let admin2PublicKey = ethers.utils.toUtf8Bytes(register.admin1AccountKeyPair.publicKey);

    console.log(userPublicKey, admin1PublicKey, admin2PublicKey);

    try {
        console.log("\x1b[34m%s\x1b[0m","Encrypt user's publicKey and OTP...")
        //let data00 = await ACCOUNT_WALLET.encrypt(JSON.stringify(userData));
        //let data00 = JSON.stringify(userData);
        let data01 = OTP;
        let admin1Data = OTP; 
        console.log("\x1b[34m%s\x1b[0m", "Encrypted data is: ", data01);
        console.log("");
        /*let bob = ethCrypto.createIdentity();
        let data00Test = await ethCrypto.encryptWithPublicKey(bob.publicKey, JSON.stringify(userData));
        console.log("\x1b[34m%s\x1b[0m", "bob privateKey: ", bob.privateKey);
        console.log("\x1b[34m%s\x1b[0m", "Encrypted data is 1: ", data00Test);
        console.log("");*/

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin1's publicKey and OTP...")
        let data11 = admin1Data;
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data11);
        console.log("");

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin2's publicKey and OTP...")
        let data21 = admin1Data;
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data21);
        console.log("");

        tx = await contractWithSigner.newUserRegisterUserComplete(userPublicKey, admin1PublicKey, admin2PublicKey, Buffer.from(data01, 'utf8'), ethers.utils.toUtf8Bytes(data11), ethers.utils.toUtf8Bytes(data21), ethers.utils.toUtf8Bytes(signature));
    } catch (error) {
        console.log("Error while calling userRegisterComplete()...");
        console.error(error);
        process.exit(1);
    }

    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m", "WRITE Transaction hash: " + tx.hash);
        console.log("");
        txr = await common.PROVIDER.getTransactionReceipt(tx.hash);
        console.log("\x1b[34m%s\x1b[0m", "Transaction Logs...");
        console.log(txr);
        console.log("\n");
        console.log(txr.logs[0]);
        console.log("\n");
        console.log(txr.logs[1]);
        console.log("\n");
        console.log(txr.logs[2]);
        console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");

    }

}

const registerComplete = async () => {
    await userRegisterComplete();
}

registerComplete();