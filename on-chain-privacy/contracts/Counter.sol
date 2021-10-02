pragma solidity ^0.5;

contract Counter {
    int256 private count;

    constructor() public payable {
        count = 0;
    }

    function incrementCounter(int256 x) public payable {
        count += x;
    }

    function decrementCounter(int256 x) public {
        count -= x;
    }

    function getCount() public view returns (int256) {
        return count;
    }
}
