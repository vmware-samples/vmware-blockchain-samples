const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const Web3 = require("web3");
const protobufjs = require('protobufjs');
const { Command } = require('commander')
const fs = require('fs')
require('dotenv').config();

const admin_wallet = require("./../privacy-lib/privacy-admin-wallet.js");
const privacy_utils = require("./../privacy-lib/privacy-utils.js");
const common = require("./../privacy-lib/common.js");

const PROTO_PATH = "./../privacy-lib/wallet-api.proto";
const VMBC_URL = process.env.VMBC_URL;

cli = new Command();

let PRIVACY_WALLET_GRPC_SERVICE_URL = process.env.PRIVACY_WALLET_GRPC_SERVICE_URL;
if (PRIVACY_WALLET_GRPC_SERVICE_URL == undefined) {
    PRIVACY_WALLET_GRPC_SERVICE_URL = "localhost:49002";
}

let PRIVACY_WALLET_DAPP_PATH = process.env.PRIVACY_WALLET_DAPP_PATH;
if (PRIVACY_WALLET_DAPP_PATH == undefined) {
    PRIVACY_WALLET_DAPP_PATH = "admin-dapp-state.json";
} else {
    PRIVACY_WALLET_DAPP_PATH += "admin-dapp-state.json";
}

console.log("Privacy wallet service grpc: ", PRIVACY_WALLET_GRPC_SERVICE_URL);

// @todo - Preset to account that has write permissions. 
const ethAccountPrivateKeys = {
    "admin": "0xfabcafe36b6152101b6bca46bfd94c078a7a8b5807a76e5b5d3b75c0125af86e"
};

////////////////////////////////////////////////////////////////

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const walletApi = grpc.loadPackageDefinition(packageDefinition).vmware.concord.privacy.wallet.api.v1.PrivacyWalletService;

const grpcClient = new walletApi(PRIVACY_WALLET_GRPC_SERVICE_URL, grpc.credentials.createInsecure());

async function sendGrpcRequest(wallet_request) {
    return new Promise((resolve, reject) => {
        //console.log("send grpc: " ,wallet_request);
        grpcClient.PrivacyWalletService(wallet_request, function (err, response) {
            if (err != null) {
                return reject(err);
            } else {
                return resolve(response);
            }
        });
    });

}
admin_wallet.set_grpc_callback(async (req) => {
    let grpc_request = privacy_utils.privacy_request_message_google_protobuf_2_json(req);
    const json_res = await sendGrpcRequest(grpc_request);
    return privacy_utils.privacy_reply_message_json_2_google_protobuf(json_res);
 });
////////////////////////////////////////////////////////////////

const web3 = new Web3(new Web3.providers.HttpProvider(VMBC_URL));

let privacyContract;
let tokenContract;

function load_user_state() {
    try {
        return JSON.parse(fs.readFileSync(PRIVACY_WALLET_DAPP_PATH, 'utf-8'));;
    } catch (err) {
        console.log("no states found..")
        return {};
    }
}

function update_state(state) {
    //console.log("Updating state: ", state);
    try {
        fs.writeFileSync(PRIVACY_WALLET_DAPP_PATH, JSON.stringify(state));
    } catch (err) {
        console.error("failed to update state: ", err)
    }
}

function remote_state() {
    try {
        fs.unlinkSync(PRIVACY_WALLET_DAPP_PATH)
        //file removed
    } catch (err) {
        console.error(err)
    }
    AdminAppState = {};
}

function isStateValid() {
    return (AdminAppState.privacy_contract_addr != undefined && AdminAppState.token_contract_addr != undefined);
}

function initializeContractObjects() {
    if (isStateValid()) {
        console.log("Initializing last know states....");
        privacyContract = new web3.eth.Contract(AdminAppState.privacy_contract_abi, AdminAppState.privacy_contract_addr);
        tokenContract = new web3.eth.Contract(AdminAppState.token_contract_abi, AdminAppState.token_contract_addr);
    } else {
        console.log("no states available..");
    }
}

// Load state if available
let AdminAppState = load_user_state();

// load back states if valid
initializeContractObjects();

function AppSummary() {
    console.log("-------------------------------------");
    console.log("Admin ethereum account address:", eth_accounts["admin"].address);
    if (grpcClient) {
        console.log("Grpc client is UP");
    } else {
        console.log("Grpc client is DOWN");
    }
    if (!(privacyContract && tokenContract)) {
        console.log("Privacy application contract is not yet deployed!!");
    } else {
        console.log("Private token contract address: ", privacyContract.options.address.toLowerCase());
        console.log("Public contract address: ", tokenContract.options.address.toLowerCase());
    }
    console.log("-------------------------------------");
}

function Reset() {
    remote_state();
}

const eth_accounts = {};
for (const key in ethAccountPrivateKeys) {
    eth_accounts[key] = web3.eth.accounts.privateKeyToAccount(ethAccountPrivateKeys[key]);
    console.log("Created eth account for identity:", key, "address:", eth_accounts[key].address);
}

