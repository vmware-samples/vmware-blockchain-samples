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
      chainId: 1337
    },
    concord: {
      url: process.env.VMBC_URL || "http://localhost:8545",
      chainId: Number(process.env.VMBC_CHAIN_ID) || 5000,
      gasPrice : 0,
      from: '627306090abaB3A6e1400e9345bC60c78a8BEf57'
    },
    ganache: {
      url: "http://localhost:7545",
      chainId: 1337
    }
  },
  solidity: "0.7.3",
  namedAccounts: {
    deployer: {
        default: 0,
    },
  }
};
