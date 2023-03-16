#! /usr/bin/env node
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const Web3 = require("web3");
const commander = require('commander')
const fs = require('fs')
const privacy_wallet = require("./../privacy-lib/privacy-wallet.js");
const privacy_utils = require("./../privacy-lib/privacy-utils.js");
const proto = require('./../privacy-lib/wallet-api_pb.js')
const common = require("./../privacy-lib/common.js");
require('dotenv').config();

const VMBC_URL = process.env.VMBC_URL;
const PROTO_PATH = "./../privacy-lib/wallet-api.proto";

let PRIVACY_WALLET_GRPC_SERVICE_URL = process.env.PRIVACY_WALLET_GRPC_SERVICE_URL;
if (PRIVACY_WALLET_GRPC_SERVICE_URL == undefined) {
    PRIVACY_WALLET_GRPC_SERVICE_URL = "localhost:49002";
}

initialPublicBalance = 10000;
if (process.env.INITIAL_PUBLIC_BALANCE != undefined) {
    initialPublicBalance = process.env.INITIAL_PUBLIC_BALANCE;
}

let PRIVACY_WALLET_DAPP_PATH = process.env.PRIVACY_WALLET_DAPP_PATH;
if (PRIVACY_WALLET_DAPP_PATH == undefined) {
    PRIVACY_WALLET_DAPP_PATH = "user-state.json";
} else {
    PRIVACY_WALLET_DAPP_PATH += "user-state.json";
}

const web3 = new Web3(new Web3.providers.HttpProvider(VMBC_URL));

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const walletApi = grpc.loadPackageDefinition(packageDefinition).vmware.concord.privacy.wallet.api.v1.PrivacyWalletService;

const grpcClient = new walletApi(PRIVACY_WALLET_GRPC_SERVICE_URL,
    grpc.credentials.createInsecure());

async function sendGrpcRequest(wallet_request) {
    return new Promise((resolve, reject) => {
        grpcClient.PrivacyWalletService(wallet_request, function (err, response) {
            if (err != null) {
                return reject(err);
            } else {
                return resolve(response);
            }
        });
    });

}

privacy_wallet.set_grpc_callback(async (req) => {
    let grpc_request = privacy_utils.privacy_request_message_google_protobuf_2_json(req);
    const json_res = await sendGrpcRequest(grpc_request);
    return privacy_utils.privacy_reply_message_json_2_google_protobuf(json_res);
 });

function load_user_state() {
    return JSON.parse(fs.readFileSync(PRIVACY_WALLET_DAPP_PATH, 'utf-8'));
}

function init(privacy_contract_address, tokens_contract_address, user_id) {
    const ether_account = web3.eth.accounts.privateKeyToAccount(common.generateRandomEtherPrivateKey());
    console.log("Ethereum account address is: ", ether_account.address);
    const shielded_account = web3.eth.accounts.privateKeyToAccount(common.generateRandomEtherPrivateKey());
    console.log("Ethereum relay account address is: ", shielded_account.address);
    const privacyContractCompileData = common.compileContract("./../privacy-lib/contracts/PrivateToken.sol");
    const tokensContractCompileData = common.compileContract("./../privacy-lib/contracts/PublicToken.sol");
    update_state({
        privacy_abi: privacyContractCompileData.abi,
        tokens_abi: tokensContractCompileData.abi,
        tokens_contract_address: tokens_contract_address, 
        privacy_contract_address: privacy_contract_address,
        account: ether_account,
        shielded_account: shielded_account,
        user_id: user_id,
        last_known_sn: 0});
}

function update_state(state) {
    fs.writeFileSync(PRIVACY_WALLET_DAPP_PATH, JSON.stringify(state));
}

commander
    .version('0.0.1')
    .command('configure')
    .argument('<private_key_path>', 'path to the wallet private key file (PEM format)')
    .argument('<public_key_path>', 'path to the wallet public key file (PEM format)')
    .description('configure the backend wallet service with the given key pair')
    .action((private_key_path, public_key_path) => {
        const app_data = load_user_state();
        const private_key = fs.readFileSync(private_key_path);
        const public_key = fs.readFileSync(public_key_path);
        privacy_wallet.configure(app_data.privacy_abi, app_data.privacy_contract_address, private_key, public_key, app_data.user_id);
    });

