// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
contract DataCopy{

    bytes public memoryStored;

    function callDatacopy(bytes memory data) public returns (bytes memory) {

    memoryStored = data;

    return memoryStored;
    }

    function getMemoryStored() public view returns (bytes memory) {
        return memoryStored;
    }
}