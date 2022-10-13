// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import "./IERC20Bond.sol";
import "./ERC20Burnable.sol";

/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract SecurityToken is ERC20Burnable, IERC20Bond{

    string private _ISIN;
    uint private _maturity_date;
    uint8 private _interest_rate;
    uint8 private _cost_in_pt;
    address private _owner;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 interest_rate_,
        uint8 cost_in_pt_,
        string memory ISIN_,
        uint maturity_date_,
        address owner_
    ) ERC20(name, symbol) {
        _owner = owner_;
        _ISIN = ISIN_;
        _maturity_date = maturity_date_;
        _interest_rate = interest_rate_;
        _cost_in_pt = cost_in_pt_;
        _mint(_owner, initialSupply);
    }

    /**
     * @dev Returns the ISIN, unique to each bond series
     */
    function ISIN() public view virtual override returns (string memory) {
        return _ISIN;
    }

    /**
     * @dev Returns maturity date, a string
     */
    function maturity_date() public view virtual override returns (uint) {
        return _maturity_date;
    }

    /**
     * @dev Returns interest rate for a bond (unique to bond series)
     */
    function interest_rate() public view virtual override returns (uint8) {
        return _interest_rate;
    }

    /**
     * @dev Returns cost in payment token
     */
    function cost_in_pt() public view virtual override returns (uint8) {
        return _cost_in_pt;
    }

    /**
     * @dev Returns owner
     */
    function owner() public view virtual override returns (address) {
        return _owner;
    }

    /**
     * @dev Returns total cost in PT for given number of bonds
     */
    function totalCost (uint bonds) public view returns(uint){
        return cost_in_pt()*bonds;
    }

}

