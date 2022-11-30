pragma solidity ^0.8.0;

contract Sample {
    uint _testInt;
    function set(uint x) public  {
        _testInt = x;
    }
    function get() public view returns (uint) {
        return _testInt;
    }
}