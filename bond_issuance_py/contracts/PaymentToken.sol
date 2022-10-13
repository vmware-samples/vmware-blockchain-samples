// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";

contract PaymentToken is ERC20 {
    address private owner;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
    }

    /**
     * @dev Throws error if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function mintAndTransfer(uint256 amount, address recipient) external onlyOwner{
        _mint(msg.sender, amount);
        transfer(recipient, amount);
    }
}