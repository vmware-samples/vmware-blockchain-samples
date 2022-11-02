const ethers = require("ethers");

var setupConfig = require('./permissioning-config.json');

var permissionTypes = {
    "READ": 1,
    "WRITE": 2,
    "DEPLOY": 4
}

var VMBC_URL = setupConfig.blockchain.url;

let PROVIDER;
let ADMIN_WALLET;

let ADMIN_ACCOUNT_PRIVATE_KEY = String(setupConfig.permissioning.adminAccount.privateKey);
let PERMISSIONING_CONTRACT_ADDRESS = String(setupConfig.permissioning.contractAddress);
let PERMISSIONING_CONTRACT_ABI = [
    "function updatePermissions(address from, address to, uint8 action, bool remove)", 
    "function checkUserAction(address from, address to, uint8 action) external view returns(bool)"
];

function checkConfig() {
    if ((ADMIN_ACCOUNT_PRIVATE_KEY === "") || (PERMISSIONING_CONTRACT_ADDRESS === "")) {
        console.log("privateKey and contractAddress of permissioning is mandatory to provide in config");
        return false;
    }
    return true;
}

function setupAdminProviderAndWallet() {
    PROVIDER = new ethers.providers.JsonRpcProvider(VMBC_URL);
    ADMIN_WALLET = new ethers.Wallet(ADMIN_ACCOUNT_PRIVATE_KEY, PROVIDER);
}

function processPermissions(permArr) {
    let perm = 0;
    if (permArr.includes("READ", 0)) {
        perm += permissionTypes.READ;
    }
    if (permArr.includes("WRITE", 0)) {
        perm += permissionTypes.WRITE;
    }
    if (permArr.includes("DEPLOY", 0)) {
        perm += permissionTypes.DEPLOY;
    }
    return perm;
}

const checkAndUpdatePermissions = async (account, allPermissions) => {
    var hasRequiredPermissions = await checkPermissions(account, allPermissions)
    if (!hasRequiredPermissions) {
        return updatePermissions(account.address, allPermissions, 0);
    }
}

const checkPermissions = async (account, allPermissions) => {
    console.log("Checking permissions for " + account.address);
    let fromAddress = account.address;
    
    let toAddress = "0x0000000000000000000000000000000000000000";
    const contract = new ethers.Contract(PERMISSIONING_CONTRACT_ADDRESS, PERMISSIONING_CONTRACT_ABI, PROVIDER);
    var response = "";
    try {
        response = await contract.checkUserAction(fromAddress, toAddress, allPermissions);
    } catch (error) {
        console.log("Error while calling checkUserAction()...");
        console.log(error);
        process.exit(1);
    }
    if (response) {
        console.log("\x1b[34m%s\x1b[0m", "Account "+ fromAddress + " already has required permissions.");
        console.log("");
        return true;
    } else {
        console.log("\x1b[34m%s\x1b[0m", "Account "+ fromAddress + " does not have required permissions.");
        return false;
    }
}

const updatePermissions = async (accAddr, allPermissions, addOrRemove) => {
    console.log("Updating permissions for " + accAddr + " with permissions " + allPermissions);
    let fromAddress = accAddr;
    let toAddress = "0x0000000000000000000000000000000000000000";

    const contract = new ethers.Contract(PERMISSIONING_CONTRACT_ADDRESS, PERMISSIONING_CONTRACT_ABI, PROVIDER);
    const contractWithSigner = contract.connect(ADMIN_WALLET);
    let tx = "";
    try {
        tx = await contractWithSigner.updatePermissions(fromAddress, toAddress, allPermissions, addOrRemove);
    } catch (error) {
        console.log("Error while calling set()...");
        console.log(error);
        process.exit(1);
    }
    const txReceipt = await tx.wait();
    if (txReceipt) {
        console.log("\x1b[34m%s\x1b[0m", "Permission updated for " + fromAddress)
        console.log("\x1b[34m%s\x1b[0m",  "Transaction hash: " + tx.hash);
        console.log("");
        return true;
    }
    return false;
}

const main = async () => {
    var isConfigProvided = checkConfig();
    if (isConfigProvided === false) {
        console.log("Provide the required config and try again");
        process.exit(1);
    }

    setupAdminProviderAndWallet()

    // Update to required permissions
    for (var account of setupConfig.accounts) {
        console.log("Processing update permissions for account " + account.address);
        await checkAndUpdatePermissions(account, processPermissions(account.permissions.requiredPermissions));
    }
}

main();