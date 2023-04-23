// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const DigitalArt = await hre.ethers.getContractFactory("DigitalArt");
  const digitalArt = await DigitalArt.deploy();

  await digitalArt.deployed();
  console.log(`DigitalArt Smart Contract deployed to ${digitalArt.address}`);

  let config = await fs.readFileSync('./src/assets/config.json');
  config = JSON.parse(config);
  config['DEFAULT_NFT_CONTRACT_ADDRESS'] = digitalArt.address;
  await fs.writeFileSync('./src/assets/config.json', JSON.stringify(config));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
