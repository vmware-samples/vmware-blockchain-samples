import { expect } from "chai";
import { ethers } from "hardhat";
import tokenList from './../deploy/token-list.json';
import swapList from './../deploy/swap-list.json';


//Swap 0x7aE271381f8dCBC81Cd9679a9cfa33F36b3D7C8A

describe("Transfer", function () {
 
  it("Validating gas is returning values, and logs is storing correctly", async function () {
   
    const contract = await ethers.getContractAt('SecurityToken', tokenList.tokens[0].contractAddress);
    const contractSC = await ethers.getContractAt('SecurityToken', tokenList.tokens[1].contractAddress);

    const randN = Number((Math.random() * 10000000).toFixed(0));

    let info = {
      //url : "http://10.72.228.91:8545",
      url : "http://localhost:8545",
      timeout : 120000
    }
    let provider = new ethers.providers.JsonRpcProvider(info);
    let privateKey =  process.env.CHARLIE_PRIV_KEY;

    let wallet = new ethers.Wallet('417fbb670417375f2916a4b0110dc7d68d81ea15aad3e6eb69f166b5bed6503f',provider); //Charlie   
    
    const swapContract = await ethers.getContractAt('Swap',  swapList.swaps[0].contractAddress);   
    
    //Charlie is approving to swap contracts
    const transferApprove = await contract.connect(wallet).approve(
      swapList.swaps[0].contractAddress,
      randN
    );
    
    let balanceOfGSTSwapBefore:bigint = await contract.balanceOf(
        swapList.swaps[0].contractAddress
    );
    console.log("SWap GST before " + balanceOfGSTSwapBefore);
  
    const balanceOfSCTSwapBefore = await contractSC.balanceOf(
      swapList.swaps[0].contractAddress
    );
    console.log("Swap SCT before " + balanceOfSCTSwapBefore);

    const balanceOfGSTCharlieBefore = await contract.balanceOf(
        process.env.CHARLIE_KEY
    );
    console.log("Charlie GST before " + balanceOfGSTCharlieBefore);

    const balanceOfSCTCharlieBefore = await contractSC.balanceOf(
        process.env.CHARLIE_KEY
    );
    console.log("Charlie SCT before " + balanceOfSCTCharlieBefore);
    
    const transferFrom = await swapContract.connect(wallet).swapTokens(
      100000 ,{gasLimit:1880000000}
    );
    
    const balanceOfGSTSwapAfter = await contract.balanceOf(
        swapList.swaps[0].contractAddress
    );
    console.log("Swap GST after " + balanceOfGSTSwapAfter);

    const balanceOfSCTSwapAfter = await contractSC.balanceOf(
        swapList.swaps[0].contractAddress
    );
    console.log("Swap SCT after " + balanceOfSCTSwapAfter);
 
    const balanceOfGSTCharlieAfter = await contract.balanceOf(
        process.env.CHARLIE_KEY
    );
    console.log("Charlie GST after " + balanceOfGSTCharlieAfter);

    const balanceOfSCTCharlieAfter = await contractSC.balanceOf(
        process.env.CHARLIE_KEY
    );
    console.log("Charlie SCT after " + balanceOfSCTCharlieAfter);

  });
});

/*

describe("Transfer", function () {
  it("Validating gas is returning values, and logs is storing correctly", async function () {
    const contract = await ethers.getContractAt('SecurityToken', tokenList.tokens[0].contractAddress);

    const transferLoop = async (amount: number) => {
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
        const receipt = await ethers.provider.getTransactionReceipt(transfer.hash);
        const logs = await contract.queryFilter(contract.filters.Transfer(), transfer.blockNumber);
        console.log(`Gas Estimate: ${estimate.toString()} Gas Used: ${receipt.gasUsed}, Transfer Value: ${randN} Log Value: ${logs[0]?.args?.value.toString()}`);

        expect(randN.toString()).to.equal(logs[0]?.args?.value.toString());
      }
    }

    await transferLoop(10);
  });
});
*/