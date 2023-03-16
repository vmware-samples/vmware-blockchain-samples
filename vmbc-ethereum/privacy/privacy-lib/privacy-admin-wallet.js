const proto = require('./wallet-api_pb.js')

let grpc_callback = async function (call) { };

/**
 * set a callback for sending grpc requests
 * @param {async function} callback             async callback for sending grpc requests
 */
function set_grpc_callback(callback) {
    console.log("setting callback....");
    grpc_callback = callback;
}

/**
 * configure a privacy application pre-deploying
 * @param {bool}                 Disable/enable usage of a budget token
 * @param {int} numValidators         The number of validator shares required to reconstruct a signature
 * @param {string array} validatorKey Validator public keys
 * @returns configuration response
 */
async function privacy_application_configure(budget, numValidators, validatorKey) {
    console.log("configuring privacy application");
    let app_configure_req = new proto.PrivacyAppConfigRequest();
    app_configure_req.setBudget(budget);
    app_configure_req.setNumvalidators(numValidators);
    for (let i = 0; i < validatorKey.length; i++) {
        app_configure_req.addValidatorpublickey(validatorKey[i]);
    }
    let wallet_grpc_req = new proto.PrivacyWalletRequest();
    wallet_grpc_req.setPrivacyAppConfig(app_configure_req);
    const resp = await grpc_callback(wallet_grpc_req);
    return resp.getPrivacyAppConfigResponse().getConfiguration();
}

module.exports = {
    privacy_application_configure,
    set_grpc_callback
}