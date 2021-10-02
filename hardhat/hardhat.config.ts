import { extendEnvironment } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { config } from "dotenv";

config();

process.env['NODE_TLS_REJECT_UNAUTHORIZED']="0"
extendEnvironment(hre => {
  const Web3 = require("web3");
  // @ts-ignore
  hre['Web3'] = Web3;

  // hre.network.provider is an EIP1193-compatible provider.

  // @ts-ignore
  hre['web3'] = new Web3(hre.network.provider);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  defaultNetwork: "concord",
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    imports: `imports`
  },
  networks: {
    hardhat: {
    },
    concord: {
      url: "http://localhost:8545",
      chainId: 5000,
      from: '627306090abaB3A6e1400e9345bC60c78a8BEf57',
    }
  },
  solidity: "0.7.3",
  namedAccounts: {
    deployer: {
        default: 0,
    },
  }
};
