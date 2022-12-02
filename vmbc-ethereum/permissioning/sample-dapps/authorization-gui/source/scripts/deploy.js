// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const TokenContract = await hre.ethers.getContractFactory("Token");
  const contract = await TokenContract.deploy();

  await contract.deployed();
  console.log(
    `Erc20 Smart Contract deployed to ${contract.address}`
  );

  let config = await fs.readFileSync('./src/assets/config.json');
  config = JSON.parse(config);
  config['DEFAULT_ERC20_CONTRACT_ADDRESS'] = contract.address;
  await fs.writeFileSync('./src/assets/config.json', JSON.stringify(config));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
