
let publicTransferDiv, privateTransferDiv, conversionsDiv, debugDiv, privateKeyUploadDiv, appConfigDiv;

function initShowElements(){
    publicTransferDiv = document.getElementById("publicTransferDiv");
    privateTransferDiv = document.getElementById("privateTransferDiv");
    conversionsDiv = document.getElementById("conversionsDiv");
    debugDiv = document.getElementById("debugDiv");
    privateKeyUploadDiv = document.getElementById("privateKeyUploadDiv");
    hideAllDivs();
}

function hideKeyUpload() {
    if (privateKeyUploadDiv == undefined) {
        privateKeyUploadDiv = document.getElementById("privateKeyUploadDiv");
    }
    privateKeyUploadDiv.style.display = "none";
}

function hideAppConfig() {
    if (appConfigDiv == undefined) {
        appConfigDiv = document.getElementById("appConfigure");
    }
    appConfigDiv.style.display = "none";
}

function hideAllDivs() {
    publicTransferDiv.style.display = "none";
    privateTransferDiv.style.display = "none";
    conversionsDiv.style.display = "none";
    debugDiv.style.display = "none";
}

function showPublicTransfer() {
    hideAllDivs();
    publicTransferDiv.style.display = "block";
}

function showPrivateTransfer() {
    hideAllDivs();
    privateTransferDiv.style.display = "block";
}

function showConversions() {
    hideAllDivs();
    conversionsDiv.style.display = "block";
}

function showDebug() {
    hideAllDivs();
    debugDiv.style.display = "block";
}

module.exports = {
    showPublicTransfer,
    showPrivateTransfer,
    showConversions,
    showDebug,
    hideKeyUpload,
    hideAppConfig,
    initShowElements
};