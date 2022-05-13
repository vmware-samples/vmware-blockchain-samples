/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-ethers');

const privateKeyConcord = "5094f257d3462083bcbc02c61d98c038cfa71cdd497834c5f38cd75010ddb7a5";

module.exports = {
   defaultNetwork: 'concord',

   networks: {
      hardhat: {},
      concord: {
         url: "http://0.0.0.0:8545",
         accounts: [privateKeyConcord],
         chainId: 5000,
         from: '784e2c4D95c9Be66Cb0B9cda5b39d72e7630bCa8',
       }
   },
   solidity: {
      compilers: [
         {
            version: '0.5.16',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
         {
            version: '0.6.6',
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
};
