const { ethers, BigNumber } = require("ethers");
const values = require('./values.js');
const privacy_wallet = require("./../privacy-lib/privacy-wallet.js");
const { walletRegistered } = require('./web-privacy.js');
const { provider } = require('./web-ethereum.js');

let PublicToken;
let PrivateToken
let accounts;


async function connectWallet() {
    accounts = await provider.send("eth_requestAccounts", []);
    await UpdateInfo()
}

async function fillAccountConnection() {
    let accountElement = document.getElementById("account");
    if (ethereum.selectedAddress) {
        accounts = await provider.send("eth_requestAccounts", []);
        if (accountElement) accountElement.innerHTML = "Public address(EOA): " + accounts[0];
    }
    else if (accountElement)
        accountElement.innerHTML = "<button id=\"connectButton\" onclick=\"connectWallet()\"><b>Connect</b></button>";
}

async function UpdateInfo() {
    console.log("Updating token info...");
    if (!ethereum.selectedAddress) return;
    const blockNumber = await provider.getBlockNumber();
    document.getElementById("blockNumber").innerHTML = "block number: " + blockNumber;

    PublicToken = new ethers.Contract(values.publicContractAddress, values.getPublicTokenAbi(), provider.getSigner());
    PrivateToken = new ethers.Contract(values.privacyContractAddress, values.getPrivateTokenAbi(), provider.getSigner());
    let accounts = await provider.send("eth_requestAccounts", []);
    let balance = await PublicToken.balanceOf(accounts[0]);
    document.getElementById("publicBalance").innerHTML = "Public balance: " + balance.toString();
    if(await walletRegistered())
        await getPrivacyBudget();
    let privateBalance;
    let privacyBudget;
    let lastAddedTxNum = await PrivateToken.getNumOfLastAddedTransaction();
    let userId = await values.getUserId();
    let lastSyncedTxNum = BigNumber.from(0);
    if(userId) {
        lastSyncedTxNum = parseInt(localStorage.getItem("lastSyncedTxNum/" + userId))
        if(isNaN(lastSyncedTxNum)) lastSyncedTxNum = BigNumber.from(0);
        else lastSyncedTxNum = BigNumber.from(lastSyncedTxNum);
        if(lastSyncedTxNum.gt(lastAddedTxNum)) {
            localStorage.setItem("lastSyncedTxNum/" + userId, 0);
            lastSyncedTxNum = BigNumber.from(0);
        }
        if(lastAddedTxNum != BigNumber.from(0)) {
            if(lastAddedTxNum.gt(lastSyncedTxNum)) {
                console.log("Syncing state for tx number ", lastAddedTxNum, ", lastSyncedTxNum: ", lastSyncedTxNum);
                for(let i = lastSyncedTxNum; i.lte(lastAddedTxNum); i = i.add(1))
                {
                    if(i.eq(BigNumber.from(0))) continue;
                    await syncState(i);
                    localStorage.setItem("lastSyncedTxNum/" + userId, i);
                }
                lastSyncedTxNum = lastAddedTxNum;
            }
        }
    }
    try {
        let privacyState = await getPrivacyState();
        privateBalance = privacyState.balance;
        privacyBudget = privacyState.budget;
    }
    catch (err) {
        console.log("Failed to retrieve private balance and privacy budget: ", err);
        [privateBalance, privacyBudget] = ["unknown", "unknown"];
    }
    document.getElementById("privateBalance").innerHTML = "Private balance: " + privateBalance.toString();
    if (privacyBudget) {
        document.getElementById("privacyBudget").innerHTML = "Privacy budget: " + privacyBudget.toString();
    }
    let isAdmin = (await PublicToken._owner() == await provider.getSigner().getAddress());
    if (isAdmin) {
        mintingElementHtml =
            `
        <div>Mint recipient: <input type="text" id="mintRecipient" value="0x" size="22" /></div>
        <div>Mint value: <input type="text" id="mintValue" value="0" /></div>
        <button id="sendTxButton" onclick="mintPublicToken()"><b>Mint</b></button>
        `
        document.getElementById("minting").innerHTML = mintingElementHtml;
    }
    else {
        document.getElementById("minting").innerHTML = "";
    }

    document.getElementById("lastAddedTxNum").innerHTML = "Last added tx number: " + lastAddedTxNum.toString();
    document.getElementById("lastSyncedTxNum").innerHTML = "Last synced tx number: " + lastSyncedTxNum.toString() +
    `<button id="resetLastSyncedTxNum" onclick="resetLastSyncedTxNum()"><b>Reset</b></button>`;
    fillAccountConnection();
}

