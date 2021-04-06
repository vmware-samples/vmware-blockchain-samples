import { extendEnvironment, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

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
  defaultNetwork: "vmware",
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    imports: `imports`
  },
  networks: {
    hardhat: {
    },
    vmware: {
      url: "http://localhost:8545",
      chainId: 5000,
      from: '627306090abaB3A6e1400e9345bC60c78a8BEf57',

    },
    besuMultiCluster: {
      url: "<ip>",
      chainId: 2018,
      accounts: ['c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'],
      saveDeployments: true,
      from: '627306090abaB3A6e1400e9345bC60c78a8BEf57',
      gas: 3000000,
      gasPrice: 2100000
    },
  },
  solidity: "0.7.3",
  namedAccounts: {
    deployer: {
        default: 0,
    },
  }
};
