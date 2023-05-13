const ethCrypto = require('eth-crypto');

const ethers = require("ethers");
const common = require("./common");
require('log-timestamp');

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
var EMAIL = process.env.USER1_EMAIL;
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

common.REG_CONTRACT_ABI = ["function isUserRegister(bytes memory userPublicKey, bytes memory signature) view public returns (uint)", 
"function newUserRegisterUserStart(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory data00, bytes memory data10, bytes memory data20, bytes memory signature) public",
"function newUserRegisterUserComplete(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory data01, bytes memory data11, bytes memory data21, bytes memory signature) public",
"function userIndexToPublickey(uint index) view public returns (bytes memory)"];

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

    const wallet = ethers.Wallet.createRandom();
    console.log("\x1b[34m%s\x1b[0m", "Private Key:", wallet.privateKey);
    console.log("\x1b[34m%s\x1b[0m", "Address: " + wallet.address);
    console.log("\x1b[34m%s\x1b[0m", "Public Key: " + wallet.publicKey);

    keyPair.privateKey = wallet.privateKey;
    keyPair.address = wallet.address;
    keyPair.publicKey = wallet.publicKey;

    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    return keyPair;

}

const deployContract = async (keyPair) => {
    console.log("------------------------- DEPLOY Contract -------------------------");

    const nonce = 0;

    let privateKey = String(keyPair.privateKey);
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    let factory = new ethers.ContractFactory(REG_CONTRACT_ABI, REG_CONTRACT_BYTECODE, ACCOUNT_WALLET);
    let contract = await factory.deploy({gasLimit: 1000000, gasPrice: 0});
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

module.exports = { 
    adminDeployContract,
    compileContract,
    deployContract,
    adminGetRegContract,
    generateAccount,
    PROVIDER ,
    REG_CONTRACT_ABI,
    REG_CONTRACT_ADDRESS,
    admin1AccountKeyPair,
    EMAIL
 };
