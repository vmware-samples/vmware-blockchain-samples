const { ethers } = require("@vmware-blockchain/ethers");
const { Console } = require("console");
solc = require("solc");
fs = require("fs");
const { exit } = require("process");
const path = require('path');

// Setting up a JSON RPC Provider
var provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

// Account 1 Private Key 
const PRIVATE_KEY_ACC = "Change-this-to-a-Private-Key-of-an-Account";

verifySampleSetup();

const wallet = new ethers.Wallet(PRIVATE_KEY_ACC, provider);

var CONTRACT_FILE = String("../contracts/DataCopy.sol");
var CONTRACT_NAME = path.parse(CONTRACT_FILE).name;
ABI = "";
BYTECODE = "";

function compileContract() {
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
    ABI = output.contracts[CONTRACT_FILE][CONTRACT_NAME].abi;
    BYTECODE = output.contracts[CONTRACT_FILE][CONTRACT_NAME].evm.bytecode.object;
}

const deployContract = async () => {
    let factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);
    let contract = await factory.deploy();

    await contract.deployed()
    console.log("Contract deployed successfully");

    return contract.address;
}

const main = async () => {
    compileContract();
    
    CONTRACT_ADDRESS = await deployContract();
    console.log("Contract Address: " + CONTRACT_ADDRESS);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const contractWithSigner = contract.connect(wallet);

    var dataForContract = "VMware Ethereum Blockchain";
    var inBytes = ethers.utils.formatBytes32String(dataForContract);
    console.log("Data to be written to Blockchain: " + inBytes);
    console.log("Data to be written to Blockchain (in Bytes format): " + inBytes);
    
    var tx;   
    try {
        tx = await contractWithSigner.callDatacopy(inBytes);
    } catch (err) {
        console.log("Cannot call callDatacopy");
        console.log(err);
        exit(1);
    }

    const txReceipt = await tx.wait();
    if (txReceipt) {
        console.log("Transaction Hash: " + tx.hash);
    }

    const data = await contractWithSigner.getMemoryStored();
    console.log("Data Copy from Contract:", ethers.utils.parseBytes32String(data));
}

main();

// Verifies if the variable(s) needed to be changed to run this sample are indeed changed
function verifySampleSetup() {
    var verified = true;
    if (verifyPrivateKeyChanged(PRIVATE_KEY_ACC) == false) {
      verified = false;
      console.log("Before running this sample, update the PRIVATE_KEY_ACC as instructed in README")
    }
    if (verified == false) {
      console.log("Make necessary changes before running the sample");
      process.exit(1);
    }
  }
  
  function verifyPrivateKeyChanged(private_key) {
    if (private_key === "Change-this-to-a-Private-Key-of-an-Account") {
      return false;
    }
    return true;
  }