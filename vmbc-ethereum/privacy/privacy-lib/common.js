const path = require('path');
const fs = require("fs");
const solc = require("solc");
const crypto = require('crypto');

const Web3 = require("web3");

function generateRandomEtherPrivateKey() {
    let id = crypto.randomBytes(32).toString('hex');
    return privateKey = "0x" + id;
}

function savePrivacyConfig(config) {
    data = JSON.stringify(config);
    fs.writeFile(getConfigFile(), data, (err) => {
        if (err) {
            throw err
        }
        console.log('Privacy config is saved to: ', getConfigFile())
    });
}

function loadPrivacyConfig() {
    console.log('Loading privacy config: ', getConfigFile());
    return JSON.parse(fs.readFileSync(getConfigFile(), 'utf-8'));
}

function compileContract(filePath) {
    console.log('compile sol: ', filePath);

    // Reading the file
    const fileName = path.parse(filePath).name;
    console.log(filePath);

    const file = fs.readFileSync(filePath).toString();
    //console.log("read sync:" , file);

    // input structure for solidity compiler
    const input = {
        language: "Solidity",
        sources: {
            [filePath]: {
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

    function findImports(path) {
        const source = fs.readFileSync(path, 'utf-8');
        return { contents: source }
    }

    //console.log('json parsing... ', filePath);

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors != undefined) {
        console.log(output.errors);
    }

    const abi = output.contracts[filePath][fileName].abi;
    const bytecode = output.contracts[filePath][fileName].evm.bytecode.object;

    console.log("Successfully compiled", fileName, "from file", filePath);
    //console.log("ABI:");
    //console.log(abi);
    console.log("Bytecode size:", bytecode.length);

    return { abi: abi, bytecode: bytecode }
}

async function deployContract(web3, account, abi, bytecode, args) {
    console.log("Deploying with account:", account.address);

    const contract = new web3.eth.Contract(abi);

    const tx = {
        from: account.address,
        data: contract.deploy({ data: bytecode, arguments: args }).encodeABI(),
        gas: 200000000,
        gas_price: 0,
    }
    const signature = await account.signTransaction(tx);
    
    let contractAddr
    await web3.eth.sendSignedTransaction(signature.rawTransaction).on(
        "receipt", (receipt) => {
            console.log("Deploy transaction hash : ", receipt.transactionHash);
            contractAddr = receipt.contractAddress
        }
    )
    return contractAddr;
}

module.exports = {
    compileContract: compileContract,
    deployContract: deployContract,
    savePrivacyConfig: savePrivacyConfig,
    loadPrivacyConfig: loadPrivacyConfig,
    generateRandomEtherPrivateKey: generateRandomEtherPrivateKey,
}