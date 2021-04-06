const { expect } = require("chai");
const tokenList = require('./../deploy/token-list.json')


describe("Transfer", function() {
  it("Validating gas is returning values, and logs is storing correctly", async function() {
    const contract = await ethers.getContractAt('SecurityToken', tokenList.tokens[0].contractAddress);

    const transferLoop = async (amount) => {
      for (let index = 0; index < amount; index++) {
          const randN = Number((Math.random() * 10000000).toFixed(0));
          const estimate = await contract.estimateGas.transfer(
            '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
            randN
          );
          const transfer = await contract.transfer(
            '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
            randN
          );
          const receipt = await web3.eth.getTransactionReceipt(transfer.hash);
          const logs = await contract.queryFilter(contract.filters.Transfer(), transfer.blockNumber);

          console.log(`Gas Estimate: ${estimate.toString()} Gas Used: ${receipt.gasUsed}, Transfer Value: ${randN} Log Value: ${logs[0].args.value.toString()}`);
          expect(randN.toString()).to.equal(logs[0].args.value.toString());
      }
    }

    await transferLoop(100);
  });
});
