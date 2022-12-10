const ethers = require("@vmware-blockchain/ethers-extension");

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

const READ   = 1;
const WRITE  = 2;
const DEPLOY = 4;

var VMBC_URL = process.env.VMBC_URL;
var CONTRACT_FILE = String(process.env.CONTRACT_FILE); 
var CONTRACT_NAME = path.parse(CONTRACT_FILE).name; 

var SAMPLE_CONTRACT_ABI = "";
var SAMPLE_CONTRACT_BYTECODE = "";
var SAMPLE_CONTRACT_ADDRESS = "";

// Set deploy account
let ADMIN_ACCOUNT = process.env.ADMIN_ACCOUNT;
let ADMIN_ACCOUNT_PRIVATE_KEY = String(process.env.ADMIN_ACCOUNT_PRIVATE_KEY);
let PERMISSIONING_CONTRACT_ADDRESS = String(process.env.PERMISSIONING_CONTRACT_ADDRESS);
let PERMISSIONING_CONTRACT_ABI = ["function updatePermissions(address from, address to, uint8 action)", 
                                    "function checkUserAction(address from, address to, uint8 action) external view returns(bool)"];

let PROVIDER = new ethers.providers.VmbcJsonRpcProvider(VMBC_URL);
let ADMIN_WALLET = new ethers.Wallet(ADMIN_ACCOUNT_PRIVATE_KEY, PROVIDER);

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
    console.log("");
    keyPair.privateKey = privateKey;
    keyPair.address = wallet.address;

    return keyPair;
}

const deployContract = async(keyPair) => {
    console.log("------------------------- DEPLOY Test -------------------------");
    let privateKey = String(keyPair.privateKey);
    const nonce = 0;
    let deployedAddress = ethers.utils.getAddress(ethers.utils.getContractAddress({from: keyPair.address, nonce})); 
    console.log("\x1b[34m%s\x1b[0m", "Before deployment: Contract Address:  " +deployedAddress);

    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    let factory = new ethers.ContractFactory(SAMPLE_CONTRACT_ABI, SAMPLE_CONTRACT_BYTECODE, ACCOUNT_WALLET);
    let contract = await factory.deploy();
    if (contract.address) {
        console.log("\x1b[34m%s\x1b[0m", "New contract deployed: Contract Address:  " +contract.address);
        console.log("");
        return contract.address;
    }
}

const addPermissions = async (keyPair, allPermissions) => {
    return updatePermissions(keyPair, allPermissions);
}

const usePrivatekeyForPermissioning = async (privateKey) => {
    PROVIDER.setSigningKey({readPermissioningKeyOrEnable: privateKey});
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
        console.log("Error while calling checkPermission()...");
        console.log(error);
        exit(1);
    }
    if (response) {
        console.log("\x1b[34m%s\x1b[0m", "User "+fromAddress +" has permissions.");
        console.log("");
        return true;
    } else {
        console.log("\x1b[34m%s\x1b[0m", "User "+fromAddress +" has NO permissions.");
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
        console.log("\x1b[34m%s\x1b[0m", "Permission given to "+fromAddress)
        console.log("\x1b[34m%s\x1b[0m",  "Transaction hash: " + tx.hash);
        console.log("");
        return true;
    }
    return false;
}

const writeToBlockchain = async (keyPair) => {
    console.log("------------------------- WRITE Test -------------------------");
    let privateKey = String(keyPair.privateKey);
    let fromAddress = keyPair.address;

    let ACCOUNT_WALLET = new ethers.Wallet(privateKey, PROVIDER);
    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ACCOUNT_WALLET);
    let number = Math.floor(Math.random() * 100);
    let tx = "";
    try {
        tx = await contractWithSigner.set(number);
    } catch (error) {
        console.log("Error while calling writeToBlockchain()...");
        console.log(error);
        exit(1);
    }
    if (tx.hash) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has WRITE permission.")
        console.log("\x1b[34m%s\x1b[0m",  "WRITE Transaction hash: " + tx.hash);
        console.log("");
        return true;
    }
    return false;
}



