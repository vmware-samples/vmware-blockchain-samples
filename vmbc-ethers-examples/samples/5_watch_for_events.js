const { ethers } = require("ethers-enhanced");

// VMBC Provider
var provider;
try {
    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
} catch (err) {
    console.log(err);
}
  
// On VMBC
const CONTRACT_ADDRESS_VMBC = '0xded0b894c78A54BE375Fe1515dc2a6c97684b058';

filter = {
    address: CONTRACT_ADDRESS_VMBC,
    topics: [
        ethers.utils.id("NewGreetingEvent(address,string,string)")
    ]
};

const EVENT_ABI = ["event NewGreetingEvent(address _sender, string _oldGreeting, string _newGreeting)"];

provider.on(filter, (log) => {
    iface = new ethers.utils.Interface(EVENT_ABI);
    logParsed = iface.parseLog(log);
    console.log("\nLog Event Notification: Account with address " + logParsed.args[0] + " changed greeting from `" + logParsed.args[1] + "` to `" + logParsed.args[2] + "'");
});