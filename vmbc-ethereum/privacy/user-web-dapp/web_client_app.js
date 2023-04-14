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
        subscriptionUrl = document.getElementById("subscriptionServiceUrl").value;
        privacy_wallet.setSubscriptionUrl(subscriptionUrl);
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

    let appState = await privacy_wallet.get_application_data(["lastSyncedSequenceNumber", "lastStableSequenceNumber"]);
    let lastSyncedSequenceNumber = parseInt((appState.values)[0]);
    if (!lastSyncedSequenceNumber)
        lastSyncedSequenceNumber = 0;
    let lastStableSequenceNumber = parseInt((appState.values)[1]);

    // last stable sequence number is only a valid term when there were past events
    if (lastSyncedSequenceNumber == 0 || !lastStableSequenceNumber)
        lastStableSequenceNumber = 0;
    console.log("Last synced sequence number: ", lastSyncedSequenceNumber);
    console.log("Last stable sequence number: ", lastStableSequenceNumber);
    let backfillingCompleted = false;
    let backfillingStartingSequenceNumber = lastStableSequenceNumber > 0 ? lastStableSequenceNumber : lastSyncedSequenceNumber;

    // Create event subscriptions
    console.time("Subscription creation timer");
    privacy_wallet.getEventsSubscriptionObject(values.getPrivateTokenAbi(), values.privacyContractAddress).events.ClaimableTokens({
            filter: {
                contractAddress: values.privacyContractAddress,
            },
            fromBlock: "latest"
        }).on("connected", function(subscriptionId) {
            console.timeLog("Subscription creation timer");
            console.log("Claimable tokens events' subscription Id:", subscriptionId);
        }).on("data", async function(event) {
            console.log("Received event: 'Claimable tokens'");
            eventSequenceNumber = event.returnValues[1];
            const eventValues = JSON.stringify({
                "contractAddress": event.returnValues[0],
                "sequenceNumber": eventSequenceNumber});
            console.log(eventValues);
            
            await privacy_wallet.claim_transferred_coins_for_sequence_number(values.getPrivateTokenAbi(), values.privacyContractAddress, parseInt(eventSequenceNumber));
            if (backfillingCompleted) {
                try {
                    await privacy_wallet.set_application_data(["lastSyncedSequenceNumber"], [eventSequenceNumber]);
                } catch (ex) {
                    console.error("Claimable coins event: Setting the lastSyncedSequenceNumber in the privacy wallet service has failed.", ex);
                }
            }
        });
    
    // Trigger backfilling
    if(backfillingStartingSequenceNumber > 0) {
        pubToken.backfill(backfillingStartingSequenceNumber).then((successfulBackfilling) => {
            if (!successfulBackfilling) {
                throw new Error("Unable to recover the application's state");
            }
            backfillingCompleted = true;
        });        
    }

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
window.resetLastSyncedTxNum = pubToken.resetLastSyncedTxNum

window.showPublicTransfer = showElements.showPublicTransfer
window.showPrivateTransfer = showElements.showPrivateTransfer
window.showConversions = showElements.showConversions
window.showDebug = showElements.showDebug
window.onPageLoaded = onPageLoaded
window.setWalletServiceUrl = setWalletServiceUrl
