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
  let contractaddr = "0x0";

  for (const token of tks.tokens) {
    const SecurityToken = await ethers.getContractFactory("SecurityToken");
    const securityToken = await SecurityToken.deploy(
      token.name, token.symbol, token.amount
    );

    await securityToken.deployed();
    token.contractAddress = securityToken.address;
    deployedContracts.push([token.name, securityToken.address])

    if (token.name.localeCompare("GenericSecurityToken") == 0) {
      contractaddr = securityToken.address;
    }

    console.log(`${token.name} deployed to:`, securityToken.address);
  }

  console.log('Saving contract addresses');
  fs.writeFileSync(__dirname + '/../deploy/token-list.json', JSON.stringify(tks, null, 2));

  // store GenericSecurityToken contract address in postgres db
  const { Client } = require("pg");

	const credentials = {
		user: "postgres",
		host: "localhost",
		database: "postgres",
		password: "postgres",
		port: 5432,
	};

	async function pgStore() {
		const client = new Client(credentials);
		await client.connect();
		let str1 = "INSERT INTO contract (version, address, attributes) VALUES ('1', '";
		let str2 = contractaddr;
		let str3 = "', 'name => \"GenericSecurityToken\"')";
		let res = str1.concat(str2, str3);
		const now = await client.query(res);
		await client.end();

		return now;
	}

  const pgResult = await pgStore();
  console.log("result: " + pgResult);

  // Disbursing tokens to alice, bob and charlie
  console.log('Disbursing tokens to alice, bob and charlie');
  const accounts = {
    alice: process.env.ALICE_KEY,
    bob: process.env.BOB_KEY,
    charlie: process.env.CHARLIE_KEY,
  }

  for (const [token, address] of deployedContracts) {
    const contract = await ethers.getContractAt('SecurityToken', address)
	const amount = 10000000;
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
