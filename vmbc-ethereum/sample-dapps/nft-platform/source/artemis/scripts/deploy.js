// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  let config = await fs.readFileSync('./src/assets/config.json');
  config = JSON.parse(config);

  if (config['DEFAULT_NFT_CONTRACT_ADDRESS'] == '' || config['REDEPLOY_CONTRACT'] == 'true') {
    const DigitalArt = await hre.ethers.getContractFactory("DigitalArt");
    const userRegContractAddress = hre.ethers.utils.getAddress(config['USER_REG_CONTRACT_ADDRESS']);
    const digitalArt = await DigitalArt.deploy(config['USER_REG_CONTRACT_ADDRESS'], (String(config['USER_REG_ENABLE']).toLowerCase() === 'true'));

    await digitalArt.deployed();
    console.log(`DigitalArt Smart Contract deployed to ${digitalArt.address}`);
    console.log(`user registration contract address ${userRegContractAddress}`);
    console.log(`user registration enable ${config['USER_REG_ENABLE']}`);

    config['DEFAULT_NFT_CONTRACT_ADDRESS'] = digitalArt.address;
    await fs.writeFileSync('./src/assets/config.json', JSON.stringify(config));
  } else {
    console.log("DigitalArt Smart Contract already deployed at " + config['DEFAULT_NFT_CONTRACT_ADDRESS']);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});