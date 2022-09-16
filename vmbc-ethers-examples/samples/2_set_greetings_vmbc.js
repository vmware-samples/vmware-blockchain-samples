const ethers = require("@vmware-blockchain/ethers");

const CONTRACT_ABI = [
  "function getGreeting() public view returns (string memory)",
  "function setGreeting(string memory _newGreeting) public"
];

// On VMBC
const CONTRACT_ADDRESS_VMBC = '0xD5367D96975a98bb84fEacfC1a601c928A28A252';

// Accounts VMBC
const account1_vmbc = "0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8";
const private_key1_vmbc = "5094f257d3462083bcbc02c61d98c038cfa71cdd497834c5f38cd75010ddb7a5";

// VMBC Provider
var provider_vmbc;
try {
  provider_vmbc = new ethers.providers.StaticJsonRpcProvider('http://127.0.0.1:8545');
} catch (err) {
  console.log(err);
}

const wallet = new ethers.Wallet(private_key1_vmbc, provider_vmbc);

const contract = new ethers.Contract(CONTRACT_ADDRESS_VMBC, CONTRACT_ABI, provider_vmbc);

const main = async () => {
    var greetingBefore;
    try {
      greetingBefore = await contract.getGreeting();
    } catch (err) {
      console.log(err);
    }
    console.log("Greeting Before: ", greetingBefore);

    const contractWithWallet = contract.connect(wallet);

    var tx;
    try {
      tx = await contractWithWallet.setGreeting("VMBC Ethers New");
    } catch (err) {
      console.log(err);
    }

    rc = await tx.wait();

    console.log(tx);

    var greetingAfter = await contract.getGreeting();
    console.log("Greeting After: ", greetingAfter);
}

main()