async function DeployPrivacyApplication() {
    try {
        let validatorKeySets = ["placeholderPublicKey", "placeholderPublicKey", "placeholderPublicKey", "placeholderPublicKey"]
        let response = await admin_wallet.privacy_application_configure(true, 2, validatorKeySets);

        console.log("Deploying privacy app....");
        await deploy(response);
        console.log("Done deploying privacy app....");
    }
    catch (error) {
        console.error(`Failed to load proto: ${error}`);
    }
}

async function sendTx(tx, userId) {
    console.log("sendTx with identity:", userId);
    const account = eth_accounts[userId];

    tx.from = account.address;
    tx.gas = 200000000;
    tx.gas_price = 0;

    // [TODO-UTT] What happens if the transaction is not confirmed?
    const signature = await account.signTransaction(tx);
    receipt = await web3.eth.sendSignedTransaction(signature.rawTransaction)
    console.log("Transaction hash : ", receipt.transactionHash);
}

async function deploy(appConfig) {
    if (!isStateValid()) {
        try {
            // Get privacy application configuration blob using replica verification keys!
            if (appConfig.length == 0) throw "Cannot deploy app with empty config!"
            console.log("config byte size:", appConfig.length);
            const config = web3.utils.bytesToHex(appConfig);

            const adminAccount = eth_accounts['admin']

            const privacyContractCompileData = common.compileContract("./../privacy-lib/contracts/PrivateToken.sol");
            const privacyContractAddr = await common.deployContract(web3, adminAccount, privacyContractCompileData.abi, privacyContractCompileData.bytecode, [config]);
            privacyContract = new web3.eth.Contract(privacyContractCompileData.abi, privacyContractAddr);
            console.log("Successfully deployed PrivateToken contract at", privacyContractAddr);
            const tokenContractCompileData = common.compileContract("./../privacy-lib/contracts/PublicToken.sol");

            console.log("Deploying PublicToken contract");
            const tokenContractArgs = [privacyContractAddr, [], 0]
            const tokenContractAddr = await common.deployContract(web3, adminAccount, tokenContractCompileData.abi, tokenContractCompileData.bytecode, tokenContractArgs);
            tokenContract = new web3.eth.Contract(tokenContractCompileData.abi, tokenContractAddr);
            console.log("Successfully deployed PublicToken contract at", tokenContractAddr);

            update_state({
                privacy_contract_addr: privacyContractAddr,
                privacy_contract_abi: privacyContractCompileData.abi,
                token_contract_addr: tokenContractAddr,
                token_contract_abi: tokenContractCompileData.abi
            });

            console.log("Deployed privacy app successfully...");
        } catch (error) {
            console.error(`Failed to deploy contract: ${error}`);
        }
    } else {
        console.error(`Privacy application is already deployed...`);
    }
}

async function createPrivacyBudget(userPid, value = 1000) {
    expirationDate = 1919241632
    const budgetReq = {
        userId: userPid,
        expirationDate: expirationDate,
        value: value
    }
    console.log("Budget req:", budgetReq)
    const tx = {
        to: privacyContract.options.address,
        data: privacyContract.methods.createPublicBudget(budgetReq).encodeABI()
    }

    await sendTx(tx, "admin");
    console.log("created budget successfully..");

    return { status: "ok" };
}

async function mintPublicToken(beneficiary, amount) {
    if (!tokenContract) {
        console.log("Public token contract not deployed");
        return;
    }
    else if (!beneficiary || !amount) {
        console.log("Invalid arguments (beneficiary, amount): ", beneficiary, amount);
        return;
    }
    const tx = {
        to: tokenContract.options.address,
        data: tokenContract.methods.mint(beneficiary, amount).encodeABI()
    }
    await sendTx(tx, "admin");
    return { status: "ok" };
}

cli
    .command('show')
    .description('show summary of the admin app')
    .action(() => {
        AppSummary();
        process.exit();
    });

cli
    .command('reset')
    .description('reset app states')
    .action(() => {
        Reset();
        process.exit();
    });

cli
    .command('deploy')
    .description('generates a privacy config and deploys the privacy and token contracts.')
    .action(async () => {
        await DeployPrivacyApplication();
        process.exit();
    });

cli
    .command('mint-public')
    .description('mints public tokens to specified address.')
    .argument('<address>', 'public address to mint tokens to')
    .argument('<tokens>', 'amount of public tokens to mint')
    .action(async (address, amount) => {
        await mintPublicToken(address, amount);
        process.exit();
    });

cli
    .command('create-budget')
    .description('requests creation of a privacy budget for a user.')
    .argument('<pid>', 'Accountable privacy user ID (or) PID')
    .argument('<budget>', 'Privacy budget')
    .action(async (pid, budget) => {
        await createPrivacyBudget(pid, budget);
        process.exit();
    });

cli.parseAsync().then(() => { });