// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SecurityToken.sol";

contract Factory {

    struct security_token {
      SecurityToken st;
      address stAddress;
      bool isPresent;
    }
    /**
     * @dev st_map stores the mapping of isin corresponding to respective security tokens(bond series) minted so far.
     */
    mapping(string => security_token) public st_map;
    event SecurityTokenCreated(address tokenAddress);



    /**
     * @dev deploy a new ST with given ISIN
     * returns the address of the new ST
     */
    function deployNewST (address exchange, string memory isin, uint8 interest_rate, uint8 cost_in_pt, uint maturity_date, uint256 amount) internal returns (address){
      require(st_map[isin].isPresent != true, "ISIN already present");
      SecurityToken st = new SecurityToken("security token", "ST", amount, interest_rate, cost_in_pt, isin, maturity_date, exchange);
      emit SecurityTokenCreated(address(st));
      st_map[isin].st = st;
      st_map[isin].stAddress = address(st);
      st_map[isin].isPresent = true;
      return address(st);
    }
}