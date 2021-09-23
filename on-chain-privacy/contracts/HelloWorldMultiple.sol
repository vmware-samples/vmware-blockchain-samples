pragma solidity ^0.4.19 || ^0.5;

contract DummyContract {
   function returnTrue() public pure returns (bool) {
       return true;
   }
}

contract HowdyWorld {
   function howdy() public pure returns (string memory) {
       return "Howdy, World!";
   }
}

contract HelloWorld {
   function hello() public pure returns (string memory) {
       return "Hello, World!";
   }
}
