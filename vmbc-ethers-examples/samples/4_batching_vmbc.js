const { ethers, BigNumber } = require("ethers-enhanced");
fs = require("fs");

// Accounts VMBC
const account1 = "0x44DfF3F7Afb4Db7fea41267024466fCea391D53F"; // Acc1
const private_key1 = "73b9b07f4d7570bc8982c9a628ca5033ba9753e6a4e243ced877af5c393905a7";

const account2 = "0x180A3D5bfe4A1a50Aaf2CB99EE5FB469032BCc85"; // Acc2
const private_key2 = "3938e280b7f782d4675a9a3383875116af580633ff4c78763c2539d76ab51bde";

const account3 = "0xc8CEDEA82B307E79aAC253B137bb1f47De302f19"; // Acc3
const private_key3 = "cf75211ef8a5567fdc4afef5086456ce46f3d6f47d3b3e1a72e1b844d330dcee";

const account4 = "0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8"; // Acc4
const private_key4 = "5094f257d3462083bcbc02c61d98c038cfa71cdd497834c5f38cd75010ddb7a5";

// VMBC Provider
const provider = new ethers.providers.JsonRpcBatchProvider('http://127.0.0.1:8545');

const signer1 = new ethers.Wallet(private_key1, provider);
const signer3 = new ethers.Wallet(private_key3, provider);

const main = async () => {
    // Checking account balances before transfer transactions
    promise1 = provider.getBalance(account1);
    promise2 = provider.getBalance(account2);
    promise3 = provider.getBalance(account3);
    promise4 = provider.getBalance(account4);

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
        to: account2,
        value: ethers.utils.parseEther("0.05"),
        from: account1,
        gasPrice: BigNumber.from('0x9999999999'),
        type: 0,
        gasLimit: BigNumber.from('0x010000'),
        chainId: 5000
    };

    var rawTx2 = {
        to: account4,
        value: ethers.utils.parseEther("0.10"),
        from: account3,
        gasPrice: BigNumber.from('0x9999999999'),
        type: 0,
        gasLimit: BigNumber.from('0x010000'),
        chainId: 5000
    };

    var transferPromise1 = signer1.sendTransaction(rawTx1);
    var transferPromise2 = signer3.sendTransaction(rawTx2);

    var [tx1, tx2] = await Promise.all([transferPromise1, transferPromise2]);
    //console.log(tx1);
    //console.log(tx2);
    console.log("Transferred 0.05 from account1 to account2");
    console.log("Transferred 0.10 from account3 to account4");

    // // Checking account balances after transfer transactions
    promise1 = provider.getBalance(account1);
    promise2 = provider.getBalance(account2);
    promise3 = provider.getBalance(account3);
    promise4 = provider.getBalance(account4);

    const [newBal1, newBal2, newBal3, newBal4] = await Promise.all([promise1, promise2, promise3, promise4]);

    console.log("Account1 Balance after: " + ethers.utils.formatEther(newBal1));
    console.log("Account2 Balance after: " + ethers.utils.formatEther(newBal2));
    console.log("Account3 Balance after: " + ethers.utils.formatEther(newBal3));
    console.log("Account4 Balance after: " + ethers.utils.formatEther(newBal4));
}

main();