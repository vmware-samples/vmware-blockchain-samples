const ethers = require("ethers");

// solc compiler
solc = require("solc");

// file reader
fs = require("fs");

// Get all the config values
require('dotenv').config();

// path
const path = require('path');
const { exit } = require("process");
var crypto = require('crypto');

const READ = 1;
const WRITE = 2;
const DEPLOY = 4;

var VMBC_URL = process.env.VMBC_URL;
var CONTRACT_FILE = String(process.env.CONTRACT_FILE);
var CONTRACT_NAME = path.parse(CONTRACT_FILE).name;

var SAMPLE_CONTRACT_ABI = "";
var SAMPLE_CONTRACT_BYTECODE = "";
var SAMPLE_CONTRACT_ADDRESS = "";

let PROVIDER = new ethers.providers.JsonRpcProvider(VMBC_URL);

let admin1AccountKeyPair = { privateKey: process.env.ADMIN1_PRIVATE_KEY, address: process.env.ADMIN1_ADDRESS, publicKey: process.env.ADMIN1_PUBLIC_KEY };
let user1AccountKeyPair = { privateKey: process.env.USER1_PRIVATE_KEY, address: process.env.USER1_ADDRESS, publicKey: process.env.USER1_PUBLIC_KEY };

const compileContract = async () => {

    // Reading the file
    file = fs.readFileSync(CONTRACT_FILE).toString();

    // input structure for solidity compiler
    var input = {
        language: "Solidity",
        sources: {
            [CONTRACT_FILE]: {
                content: file,
            },
        },

        settings: {
            outputSelection: {
                "*": {
                    '*': ['evm', 'bytecode', 'abi'],
                },
            },
        },
    };
    var output = JSON.parse(solc.compile(JSON.stringify(input)));

    SAMPLE_CONTRACT_ABI = output.contracts[CONTRACT_FILE][CONTRACT_NAME].abi;
    SAMPLE_CONTRACT_BYTECODE = output.contracts[CONTRACT_FILE][CONTRACT_NAME].evm.bytecode.object;
}

const generateAccount = async () => {
    console.log("\x1b[33m%s\x1b[0m", "==================== Create new ethereum account ==================");
    var keyPair = {};
    var id = crypto.randomBytes(32).toString('hex');
    var privateKey = "0x" + id;
    console.log("\x1b[34m%s\x1b[0m", "Private Key:", privateKey);

    var wallet = new ethers.Wallet(privateKey);
    console.log("\x1b[34m%s\x1b[0m", "Address: " + wallet.address);
    console.log("\x1b[34m%s\x1b[0m", "Public Key: " + wallet.publicKey);
    keyPair.privateKey = privateKey;
    keyPair.address = wallet.address;
    keyPair.publicKey = wallet.publicKey;
    console.log("");
    return keyPair;

}

const deployContract = async (keyPair) => {
    console.log("------------------------- DEPLOY Contract -------------------------");

    const nonce = 0;
//    let deployedAddress = ethers.utils.getAddress(ethers.utils.getContractAddress({ from: keyPair.address, nonce }));
//    console.log("\x1b[34m%s\x1b[0m", "Before deployment: Contract Address:  " + deployedAddress);

    let privateKey = String(keyPair.privateKey);
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    let factory = new ethers.ContractFactory(SAMPLE_CONTRACT_ABI, SAMPLE_CONTRACT_BYTECODE, ACCOUNT_WALLET);
    let contract = await factory.deploy({gasLimit: 1000000, gasPrice: 0});
    //let isDeployed = await contract.deployed();
    if (contract.address) {
        console.log("\x1b[34m%s\x1b[0m", "New contract deployed : Contract Address: " + contract.address);
        console.log("");
        return contract.address;
    }
}

const adminDeployContract = async () => {
    await compileContract();
    SAMPLE_CONTRACT_ADDRESS = await deployContract(admin1AccountKeyPair);
}

