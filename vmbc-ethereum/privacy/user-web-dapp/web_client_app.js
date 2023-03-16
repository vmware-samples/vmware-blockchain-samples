// This APP is WEB based and only intended to get run from browser!
const { grpcClient, updateWalletServiceUrl } = require('./web-grpc.js');
const pubToken = require('./publicToken.js');
const values = require('./values.js');
const showElements = require('./web-show-elements.js');
const privacy_wallet = require("./../privacy-lib/privacy-wallet.js");
const { walletRegistered, handleSKFile } = require('./web-privacy.js');
const { walletPermissionRequest, provider } = require('./web-ethereum.js');

// Page load entry point from index.html. Everything starts here!
async function onPageLoaded() {
    // always get wallet url so user has control to his local endpoint
    alert("Configure privacy wallet service url");
}

async function setWalletServiceUrl() {
    try {
        console.log("invoking app config callback..");
        vmbcUrl = document.getElementById("vmbcUrl").value;
        privacy_wallet.setVmbcUrl(vmbcUrl);
        await values.setWalletServiceUrl(bootStrap);
        updateWalletServiceUrl();
    } catch (err) {
        console.error("Failed to start the app: ", err);
    }
}

async function bootStrap() {
    showElements.hideAppConfig();
    // get permissions from ethereum window!
    await walletPermissionRequest();
    showElements.initShowElements();
    // load all contract details..
    await values.initializeContractDetails();
    let registered = await walletRegistered();
    try {
        if (!registered) {
            let msg = "user not registered, upload keys & certs required for registration!";
            console.log(msg);
            alert(msg);
            await handleSKFile(StartApp);
        } else {
            await StartApp();
        }
        provider.on("block", (blockNumber) => {
            console.log("Received new block with number: ", blockNumber);
            UpdateInfo();
        })
    } catch (err) {
        console.error("Failed to start the app: ", err);
    }
}
async function StartApp() {
    let resp = await privacy_wallet.get_privacy_state();
    console.log("State response: ", resp);
    values.setUserId(resp.userId);
    // hide key upload option since it must be done before start of app!
    showElements.hideKeyUpload();
    document.getElementById("userID").innerHTML = "privacy userID (pid): " + values.getUserId();
    pubToken.showPrivateTransferAddressbook();
    await pubToken.UpdateInfo();
}

window.connectWallet = pubToken.connectWallet;
window.fillAccountConnection = pubToken.fillAccountConnection;
window.UpdateInfo = pubToken.UpdateInfo;
window.sendPublicTokenTransfer = pubToken.sendPublicTokenTransfer;
window.sendPrivateTokenTransfer = pubToken.sendPrivateTokenTransfer;
window.mintPublicToken = pubToken.mintPublicToken;
window.convertPublicToPrivate = pubToken.convertPublicToPrivate;
window.convertPrivateToPublic = pubToken.convertPrivateToPublic;
window.syncTriggered = pubToken.syncTriggered;
window.handleFile = pubToken.handleFile;
window.addPrivateTransferRecipient = pubToken.addPrivateTransferRecipient
window.showPrivateTransferAddressbook = pubToken.showPrivateTransferAddressbook
window.removePrivateTransferRecipient = pubToken.removePrivateTransferRecipient

window.showPublicTransfer = showElements.showPublicTransfer
window.showPrivateTransfer = showElements.showPrivateTransfer
window.showConversions = showElements.showConversions
window.showDebug = showElements.showDebug
window.onPageLoaded = onPageLoaded
window.setWalletServiceUrl = setWalletServiceUrl
