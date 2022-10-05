const { ethers, BigNumber } = require("@vmware-blockchain/ethers");

// Account 1 with Private Key
const ACCOUNT_1 = "Change-this-to-Address-of-an-Account";
const PRIVATE_KEY_ACC_1 = "Change-this-to-a-Private-Key-of-an-Account";

// Account 2
const ACCOUNT_2 = "Change-this-to-Address-of-an-Account";

// Account 3 with Private Key
const ACCOUNT_3 = "Change-this-to-Address-of-an-Account";
const PRIVATE_KEY_ACC_3 = "Change-this-to-a-Private-Key-of-an-Account";

// Account 4
const ACCOUNT_4 = "Change-this-to-Address-of-an-Account";

verifySampleSetup();

// Setting up a JSON RPC Provider
const provider = new ethers.providers.JsonRpcBatchProvider('http://127.0.0.1:8545');

const signer1 = new ethers.Wallet(PRIVATE_KEY_ACC_1, provider);
const signer3 = new ethers.Wallet(PRIVATE_KEY_ACC_3, provider);

const main = async () => {
    // Checking account balances before transfer transactions
    promise1 = provider.getBalance(ACCOUNT_1);
    promise2 = provider.getBalance(ACCOUNT_2);
    promise3 = provider.getBalance(ACCOUNT_3);
    promise4 = provider.getBalance(ACCOUNT_4);

    const [oldBal1, oldBal2, oldBal3, oldBal4] = await Promise.all([promise1, promise2, promise3, promise4]);

    console.log("Account1 Balance before: " + ethers.utils.formatEther(oldBal1));
    console.log("Account2 Balance before: " + ethers.utils.formatEther(oldBal2));
    console.log("Account3 Balance before: " + ethers.utils.formatEther(oldBal3));
    console.log("Account4 Balance before: " + ethers.utils.formatEther(oldBal4));

    /*
        Account balance transfer transactions
        acc1 --> acc2
        acc3 --> acc4
    */
    var rawTx1 = {
        from: ACCOUNT_1,
        to: ACCOUNT_2,
        value: ethers.utils.parseEther("0.05"),
        gasPrice: BigNumber.from('0x9999999999'),
        type: 0,
        gasLimit: BigNumber.from('0x010000'),
        chainId: 5000
    };

    var rawTx2 = {
        from: ACCOUNT_3,
        to: ACCOUNT_4,
        value: ethers.utils.parseEther("0.10"),
        gasPrice: BigNumber.from('0x9999999999'),
        type: 0,
        gasLimit: BigNumber.from('0x010000'),
        chainId: 5000
    };

    var transferPromise1 = signer1.sendTransaction(rawTx1);
    var transferPromise2 = signer3.sendTransaction(rawTx2);

    var [tx1, tx2] = await Promise.all([transferPromise1, transferPromise2]);

    console.log("Transferred 0.05 from account1 to account2");
    console.log("Transferred 0.10 from account3 to account4");

    // Checking account balances after transfer transactions
    promise1 = provider.getBalance(ACCOUNT_1);
    promise2 = provider.getBalance(ACCOUNT_2);
    promise3 = provider.getBalance(ACCOUNT_3);
    promise4 = provider.getBalance(ACCOUNT_4);

    const [newBal1, newBal2, newBal3, newBal4] = await Promise.all([promise1, promise2, promise3, promise4]);

    console.log("Account1 Balance after: " + ethers.utils.formatEther(newBal1));
    console.log("Account2 Balance after: " + ethers.utils.formatEther(newBal2));
    console.log("Account3 Balance after: " + ethers.utils.formatEther(newBal3));
    console.log("Account4 Balance after: " + ethers.utils.formatEther(newBal4));
}

main();

// Verifies if the variable(s) needed to be changed to run this sample are indeed changed
function verifySampleSetup() {
    var verified = true;
    if ((verifyAccountAddressChanged(ACCOUNT_1) && verifyAccountAddressChanged(ACCOUNT_2) && verifyAccountAddressChanged(ACCOUNT_3) && verifyAccountAddressChanged(ACCOUNT_4)) == false) {
        verified = false;
        console.log("Before running this sample, update ACCOUNT_1, ACCOUNT_2, ACCOUNT_3 and ACCOUNT_4 as instructed in README")
    }
    if ((verifyPrivateKeyChanged(PRIVATE_KEY_ACC_1) && verifyPrivateKeyChanged(PRIVATE_KEY_ACC_3)) == false ) {
        verified = false;
        console.log("Before running this sample, update PRIVATE_KEY_ACC_1 and PRIVATE_KEY_ACC_3 as instructed in README")
    }

    if (verified == false) {
        console.log("Make necessary changes before running the sample");
        process.exit(1);
    }
}

function verifyAccountAddressChanged(acc_address) {
    if (acc_address === "Change-this-to-Address-of-an-Account") {
        return false;
    }
    return true;
}

function verifyPrivateKeyChanged(private_key) {
    if (private_key === "Change-this-to-a-Private-Key-of-an-Account") {
        return false;
    }
    return true;
}