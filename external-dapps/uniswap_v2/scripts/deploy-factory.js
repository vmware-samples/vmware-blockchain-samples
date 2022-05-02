const { ethers } = require('hardhat');

// Deploy function
async function deploy() {
   deployerAddress = "784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8";
   console.log(`Deploying contracts using ${deployerAddress}`);

   //Deploy WETH
   const weth = await ethers.getContractFactory('WETH');
   const wethInstance = await weth.deploy();
   await wethInstance.deployed();

   console.log(`WETH deployed to : ${wethInstance.address}`);

   //Deploy Factory
   const factory = await ethers.getContractFactory('UniswapV2Factory');
   const factoryInstance = await factory.deploy(deployerAddress);
   await factoryInstance.deployed();

   console.log(`Factory deployed to : ${factoryInstance.address}`);

   //Deploy Router passing Factory Address and WETH Address
   const router = await ethers.getContractFactory('UniswapV2Router02');
   const routerInstance = await router.deploy(
      factoryInstance.address,
      wethInstance.address
   );
   await routerInstance.deployed();

   console.log(`Router V02 deployed to :  ${routerInstance.address}`);

   //Deploy Erc20 Alice Token 
   const erc20A = await ethers.getContractFactory('Token');
   const erc20AInstance = await erc20A.deploy("Alice Token", "ATK");
   await erc20AInstance.deployed();

   console.log(`ERC20 Alice Token deployed to : ${erc20AInstance.address}`);

   //Deploy Erc20 Bob Token 
   const erc20B = await ethers.getContractFactory('Token');
   const erc20BInstance = await erc20B.deploy("Bob Token", "BTK");
   await erc20BInstance.deployed();

   console.log(`ERC20 Bob Token deployed to : ${erc20BInstance.address}`);
}

deploy()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error);
      process.exit(1);
   });
