const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
require('log-timestamp');

const userRegisterStart = async () => {
    console.log("------------------------- User Registration Start -------------------------");
    
    let privateKey = String(process.env.USER1_PRIVATE_KEY);
    let address = process.env.USER1_ADDRESS;
    let publicKey = process.env.USER1_PUBLIC_KEY;
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, common.PROVIDER);

    REG_CONTRACT_ADDRESS = process.argv[2];
    if (REG_CONTRACT_ADDRESS === undefined) {
        console.log("Error: you have to pass contract address as arg 2");
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
    let dataEmail = register.EMAIL;
    let userData = {
        email : dataEmail
    };
    let admin1Data = {
        email : dataEmail
    };
    try {
        console.log("\x1b[34m%s\x1b[0m","Encrypt user's publicKey and email...")
        //let data00 = await ACCOUNT_WALLET.encrypt(JSON.stringify(userData));
        //let data00 = JSON.stringify(userData);
        let data00 = dataEmail;
        console.log("\x1b[34m%s\x1b[0m", "Encrypted data is: ", data00);
        console.log("");
        //let bob = ethCrypto.createIdentity();
        let data00Test = await ethCrypto.encryptWithPublicKey(ethers.utils.arrayify(process.env.ADMIN1_PUBLIC_KEY), data00);
        //console.log("\x1b[34m%s\x1b[0m", "bob privateKey: ", bob.privateKey);
        console.log("\x1b[34m%s\x1b[0m", "Encrypted data is 1: ", data00Test);
        console.log("");

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin1's publicKey and email...")
        let data10 = JSON.stringify(admin1Data);
        let data10Test = await ethCrypto.encryptWithPublicKey(ethers.utils.arrayify(process.env.ADMIN1_PUBLIC_KEY), data00);
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data10Test);
        console.log("");

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin2's publicKey and email...")
        let data20 = JSON.stringify(admin1Data);
        let data20Test = await ethCrypto.encryptWithPublicKey(ethers.utils.arrayify(process.env.ADMIN1_PUBLIC_KEY), data00);
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data20Test);
        console.log("");

        console.log("userPublicKey F --> : ", userPublicKey);
        console.log("adminPublicKey F --> : ", admin1PublicKey);
        tx = await contractWithSigner.newUserRegisterUserStart(userPublicKey, admin1PublicKey, admin2PublicKey, ethers.utils.toUtf8Bytes(ethCrypto.cipher.stringify(data00Test)), ethers.utils.toUtf8Bytes(ethCrypto.cipher.stringify(data10Test)), ethers.utils.toUtf8Bytes(ethCrypto.cipher.stringify(data20Test)), ethers.utils.toUtf8Bytes(signature));
        //tx = await contractWithSigner.newUserRegisterUserStart(userPublicKey, admin1PublicKey, admin2PublicKey, ethers.utils.toUtf8Bytes(JSON.stringify(data00Test)), ethers.utils.toUtf8Bytes( JSON.stringify(data10Test)), ethers.utils.toUtf8Bytes( JSON.stringify(data20Test)), ethers.utils.toUtf8Bytes(signature));
    } catch (error) {
        console.log("Error while calling userRegisterStart()...");
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
        console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    }

}

const registerNow = async () => {
    await userRegisterStart();
}

registerNow();