async function resetLastSyncedTxNum() {
    let userId = await values.getUserId();
    localStorage.setItem("lastSyncedTxNum/" + userId, 0);
    UpdateInfo();
}

async function sendPublicTokenTransfer() {
    const recipient = document.getElementById("transferRecipient").value;
    const value = document.getElementById("transferValue").value;

    if (recipient.length != 42) {
        window.alert("Invalid address " + recipient);
        return;
    }
    else if (value <= 0) {
        window.alert("Invalid value " + value);
        return;
    }

    await PublicToken.transfer(recipient, value);
}

async function mintPublicToken() {
    const recipient = document.getElementById("mintRecipient").value;
    const value = document.getElementById("mintValue").value;

    if (recipient.length != 42) {
        window.alert("Invalid address " + recipient);
        return;
    }
    else if (value <= 0) {
        window.alert("Invalid value " + value);
        return;
    }

    await PublicToken.mint(recipient, value);
}

async function getPrivacyState() {
    let privacyState = await privacy_wallet.get_privacy_state();
    console.log("Private balance: ", privacyState.balance, ", privacy budget: ", privacyState.budget);
    return privacyState;
}

async function convertPublicToPrivate() {
    const value = document.getElementById("publicToPrivateValue").value;
    let lastAddedTxNum = await PrivateToken.getNumOfLastAddedTransaction();
    console.log("Converting ", value, " public token to private token");
    let userId = await values.getUserId();
    await privacy_wallet.convert_public_to_private(values.getPrivateTokenAbi(), values.privacyContractAddress, values.getPublicTokenAbi(), values.publicContractAddress,
        undefined, userId, value, parseInt(lastAddedTxNum) + 1);
}

async function convertPrivateToPublic() {
    const value = document.getElementById("privateToPublicValue").value;
    let lastAddedTxNum = await PrivateToken.getNumOfLastAddedTransaction();
    console.log("Converting ", value, " private token to public token");
    let userId = await values.getUserId()
    await privacy_wallet.convert_private_to_public(values.getPrivateTokenAbi(), values.privacyContractAddress, values.getPublicTokenAbi(), values.publicContractAddress, 
        undefined, undefined, userId, value);
}

async function sendPrivateTokenTransfer(privateTransferAddressbookNumber) {
    let recipientId = localStorage.getItem("recipientName/" + privateTransferAddressbookNumber);
    let recipientPubKey = localStorage.getItem("recipientPubKey/" + privateTransferAddressbookNumber);
    const value = document.getElementById("privateTransferValue").value;
    let lastAddedTxNum = await PrivateToken.getNumOfLastAddedTransaction();

    pkey = Buffer.from(recipientPubKey, 'utf8');
    console.log("Sending private transfer to user ", recipientId, " pkey: ", pkey, ", value: ", parseInt(value))

    await privacy_wallet.transfer(values.getPrivateTokenAbi(), values.privacyContractAddress, undefined, recipientId,
        pkey, parseInt(value), parseInt(lastAddedTxNum) + 1);
}

async function handleFile() {
    var fileInput = document.getElementById('pkFile');
    var file = fileInput.files[0]
    var reader = new FileReader();
    reader.addEventListener("load", () => {
        console.log("Loaded pubkey: ", reader.result)
        document.getElementById("privateTransferRecipientPubKey").value = reader.result;
    });
    reader.readAsText(file);
}

async function syncState(lastKnownTxNum) {
    await privacy_wallet.sync_state(values.getPrivateTokenAbi(), values.privacyContractAddress, lastKnownTxNum);
}

