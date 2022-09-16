const { ethers } = require("@vmware-blockchain/ethers");

const CONTRACT_ABI = [
    "function getGreeting() public view returns (string memory)"
];

// On VMBC
const CONTRACT_ADDRESS_VMBC = '0xD5367D96975a98bb84fEacfC1a601c928A28A252';

// VMBC Provider
var provider_vmbc;
try {
  provider_vmbc = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
} catch (err) {
  console.log("Cannot connect to Provider");
  console.log(err);
}

const contract = new ethers.Contract(CONTRACT_ADDRESS_VMBC, CONTRACT_ABI, provider_vmbc);

const main = async () => {
    var curGreeting;
    try {
      curGreeting = await contract.getGreeting();
    } catch (err) {
      console.log("Error while calling contract view method");
      console.log(err);
    }

    console.log("Current Greeting: ", curGreeting);
}

main()
