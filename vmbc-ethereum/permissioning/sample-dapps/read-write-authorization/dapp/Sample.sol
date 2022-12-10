pragma solidity ^0.8.0;

contract Sample {
    uint _testInt;
    event SetValue(uint _testInt);
    function set(uint x) public  {
        _testInt = x;
        emit SetValue(_testInt);
    }
    function get() public view returns (uint) {
        return _testInt;
    }
}

