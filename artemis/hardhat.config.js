require("@nomiclabs/hardhat-waffle");
module.exports = {
  defaultNetwork: "vmbc_local",
  networks: {
    vmbc_local: {
      url: "http://127.0.0.1:8545"
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./src/contracts",
  },
  mocha: {
    timeout: 40000
  }
}
