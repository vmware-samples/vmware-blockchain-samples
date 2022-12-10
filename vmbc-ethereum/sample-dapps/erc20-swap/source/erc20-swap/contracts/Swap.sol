// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./IERC20.sol";

contract Swap {
    IERC20 public token1;
    IERC20 public token2;
    uint public rate;

    constructor(
        address _token1,
        address _token2,
        uint _rate
    ) public {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        rate = _rate;
    }

    function swapTokens(uint256 amount) public returns (bool) {
        
        require(amount > 0, "Amount should be positive");
        uint256 allowance = token1.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        token1.transferFrom(msg.sender, address(this), amount);
        token2.transfer(msg.sender, amount);
        return true;
    }
}