commander
    .command('register')
    .argument('<certificate>', 'path to the user certificate')
    .description('register a user to the privacy contract')
    .action((certificate) => {
        const app_data = load_user_state();
        const cert_data = fs.readFileSync(certificate).toString()
        privacy_wallet.register(app_data.privacy_abi, app_data.privacy_contract_address, app_data.account.privateKey, cert_data);
    });

commander
    .command('init')
    .argument('<privacy_contract_address>', 'the deployed privacy contract address')
    .argument('<tokens_contract_address>', 'the deployed tokens contract address')
    .argument('<user_id>', 'the user public id')
    .description('initialize the application with a specific privacy configuration')
    .action((privacy_contract_address, tokens_contract_address, user_id) => {
        init(privacy_contract_address, tokens_contract_address, user_id);
    });

commander
    .command('convert-public-to-private')
    .argument('<value>', 'the amount of public tokens to convert to private')
    .description('convert public ERC20 tokens to private coin with the same amount of tokens')
    .action((value) => {
        let app_data = load_user_state();
        privacy_wallet.convert_public_to_private(
            app_data.privacy_abi,
            app_data.privacy_contract_address,
            app_data.tokens_abi, 
            app_data.tokens_contract_address, 
            app_data.account.privateKey, 
            app_data.user_id, 
            value);
    });

commander
    .command("claim-transferred-coins")
    .description('claim coins that were transferred by another user. This is done by trying to claim coins from every sequence number in the range of [last known sequence number + 1, last known global sequence number]')
    .action(() => {
        let app_data = load_user_state();
        privacy_wallet.claim_transferred_coins(app_data.privacy_abi, app_data.privacy_contract_address, parseInt(app_data.last_known_sn) + 1).then(
            (result) => {
                if (result != null) {
                    app_data.last_known_sn = result;
                    update_state(app_data);
                }
            })
    });

commander   
    .command("claim-budget-coin")
    .description('claim the budget coin which was minted by the administrator')
    .action(() => {
        let app_data = load_user_state();
        privacy_wallet.get_privacy_budget(app_data.privacy_abi, app_data.privacy_contract_address, app_data.user_id);
    })
commander
    .command('sync')
    .description('syncing the wallet with the privacy contract state. This method tries to claim all coins by looping in the range of [1, last known global sequence number]. Basically this method should be used in case we need to recover a wallet state from the contract state itself')
    .action(() => {
        let app_data = load_user_state();
        privacy_wallet.sync_state(app_data.privacy_abi, app_data.privacy_contract_address, 1).then((_) => {
            privacy_wallet.get_privacy_budget(app_data.privacy_abi, app_data.privacy_contract_address, app_data.user_id);
        });
    });
    
commander
    .command('show')
    .description('show the latest state as known by the backend privacy service')
    .action(() => {
        let app_data = load_user_state();
        privacy_wallet.get_privacy_state().then((result) => {
            const privacy_state = result;
            const tokens_contract = new web3.eth.Contract(app_data.tokens_abi, app_data.tokens_contract_address);
            tokens_contract.methods.balanceOf(app_data.account.address).call().then((result) => {
                console.log(
                    {
                        privacy_state: privacy_state,
                        public_balance: result,
                        ethereum_public_address: app_data.account.address,
                        ethereum_shielded_address: app_data.shielded_account.address
                    }
                )
            });
        });
    });
        

commander
    .command('convert-private-to-public')
    .argument('<value>', 'the amount of public tokens to convert to private')
    .description('convert private privacy tokens to a public ERC20 tokens')
    .action((value) => {
        const app_data = load_user_state();
        privacy_wallet.convert_private_to_public(
            app_data.privacy_abi, 
            app_data.privacy_contract_address, 
            app_data.tokens_abi, 
            app_data.tokens_contract_address, 
            app_data.account.privateKey, 
            app_data.shielded_account.privateKey,
            app_data.user_id, 
            value);
});

commander
    .command('transfer')
    .argument('<value>', 'the amount of private tokens to transfer')
    .argument('<recipient_id>', 'the recipient public id')
    .argument('<path_to_recipient_public_key>', 'path to the recipient public key (PEM format)')
    .description('transfer the given amount of private tokens to another user')
    .action((value, recipient_id, path_to_recipient_public_key) => {
        let app_data = load_user_state();
        const pub_key = fs.readFileSync(path_to_recipient_public_key)
        privacy_wallet.transfer(
            app_data.privacy_abi, 
            app_data.privacy_contract_address, 
            app_data.shielded_account.privateKey, 
            recipient_id, 
            pub_key, 
            value)
    });
commander.parse()
