// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Greetings {
    string greeting = "Default-Greeting-From-Solidity";
    uint16 count = 0;

    function setGreeting(string memory _newGreeting) public {
        emit NewGreetingEvent(msg.sender, greeting, _newGreeting);
        greeting = _newGreeting;
        ++count; 
    }

    // update text
    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    event NewGreetingEvent(address _sender, string _oldGreeting, string _newGreeting);
}