// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import fs from 'fs';
import tks from "../deploy/token-list.json";
import { BigNumber, Contract } from "ethers";

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
    deployedContracts.push(securityToken.address)

    console.log(`${token.name} deployed to:`, securityToken.address);
  }

  console.log('Saving contract addresses');
  fs.writeFileSync(__dirname + '/../deploy/token-list.json', JSON.stringify(tks, null, 2));

  console.log('Airdrop tokens');
  const accounts = {
    alice: '0x784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8',
    bob: '0xF4d5B303A15b04D7C6b7510b24c62D393805B8d7',
    charlie: '0x67C94d4a4fab02697513e4611A4742a98879aD56',
  }

  for (const address of deployedContracts) {
    const contract = await ethers.getContractAt('SecurityToken', address)
    const decimals = await contract.decimals()
    const amount = BigNumber.from(10).pow(decimals).mul(1000)
    for (const account of Object.values(accounts)) {
      await contract.transfer(account, amount)
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