async function syncTriggered() {
    console.log("Sync triggered");
    const syncFrom = document.getElementById("syncFromTxNumber").value;
    await syncState(syncFrom);
}

async function getPrivacyBudget() {
    await privacy_wallet.get_privacy_budget(values.getPrivateTokenAbi(), values.privacyContractAddress, await values.getUserId());
}

async function showPrivateTransferAddressbook() {
    if(typeof(Storage) === "undefined")
        throw new Error("Web storage not supported");
    const privateTransferAddressbookNumbers = JSON.parse(localStorage.getItem("privateTransferAddressbookNumbers"));
    let html = ""
    if(!privateTransferAddressbookNumbers) {
        document.getElementById("knownRecipientsDiv").innerHTML = html;
        return;
    }
    for(let i = 0; i < privateTransferAddressbookNumbers.length; i++) {
        let addressbookNumber = privateTransferAddressbookNumbers[i];
        let recipientName = localStorage.getItem("recipientName/" + addressbookNumber);
        let recipientPubKey = localStorage.getItem("recipientPubKey/" + addressbookNumber);
        html += "<b>" + recipientName + "</b>";
        html += "<button onclick=sendPrivateTokenTransfer(\"" + addressbookNumber + "\"" ;
        html +=  ")>Send</button>";
        html += "<button onclick=removePrivateTransferRecipient(\"" + addressbookNumber + "\"" ;
        html +=  ")>Remove recipient</button>";
        html += "<br/>\t" + recipientPubKey + "<br/><br/>";
    }
    document.getElementById("knownRecipientsDiv").innerHTML = html;
}

async function addPrivateTransferRecipient() {
    const recipientId = document.getElementById("privateTransferRecipientId").value;
    const recipientPubKey = document.getElementById("privateTransferRecipientPubKey").value;
    if(!recipientId || !recipientPubKey)
        throw new Error("Invalid parameters for adding new recipient");
    let privateTransferAddressbookNumbers = JSON.parse(localStorage.getItem("privateTransferAddressbookNumbers"));
    let lastAddressbookNumber;
    if(!privateTransferAddressbookNumbers) {
        privateTransferAddressbookNumbers = new Array();
        lastAddressbookNumber = Number(-1);
    }
    else
        lastAddressbookNumber = Number(privateTransferAddressbookNumbers[privateTransferAddressbookNumbers.length - 1]);
    localStorage.setItem("recipientName/" + (lastAddressbookNumber + 1), recipientId);
    localStorage.setItem("recipientPubKey/" + (lastAddressbookNumber + 1), recipientPubKey);
    privateTransferAddressbookNumbers.push(lastAddressbookNumber + 1);
    localStorage.setItem("privateTransferAddressbookNumbers", JSON.stringify(privateTransferAddressbookNumbers));
    showPrivateTransferAddressbook();
}

async function removePrivateTransferRecipient(addressbookNumber) {
    let privateTransferAddressbookNumbers = JSON.parse(localStorage.getItem("privateTransferAddressbookNumbers"));
    let indexOfAddressbookNumber = privateTransferAddressbookNumbers.indexOf(Number(addressbookNumber));
    if(indexOfAddressbookNumber == -1)
        throw new Error("Attempting to remove nonexistent addressbook number: " + addressbookNumber);
    privateTransferAddressbookNumbers.splice(indexOfAddressbookNumber, 1);
    localStorage.setItem("privateTransferAddressbookNumbers", JSON.stringify(privateTransferAddressbookNumbers));
    showPrivateTransferAddressbook();
}

window.ethereum.on('accountsChanged', function (accounts) {
    fillAccountConnection();
})

module.exports = {
    fillAccountConnection,
    connectWallet,
    UpdateInfo,
    sendPublicTokenTransfer,
    sendPrivateTokenTransfer,
    mintPublicToken,
    convertPublicToPrivate,
    convertPrivateToPublic,
    syncTriggered,
    handleFile,
    showPrivateTransferAddressbook,
    addPrivateTransferRecipient,
    removePrivateTransferRecipient,
    resetLastSyncedTxNum
};
