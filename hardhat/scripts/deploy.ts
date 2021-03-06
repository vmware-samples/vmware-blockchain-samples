// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import fs from 'fs';
import tks from "../deploy/token-list.json";
import { BigNumber, Contract } from "ethers";
import Web3 from "web3";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const deployedContracts = []

  for (const token of tks.tokens) {
    const SecurityToken = await ethers.getContractFactory("SecurityToken");
    const securityToken = await SecurityToken.deploy(
      token.name, token.symbol, token.amount
    );

    await securityToken.deployed();
    token.contractAddress = securityToken.address;
    deployedContracts.push([token.name, securityToken.address])

    console.log(`${token.name} deployed to:`, securityToken.address);
  }

  console.log('Saving contract addresses');
  fs.writeFileSync(__dirname + '/../deploy/token-list.json', JSON.stringify(tks, null, 2));

  console.log('Transfering tokens');
  const accounts = {
    alice: process.env.ALICE_KEY,
    bob: process.env.BOB_KEY,
    charlie: process.env.CHARLIE_KEY,
  }

  for (const [token, address] of deployedContracts) {
    const contract = await ethers.getContractAt('SecurityToken', address)
    const decimals = await contract.decimals()
    const amount = BigNumber.from(10).pow(decimals).mul(1000)
    for (const [name, account] of Object.entries(accounts)) {
      console.log(`Transfering ${token} to ${name} @ ${account}`);
      await contract.transfer(account, amount);
    }
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

