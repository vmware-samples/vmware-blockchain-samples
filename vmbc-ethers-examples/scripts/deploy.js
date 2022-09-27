// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Greeting = await hre.ethers.getContractFactory("Greetings");
  const greeting = await Greeting.deploy();

  await greeting.deployed();
  console.log(
    `Greeting deployed to ${greeting.address}`
  );

  const DataCopy = await hre.ethers.getContractFactory("DataCopy");
  const dataCopy = await DataCopy.deploy();

  await dataCopy.deployed();
  console.log(
    `DataCopy deployed to ${dataCopy.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