const readFromBlockchain = async (keyPair) => {
    let fromAddress = keyPair.address;
    const contract = new ethers.Contract(SAMPLE_CONTRACT_ADDRESS, SAMPLE_CONTRACT_ABI, PROVIDER);
    
    var blockHash;
    var transactionHash;
    var filter;
    console.log("------------------ get() ------------------")
    var data = await contract.get();
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read : Data : ", data);
        console.log("");
    }
    console.log("------------------ getBlock by number ------------------")
    data = await PROVIDER.getBlock("latest");
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getBlock by number: ", data);
        blockHash = data.hash;
        transactionHash = data.transactions[0];
        console.log("");
    }
    console.log("------------------ getBlock by hash ------------------")
    data = await PROVIDER.getBlock(blockHash);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getBlock by hash: ", data);
        console.log("");
    }
   
    console.log("------------------ getBlockNumber ------------------")
    data = await PROVIDER.getBlockNumber();
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getBlockNumber: ", data);
        console.log("");
    }
    
    console.log("------------------ getGasPrice -----------------")
    data = await PROVIDER.getGasPrice();
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getGasPrice : ", data);
        console.log("");
    }
   
    console.log("------------------ getBalance -----------------")
    data = await PROVIDER.getBalance(fromAddress);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getBalance : ", data);
        console.log("");
    }
    
    console.log("------------------ getTransactionCount -----------------")
    data = await PROVIDER.getTransactionCount(fromAddress);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getTransactionCount : ", data);
        console.log("");
    }

    console.log("------------------ getTransactionCount -----------------")
    data = await PROVIDER.getTransactionCount(fromAddress);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getTransactionCount : ", data);
        console.log("");
    }
   
    console.log("------------------ getCode (given contract address as param)  -----------------")
    data = await PROVIDER.getCode(SAMPLE_CONTRACT_ADDRESS);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getCode : ", data);
        console.log("");
    }
    
    console.log("------------------ getStorageAt (given contract address as param)  -----------------")
    data = await PROVIDER.getStorageAt(SAMPLE_CONTRACT_ADDRESS, 0, "latest");
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getStorageAt : ", data);
        console.log("");
    }

    console.log("------------------ getTransaction  -----------------")
    data = await PROVIDER.getTransaction(transactionHash);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getTransaction : ", data);
        console.log("");
    }

    console.log("------------------ getTransactionReceipt  -----------------")
    await PROVIDER.waitForTransaction(transactionHash);
    data = await PROVIDER.getTransactionReceipt(transactionHash);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getTransactionReceipt : ", data);
        
        console.log("");
        filter = data.logs[0];
        console.log("\x1b[34m%s\x1b[0m", "   Read: getTransactionReceipt topics: ", data.logs[0].topics);

    }

    var transaction = {
        from: fromAddress,
        to: SAMPLE_CONTRACT_ADDRESS,
        data: "0x60fe47b1000000000000000000000000000000000000000000000000000000000000004a",
        gasPrice: "0x0",
      }

    console.log("------------------ estimateGas  -----------------")
    data = await PROVIDER.estimateGas(transaction);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: estimateGas : ", data);
        console.log("");
    }
   
    console.log("------------------ getLogs  -----------------")
    data = await PROVIDER.getLogs(filter);
    if (data) {
        console.log("\x1b[34m%s\x1b[0m",  "User "+fromAddress +" has READ permission.")
        console.log("\x1b[34m%s\x1b[0m", "   Read: getLogs : ", data);
        console.log("");
    }
return true;
}

const deployWriteReadTest = async () => {
    let accountKeyPair = await generateAccount();
    let permissions = DEPLOY+WRITE+READ;
   
    // Test with signingKey
    await usePrivatekeyForPermissioning(ADMIN_ACCOUNT_PRIVATE_KEY);
    if (!await checkPermissions(accountKeyPair, permissions)) {
        await addPermissions(accountKeyPair, permissions);
    }
    await usePrivatekeyForPermissioning(String(accountKeyPair.privateKey));
    await compileContract();
    SAMPLE_CONTRACT_ADDRESS =  await deployContract(accountKeyPair);
    await writeToBlockchain(accountKeyPair); 
    await readFromBlockchain(accountKeyPair);
}

const testNow = async () => {
    await deployWriteReadTest();
    console.log("\x1b[32m%s\x1b[0m", "==================== DONE ======================== ");
    return true;
}

testNow();
