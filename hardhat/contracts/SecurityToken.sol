// SPDX-License-Identifier: MIT


import "./ERC20.sol";


contract SecurityToken is ERC20 {

    constructor (
      string memory name,
      string memory symbol,
      uint256 initialSupply
    ) public ERC20(name, symbol) {
      _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }

    function reduce (address account, uint256 amount) public virtual returns (bool) {
        _burn(account, amount);

        return true;
    }

}
