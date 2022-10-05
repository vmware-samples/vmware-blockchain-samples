const ethers = require("@vmware-blockchain/ethers");

const CONTRACT_ABI = [
  "function getGreeting() public view returns (string memory)",
  "function setGreeting(string memory _newGreeting) public"
];

// Contract Address of Greetings
const CONTRACT_ADDRESS = "Change-this-to-Contract-Address-of-Greetings-Contract";

// Acount 1 Private Key
const PRIVATE_KEY_ACC = "Change-this-to-a-Private-Key-of-an-Account";

verifySampleSetup();

// Setting up a JSON RPC Provider
var provider;
try {
  provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
} catch (err) {
  console.log(err);
}

const wallet = new ethers.Wallet(PRIVATE_KEY_ACC, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

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
    tx = await contractWithWallet.setGreeting("Welcome to VMware Ethereum Blckchain");
  } catch (err) {
    console.log(err);
  }
  
  rc = await tx.wait();

  var greetingAfter = await contract.getGreeting();
  console.log("Greeting After: ", greetingAfter);
}

main()

// Verifies if the variable(s) needed to be changed to run this sample are indeed changed
function verifySampleSetup() {
  var verified = true;
  if (verifyContractAddressChanged(CONTRACT_ADDRESS) == false ) {
    verified = false;
    console.log("Before running this sample, update the CONTRACT_ADDRESS as instructed in README")
  }
  if (verifyPrivateKeyChanged(PRIVATE_KEY_ACC) == false) {
    verified = false;
    console.log("Before running this sample, update the PRIVATE_KEY_ACC as instructed in README")
  }
  if (verified == false) {
    console.log("Make necessary changes before running the sample");
    process.exit(1);
  }
}

function verifyContractAddressChanged(contract_address) {
  if (contract_address === "Change-this-to-Contract-Address-of-Greetings-Contract") {
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