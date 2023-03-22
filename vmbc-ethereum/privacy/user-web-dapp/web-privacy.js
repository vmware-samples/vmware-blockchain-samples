const { ethers } = require("ethers");
const { PrivacyWalletRequest, GetStateRequest, GetStateResponse, GenerateMintTx, GenerateBurnTx, ClaimCoinsRequest, TxType } = require('./../privacy-lib/wallet-api_pb.js');
const { PrivacyWalletServicePromiseClient } = require('./../privacy-lib/wallet-api_grpc_web_pb.js');
const values = require('./values.js');
const privacy_wallet = require("./../privacy-lib/privacy-wallet.js");
const grpcweb = require('grpc-web');
let registered=false;

///////////////////////////////////////////////////
async function privacyWalletConfig(skey, pkey, cert) {
    let check = await walletRegistered();
    if (check) {
        console.log("wallet already configured.. skip");
        return;
    }
    try {
        await values.setUserIdFromPublicKey(pkey);
        console.log("#### my user id: ", values.getUserId());
        let resp = await privacy_wallet.configure(values.getPrivateTokenAbi(), values.privacyContractAddress, skey, pkey, values.getUserId());
        console.log("Configuration response: ", resp);
    } catch (error) {
        console.log(error);
        if (error.code == grpcweb.StatusCode.ALREADY_EXISTS) {
            console.log("Wallet is already configured");
        } else {
            console.error("wallet configuration failed: ", error);
            throw error;
        }
    }

    // Register the user
    console.log("Begin user registration");
    try {
        console.log("registration in progress...");
        let resp = await privacy_wallet.register(values.getPrivateTokenAbi(), values.privacyContractAddress, undefined, cert);
        console.log("registration response: ", resp);
    } catch (error) {
        console.error("wallet registration failed: ", error);
        throw error;
    }

    console.log("User registered successfully");
}

async function walletRegistered() {
    if (registered) {
        return true
    }
    try {
        let resp = await privacy_wallet.get_privacy_state();
        console.log("Status response: ", resp);
        registered = true;
        return true;
    } catch(err) {
        console.log("error response: ", err);
        return false;
    }
}

async function handleSKFile(callback) {
    console.log("handle SK files...");
    let check = await walletRegistered();
    if (check) {
        alert("wallet already provisioned");
    } else {
        const fileSelect = document.getElementById("myKeys");
        fileSelect.addEventListener("change", handleFiles, false);
        console.log("key/cert listener added..");
        function handleFiles() {
          const fileList = this.files; 
          console.log("loading files ", fileList);
          if (fileList.length != 3) {
            alert("upload private and public key only!")
            return;
          }
          var reader = new FileReader();
          let skey, pkey, cert;
          
          function readFile(index) {
            if( index >= fileList.length ) return;
            var file = fileList[index];
            reader.onload = async function(e) {  
                if (e.target.result.includes("BEGIN PRIVATE KEY")) {
                    skey = e.target.result;
                } else if (e.target.result.includes("BEGIN PUBLIC KEY")) {
                    pkey = e.target.result;
                } else if (e.target.result.includes("BEGIN CERTIFICATE")) {
                    cert = e.target.result;
                } else {
                    console.error("unsupported file type: ", e.target.result);
                    alert("unsupported file type");
                    return;
                }
                if (skey != undefined && pkey != undefined && cert != undefined) {
                    console.log("pkey: ", pkey);
                    console.log("cert: ", cert);
                    await privacyWalletConfig(skey, pkey, cert);
                    if (callback != undefined) {
                        console.log("APP callback invoked...");
                        callback();
                    }
                } else {
                    readFile(index+1);
                }
            }
            reader.readAsText(file);
          }
          readFile(0);
        }
    }
}

///////////////////////////////////////////////////
module.exports = {
    privacyWalletConfig,
    walletRegistered,
    handleSKFile
}