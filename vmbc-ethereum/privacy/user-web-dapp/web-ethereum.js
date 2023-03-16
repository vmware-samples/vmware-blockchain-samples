const { ethers } = require("ethers");
const { set_transaction_callback } = require("./../privacy-lib/privacy-wallet.js");

///////////////////////////////////////////////////
// Transaction callback
///////////////////////////////////////////////////
// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum);
async function walletPermissionRequest() {
    console.log("get permissions from metamask");
    // MetaMask requires requesting permission to connect users accounts
    let mresp = await provider.send("eth_requestAccounts", []);
    console.log("metamask account resp: ", mresp);
}

const signer = provider.getSigner();

async function sendTransaction(tx) {
    console.log("Transaction: ", tx);
    const receipt = await signer.sendTransaction(tx);
    console.log("Transaction receipt: ", receipt);

}

set_transaction_callback(async (req) => { return sendTransaction(req); });
///////////////////////////////////////////////////

module.exports = {
    walletPermissionRequest,
    provider
}