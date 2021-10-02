pragma solidity ^0.4.19 || ^0.5;
contract LargeBlockStorage {
   uint[] data;
   function createLargeBlock(uint16 size) external {
      for(uint i =0;i < size; i++){
          data.push(i);
      }
   }
}
