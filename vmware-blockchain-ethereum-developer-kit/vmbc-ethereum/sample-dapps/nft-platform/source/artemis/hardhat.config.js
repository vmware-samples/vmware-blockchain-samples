require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require("@typechain/hardhat");
module.exports = {
  defaultNetwork: "vmbc_local",
  networks: {
    vmbc_local: {
      url: process.env.VMBC_URL || "http://127.0.0.1:8545",
      chainId: Number(process.env.VMBC_CHAIN_ID) || 5000,
      accounts: ['5bedcdfdfe7e3d9444b3494eaee4bb9339be4745d7a4f79cd4bde59d3e9e9dcc'] // TODO: need to add process.env-based consumption
    }
  },
  typechain: {
    outDir: "src/typechain",
  },
  paths: {
    sources: "./contracts",
  },
  mocha: {
    timeout: 40000
  },
  solidity: {
    version: require("./solc.version.json").version,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}
