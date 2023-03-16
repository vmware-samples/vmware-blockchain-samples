const { X509Certificate, createHash } = require('crypto');
const privacyContractAddress = '0x44f95010ba6441e9c50c4f790542a44a2cdc1281';
const publicContractAddress = '0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43';
let privateTokenAbi, publicTokenAbi, userID;
let walletServiceUrl = "http://localhost:8080";

async function setUserIdFromPublicKey(publicKey) {
    userID = createHash('sha256').update(publicKey).digest('hex');
    console.log("setting user id: ", userID);    
}

async function setWalletServiceUrl(callback) {
    walletServiceUrl = document.getElementById("walletServiceUrl").value;
    console.log("wallet service url set to: ", walletServiceUrl);
    callback();
}

function getUserId() {
    return userID;
}

function setUserId(value) {
    userID = value;
}

async function getUserIdFromCert(cert) {
    const x509cert = new X509Certificate(cert);
    return createHash('sha256').update(x509cert.publicKey).digest('hex');
}

async function initializeContractDetails() {
    console.log("loading contract ABI...");
    let privateTokenAbiFetch = await fetch("./PrivacyToken.abi");
    privateTokenAbi = await privateTokenAbiFetch.json();
    let publicTokenAbiFetch = await fetch("./PublicToken.abi");
    publicTokenAbi = await publicTokenAbiFetch.json();
}

function getPrivateTokenAbi() {
    return privateTokenAbi;
}

function getPublicTokenAbi() {
    return publicTokenAbi;
}

function getWalletServiceUrl() {
    return walletServiceUrl;
}

module.exports = {
    // constants
    privacyContractAddress,
    publicContractAddress,
    // functions
    getWalletServiceUrl,
    setWalletServiceUrl,
    getUserId,
    setUserIdFromPublicKey,
    initializeContractDetails,
    getPrivateTokenAbi,
    getPublicTokenAbi,
    setUserId
};
