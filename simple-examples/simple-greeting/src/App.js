import React, { Component } from "react";
const { ethers } = require("@vmware-blockchain/ethers")

// Ganache
// const CONTRACT_ADDRESS = "0xaB4450685CEF76e8382418DC4F387cCc1fF571e1";

// VMBC
const CONTRACT_ADDRESS = "0x6DB36702619Eb871b1cE5A722223a7A4f14654Fc";

const CONTRACT_ABI = [
  "function getGreeting() public view returns (string memory)",
  "function setGreeting(string memory _newGreeting) public"
];

class App extends Component {
  constructor() {
    super();
    this.state = { data: [] };
  }

  async componentDidMount() {
    try {
      var accouts = await window.ethereum.request({method: 'eth_requestAccounts'});
      console.log(accouts);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());
      var oldGreeting = await contract.getGreeting();
      console.log("Old Greeting: " + oldGreeting);

      var newGreetingForSolidity = "newGreetingAgain3";
      var tx = await contract.setGreeting(newGreetingForSolidity);
      console.log(tx);
      await tx.wait();
      console.log("Changed Greeting in Blockchain");

      var newGreeting = await contract.getGreeting();
      console.log("New Greeting: " + newGreeting);
    } catch(error) {
      console.log("Exception caught: " + error);
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Hello World!</h1>
      </div>
    );
  }
}

export default App;
