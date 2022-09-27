require("@nomiclabs/hardhat-waffle");
module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    vmbc: {
      url: "http://127.0.0.1:8545"
    }
  },
  solidity: {
    version: "0.5.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
  },
  mocha: {
    timeout: 40000
  }
}
