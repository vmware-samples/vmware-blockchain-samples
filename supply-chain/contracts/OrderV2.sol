/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

import "./OrderV1.sol";

/**
 * @title OrderV2
 * @dev Sample version 2 of the order contract
 */
contract OrderV2 is OrderV1 {
  constructor(bytes32 product, uint amount, address creator)
    public
    OrderV1(product, amount, creator)
  { }

  function testUpgrade()
    public pure returns(string) {
      return("hello world");
    }
}
