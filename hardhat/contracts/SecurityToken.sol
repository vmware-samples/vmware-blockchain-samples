// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./ERC20.sol";

import "hardhat/console.sol";

contract SecurityToken is ERC20 {

    constructor (
      string memory name,
      string memory symbol,
      uint256 initialSupply
    ) public ERC20(name, symbol) {
      console.log("Deploying ERC20 Token:", name, symbol);
      _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }

    function reduce (address account, uint256 amount) public virtual returns (bool) {
        _burn(account, amount);

        return true;
    }

}
