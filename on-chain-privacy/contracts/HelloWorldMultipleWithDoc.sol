pragma solidity ^0.4.19 || ^0.5;

contract DummyContract {
   function returnTrue() public pure returns (bool) {
       return true;
   }
}

/// @dev This is devdoc for HowdyWorld.
/// @notice This is userdoc for HowdyWorld.
contract HowdyWorld {
   /// @dev This is devdoc for howdy().
   /// @notice This is userdoc for howdy().
   function howdy() public pure returns (string memory) {
       return "Howdy, World!";
   }
}

/// @dev This is devdoc for HelloWorld.
/// @notice This is userdoc for HelloWorld.
contract HelloWorld {
   /// @dev This is devdoc for hello().
   /// @notice This is userdoc for hello().
   function hello() public pure returns (string memory) {
       return "Hello, World!";
   }

   function inputOutput(int256 x) public pure returns (int256) {
       return x;
   }
}