const userRegisterStart = async () => {
    console.log("------------------------- User Registration Start -------------------------");
    let privateKey = String(user1AccountKeyPair.privateKey);
    let address = user1AccountKeyPair.address;
    let publicKey = user1AccountKeyPair.publicKey;
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);

    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);

    let message = publicKey;
    let messageHash = ethers.utils.keccak256(message);
    let signature = await ACCOUNT_WALLET.signMessage(ethers.utils.arrayify(messageHash));
    let data = await contract.isUserRegister(publicKey, signature);
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
    let admin1PublicKey = ethers.utils.toUtf8Bytes(admin1AccountKeyPair.publicKey);
    let admin2PublicKey = ethers.utils.toUtf8Bytes(admin1AccountKeyPair.publicKey);
    let dataEmail = "ramkri123@gmail.com";
    let userData = {
        email : dataEmail
    };
    let admin1Data = {
        email : dataEmail
    };
    try {
        console.log("\x1b[34m%s\x1b[0m","Encrypt user's publicKey and email...")
        let data00 = await ACCOUNT_WALLET.encrypt(JSON.stringify(userData));
        console.log("\x1b[34m%s\x1b[0m", "Encrypted data is: ", data00);
        console.log("");

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin1's publicKey and email...")
        let data10 = JSON.stringify(admin1Data);
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data10);
        console.log("");

        console.log("\x1b[34m%s\x1b[0m","Encrypt admin2's publicKey and email...")
        let data20 = JSON.stringify(admin1Data);
        console.log("\x1b[34m%s\x1b[0m","Encrypted data is: ", data20);
        console.log("");

        tx = await contractWithSigner.newUserRegisterUserStart(userPublicKey, admin1PublicKey, admin2PublicKey, ethers.utils.toUtf8Bytes(data00), ethers.utils.toUtf8Bytes(data10), ethers.utils.toUtf8Bytes(data20), ethers.utils.toUtf8Bytes(signature));
    } catch (error) {
        console.log("Error while calling userRegisterStart()...");
        console.error(error);
        exit(1);
    }
    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m", "WRITE Transaction hash: " + tx.hash);
        console.log("");
        txr = await PROVIDER.getTransactionReceipt(tx.hash);
        console.log("\x1b[34m%s\x1b[0m", "Transaction Logs...");
        console.log(txr);
        console.log("\n");
        console.log(txr.logs[0]);
        console.log("\n");
        console.log(txr.logs[1]);
        console.log("\n");
        console.log(txr.logs[2]);
    }
   
    // Check if user is registered or not ( at this stage it shouldn't)
    data = await contract.isUserRegister(publicKey, signature);
    if (data == 0) {
        console.log("\x1b[34m%s\x1b[0m", "User " + address + " has not registered.")
    }
    else {
        console.log("\x1b[34m%s\x1b[0m", "User " + address + " has registered.")
        return;
    }
    console.log("");

    await contractWithSigner.newUserRegisterAdminApprove(userPublicKey, admin1PublicKey, admin2PublicKey, ethers.utils.toUtf8Bytes(signature));
   
    console.log("------------------------- Extract publicKey from userIndex -------------------------");
    // Get current user context
    let currentuserIndex = await contract.getCurrentUserIndex();
    currentuserIndex = currentuserIndex.toNumber();
    console.log("\x1b[34m%s\x1b[0m", "currentuserIndex: ", currentuserIndex);

    // Extract publickey from the data 
    let publicKeyBytes = await contract.userIndexToPublickey(0);
    console.log("\x1b[34m%s\x1b[0m", "publicKeyBytes: ", publicKeyBytes);
    const userPublicKeyExtracted = ethers.utils.toUtf8String(publicKeyBytes);
    console.log("\x1b[34m%s\x1b[0m", "userPublicKeyExtracted: ", userPublicKeyExtracted);
    console.log("");
    return;
}

const testNow = async () => {
    await adminDeployContract();
    await userRegisterStart();
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    return true;
}

/*process.argv.forEach((value, index) => {
  console.log(index, value);
});*/

testNow();
