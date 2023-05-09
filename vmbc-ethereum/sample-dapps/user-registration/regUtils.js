const ethCrypto = require('eth-crypto');

const ethers = require("ethers");
const common = require("./common");

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
var EMAIL = process.env.EMAIL;
var CONTRACT_FILE = String(process.env.CONTRACT_FILE);
var CONTRACT_NAME = path.parse(CONTRACT_FILE).name;

var REG_CONTRACT_ABI = "";
var REG_CONTRACT_BYTECODE = "";
var REG_CONTRACT_ADDRESS = "";
var REG_CONTRACT = "";

let PROVIDER = new ethers.providers.JsonRpcProvider(VMBC_URL);

common.PROVIDER = PROVIDER;

let admin1AccountKeyPair = { privateKey: process.env.ADMIN1_PRIVATE_KEY, address: process.env.ADMIN1_ADDRESS, publicKey: process.env.ADMIN1_PUBLIC_KEY };
let user1AccountKeyPair = { privateKey: process.env.USER1_PRIVATE_KEY, address: process.env.USER1_ADDRESS, publicKey: process.env.USER1_PUBLIC_KEY };
common.privateKey = admin1AccountKeyPair.privateKey;
common.address = admin1AccountKeyPair.address;
common.publicKey = admin1AccountKeyPair.publicKey;

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

    REG_CONTRACT_ABI = output.contracts[CONTRACT_FILE][CONTRACT_NAME].abi;
    REG_CONTRACT_BYTECODE = output.contracts[CONTRACT_FILE][CONTRACT_NAME].evm.bytecode.object;
    common.REG_CONTRACT_ABI = REG_CONTRACT_ABI;
    return REG_CONTRACT_ABI; 
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
    let factory = new ethers.ContractFactory(REG_CONTRACT_ABI, REG_CONTRACT_BYTECODE, ACCOUNT_WALLET);
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
    REG_CONTRACT_ADDRESS = await deployContract(admin1AccountKeyPair);
    common.REG_CONTRACT_ADDRESS = REG_CONTRACT_ADDRESS;
}

const adminGetRegContract = async () =>  {
    REG_CONTRACT = new ethers.Contract(REG_CONTRACT_ADDRESS, REG_CONTRACT_ABI, PROVIDER);
    common.REG_CONTRACT = REG_CONTRACT;
}



const extractPublicKeyFromUserIndex = async () => {
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


module.exports = { 
    adminDeployContract,
    extractPublicKeyFromUserIndex,
    compileContract,
    deployContract,
    adminGetRegContract,
    PROVIDER ,
    REG_CONTRACT_ABI,
    REG_CONTRACT_ADDRESS,
    admin1AccountKeyPair,
    EMAIL
 };
