// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;

import "./IERC20.sol";

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Bond is IERC20 {
    /**
     * @dev Returns the ISIN of the token.
     */
    function ISIN() external view returns (string memory);

    /**
     * @dev Returns the maturity_date of the token.
     */
    function maturity_date() external view returns (uint);

    /**
     * @dev Returns the interest_rate of the token.
     */
    function interest_rate() external view returns (uint8);

    /**
     * @dev Returns the cost_in_pt of the token.
     */
    function cost_in_pt() external view returns (uint8);

    /**
     * @dev Returns the owner of the token.
     */
    function owner() external view returns (address);


}

