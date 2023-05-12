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

// Set deploy account
let PERMISSIONING_ADMIN_ACCOUNT = process.env.PERMISSIONING_ADMIN_ACCOUNT;
let PERMISSIONING_ADMIN_ACCOUNT_PRIVATE_KEY = String(process.env.PERMISSIONING_ADMIN_ACCOUNT_PRIVATE_KEY);
let PERMISSIONING_CONTRACT_ADDRESS = String(process.env.PERMISSIONING_CONTRACT_ADDRESS);
let PERMISSIONING_CONTRACT_ABI = ["function updatePermissions(address from, address to, uint8 action)",
    "function checkUserAction(address from, address to, uint8 action) external view returns(bool)"];

let PROVIDER = new ethers.providers.JsonRpcProvider(VMBC_URL);
let ADMIN_WALLET = new ethers.Wallet(PERMISSIONING_ADMIN_ACCOUNT_PRIVATE_KEY, PROVIDER);

let adminAccountKeyPair = { privateKey: process.env.ADMIN_PRIVATE_KEY, address: process.env.ADMIN_ADDRESS, publicKey: process.env.ADMIN_PUBLIC_KEY };

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
    let deployedAddress = ethers.utils.getAddress(ethers.utils.getContractAddress({ from: keyPair.address, nonce }));
    console.log("\x1b[34m%s\x1b[0m", "Before deployment: Contract Address:  " + deployedAddress);

    let privateKey = String(keyPair.privateKey);
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    let factory = new ethers.ContractFactory(SAMPLE_CONTRACT_ABI, SAMPLE_CONTRACT_BYTECODE, ACCOUNT_WALLET);
    let contract = await factory.deploy();
    //let isDeployed = await contract.deployed();
    if (contract.address) {
        console.log("\x1b[34m%s\x1b[0m", "New contract deployed : Contract Address: " + contract.address);
        console.log("");
        return contract.address;
    }
}

const addPermissions = async (keyPair, allPermissions) => {
    return updatePermissions(keyPair, allPermissions);
}

const checkPermissions = async (keyPair, allPermissions) => {

    console.log("------------------------- Check permissions -------------------------");
    let privateKey = String(keyPair.privateKey);
    let fromAddress = keyPair.address;

    let toAddress = "0x0000000000000000000000000000000000000000";
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    const contract = new ethers.Contract(PERMISSIONING_CONTRACT_ADDRESS, PERMISSIONING_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);
    var response = "";
    try {
        response = await contractWithSigner.checkUserAction(fromAddress, toAddress, allPermissions);
    } catch (error) {
        console.log("Error while calling checkPermissions()...");
        console.log(error);
        exit(1);
    }
    if (response) {
        console.log("\x1b[34m%s\x1b[0m", "User " + fromAddress + " has permissions.");
        console.log("");
        return true;
    } else {
        console.log("\x1b[34m%s\x1b[0m", "User " + fromAddress + " has NO permissions.");
        console.log("");
        return false;
    }
}

const updatePermissions = async (keyPair, allPermissions) => {
    console.log("------------------------- Update Permissions -------------------------");
    let privateKey = String(keyPair.privateKey);
    let fromAddress = keyPair.address;
    let toAddress = "0x0000000000000000000000000000000000000000";

    const contract = new ethers.Contract(PERMISSIONING_CONTRACT_ADDRESS, PERMISSIONING_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ADMIN_WALLET);
    let tx = "";
    try {
        tx = await contractWithSigner.updatePermissions(fromAddress, toAddress, allPermissions);
    } catch (error) {
        console.log("Error while calling updatePermissions()...");
        console.log(error);
        exit(1);
    }
    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m", "Permission given to " + fromAddress)
        console.log("\x1b[34m%s\x1b[0m", "Transaction hash: " + tx.hash);
        console.log("");
        return true;
    }
    return false;
}

const test2 = async () => {

  
      // const PRIV_KEY = "0x..."
      // const signer = new ethers.Wallet(PRIV_KEY)
      const signer = accounts[0]
      const to = accounts[1].address
      const amount = 999
      const message = "Hello"
      const nonce = 123
  
      const hash = await contract.getMessageHash(to, amount, message, nonce)
      const sig = await signer.signMessage(ethers.utils.arrayify(hash))
  
      const ethHash = await contract.getEthSignedMessageHash(hash)
  
      console.log("signer          ", signer.address)
      console.log("recovered signer", await contract.recoverSigner(ethHash, sig))
  
      // Correct signature and message returns true
      expect(
        await contract.verify(signer.address, to, amount, message, nonce, sig)
      ).to.equal(true)
  
      // Incorrect message returns false
      expect(
        await contract.verify(signer.address, to, amount + 1, message, nonce, sig)
      ).to.equal(false)
    }

const writeToBlockchain = async (keyPair) => {
    console.log("------------------------- WRITE Test -------------------------");
    let privateKey = String(keyPair.privateKey);
    let fromAddress = keyPair.address;

    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);

    let data = "saanvijay20@gmail.com";
    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
    const messageHashBytes = ethers.utils.arrayify(messageHash);

    const signingKey = new ethers.utils.SigningKey(privateKey);
    const adminPublicKeyBytes = ethers.utils.arrayify(PERMISSIONING_ADMIN_ACCOUNT);
    const signature = signingKey.signDigest(messageHashBytes, adminPublicKeyBytes);

    // isUserRegister(address addr, string memory message, bytes memory signature)

    let tx = "";
    try {
        tx = await contractWithSigner.newUserRegisterUserStart(number);
        //newUserRegisterUserStart(bytes[] memory publicKey, bytes[] memory data, string memory message, bytes memory signature)
    } catch (error) {
        console.log("Error while calling writeToBlockchain()...");
        console.error(error);
        exit(1);
    }
    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m", "User " + fromAddress + " has WRITE permission.")
        console.log("\x1b[34m%s\x1b[0m", "WRITE Transaction hash: " + tx.hash);
        console.log("");
        return true;
    }
    return false;
}

const adminDeployContract = async () => {
    let permissions = DEPLOY + WRITE + READ;

    if (!await checkPermissions(adminAccountKeyPair, permissions)) {
        await addPermissions(adminAccountKeyPair, permissions);
    }

    await compileContract();
    SAMPLE_CONTRACT_ADDRESS = await deployContract(adminAccountKeyPair);
}

const userRead = async () => {
    let accountKeyPair = await generateAccount();

    await isUserRegistered(accountKeyPair);
}

const testNow = async () => {
    await adminDeployContract();
    await userRead();
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ========================");
    return true;
}

const isUserRegistered = async (keyPair) => {
    console.log("------------------------- READ Test -------------------------");

    let privateKey = String(keyPair.privateKey);
    let address = keyPair.address;
    let publickey = keyPair.publicKey;
    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);

    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);
    
    let message = publickey;
    let messageBytes = ethers.utils.arrayify(message);
    let signature = await ACCOUNT_WALLET.signMessage(messageBytes);

    const data = await contractWithSigner.test1(address, publickey, signature, ethers.utils.toUtf8Bytes("1234"));

    if (data) {
        console.log("\x1b[34m%s\x1b[0m", "User " + address + " has registered.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: Data : ", data);
        console.log("");
        return true;
    }
    return false;
}

testNow();
