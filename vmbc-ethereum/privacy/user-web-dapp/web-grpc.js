// This APP is WEB based and only intended to get run from browser!
const { PrivacyWalletServicePromiseClient } = require('./../privacy-lib/wallet-api_grpc_web_pb.js');
const { set_grpc_callback } = require("./../privacy-lib/privacy-wallet.js");
const values = require('./values.js');

///////////////////////////////////////////////////
// GRPC client
///////////////////////////////////////////////////

console.log("Privacy wallet service grpc: ", values.getWalletServiceUrl());
var grpcClient = new PrivacyWalletServicePromiseClient(values.getWalletServiceUrl(), null, null);

async function sendGrpcRequest(wallet_request) {
    console.log("Grpc sending: ", wallet_request);
    return grpcClient.privacyWalletService(wallet_request);
}

function updateWalletServiceUrl() {
     grpcClient = new PrivacyWalletServicePromiseClient(values.getWalletServiceUrl(), null, null);
}

set_grpc_callback(async (req) => { return sendGrpcRequest(req); });
///////////////////////////////////////////////////

module.exports = {
    grpcClient,
    updateWalletServiceUrl
}