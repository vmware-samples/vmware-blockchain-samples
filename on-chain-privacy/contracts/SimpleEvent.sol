pragma solidity ^0.5.2;

contract Simple {
    event Event(int indexed value);

    function foo(int a) public {
        emit Event(a);
    }

    function twoEvents(int a) public {
        emit Event(a+1);
        emit Event(a+2);
    }
}
