const ethers = require("ethers");
const register = require('./regUtils');
const common = require('./common');
const ethCrypto = require('eth-crypto');
require('log-timestamp');

const userRegisterConfirm = async () => {
    console.log("------------------------- User Registration Confirm -------------------------");
    const wallet = ethers.Wallet.createRandom();
    console.log(wallet.privateKey);
    console.log(wallet.publicKey);
    console.log(wallet.address);
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
    let userPublicKey = ethers.utils.toUtf8Bytes(publicKey);
    let data = await common.REG_CONTRACT.isUserRegister(userPublicKey, signature);
    console.log("data is: ", data);
    if (data == 0) {
        console.log("\x1b[34m%s\x1b[0m", "User address " + address + " has not registered.")
        console.log("\x1b[34m%s\x1b[0m", "User publickey " + publicKey + " has not registered.")
    }
    else {
        console.log("\x1b[34m%s\x1b[0m", "User address " + address + " has registered.")
        console.log("\x1b[34m%s\x1b[0m", "User publickey " + publicKey + " has registered.")
    }
    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    return;
}

const registerConfirm = async () => {
    await userRegisterConfirm();
}

registerConfirm();