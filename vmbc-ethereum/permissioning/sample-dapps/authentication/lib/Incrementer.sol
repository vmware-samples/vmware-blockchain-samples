// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Incrementer {
    uint256 public number;
    event Increment(uint256 _value);

    constructor(uint256 _initialNumber) {
        number = _initialNumber;
    }

    function increment(uint256 _value) public {
        number = number + _value;
        emit Increment(_value);
    }

    function reset() public {
        number = 0;
    }
}