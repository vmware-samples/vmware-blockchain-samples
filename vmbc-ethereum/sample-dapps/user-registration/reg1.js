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
    console.log("------------------------- DEPLOY Test -------------------------");

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
    let privateKey = String(user1AccountKeyPair.privateKey);
    let address = user1AccountKeyPair.address;
    let publicKey = user1AccountKeyPair.publicKey;
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);

    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);

    let message = publicKey;
    let hash = ethers.utils.keccak256(message);
    let signature = await ACCOUNT_WALLET.signMessage(ethers.utils.arrayify(hash));
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
    try {
    //function newUserRegisterUserStart(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory data1, bytes memory data2, bytes memory data3, bytes memory signature) public {
    // remove 0x from the key    
        let arg1 = ethers.utils.toUtf8Bytes(publicKey.substring(2));
        let arg2 = ethers.utils.toUtf8Bytes(admin1AccountKeyPair.publicKey.substring(2));
        let arg3 = ethers.utils.toUtf8Bytes(admin1AccountKeyPair.publicKey.substring(2));
        let dataEmail = "ramkri123@gmail.com";
        let data00 = ethers.utils.crypto.encryptWithPublicKey(publicKey, ethers.utils.toUtf8Bytes(dataEmail));
        let data10 = ethers.utils.crypto.encryptWithPublicKey(admin1AccountKeyPair.publicKey, ethers.utils.toUtf8Bytes(dataEmail));
        let data20 = ethers.utils.crypto.encryptWithPublicKey(admin1AccountKeyPair.publicKey, ethers.utils.toUtf8Bytes(dataEmail));
        tx = await contractWithSigner.newUserRegisterUserStart(arg1, arg2, arg3, data00, data10, data20, signature);
    } catch (error) {
        console.log("Error while calling writeToBlockchain()...");
        console.error(error);
        exit(1);
    }
    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m", "WRITE Transaction hash: " + tx.hash);
        console.log("");
        txr = await PROVIDER.getTransactionReceipt(tx.hash);
        console.log(txr);
        console.log("\n");
        console.log(txr.logs[0]);
        console.log("\n");
        console.log(txr.logs[1]);
        console.log("\n");
        console.log(txr.logs[2]);
    }
   
    
    data = await contract.isUserRegister(publickey, signature);
    if (data == 0) {
        console.log("\x1b[34m%s\x1b[0m", "User " + address + " has not registered.")
    }
    else {
        console.log("\x1b[34m%s\x1b[0m", "User " + address + " has registered.")
        return;
    }
    console.log("");

    return;
}

const testNow = async () => {
    await adminDeployContract();
    await userRegisterStart();
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    return true;
}

process.argv.forEach((value, index) => {
  console.log(index, value);
});

testNow();
