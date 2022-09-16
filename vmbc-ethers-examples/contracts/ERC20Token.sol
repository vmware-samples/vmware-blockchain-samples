// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {

        _mint(msg.sender, 9000000000000000000000000000);
    }
}