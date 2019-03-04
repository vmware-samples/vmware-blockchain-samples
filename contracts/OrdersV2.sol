/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

import "./OrderProxy.sol";
import "./OrdersV1.sol";
import "./OrdersV2.sol";
import "./OrderV2.sol";

/**
 * @title Parent contract for each order
 */
contract OrdersV2 is OrdersV1 {

  constructor()
    public
    OrdersV1()
  {}

  /**
   * @dev Create a new order
   * @param product Is the product name for the order
   * @param amount Amount of product requested
   */
  function create(bytes32 product, uint amount)
    public
    payable
    returns (OrderProxy)
  {
    OrderV2 newOrder = new OrderV2(product, amount, msg.sender);
    OrderProxy newOrderProxy = new OrderProxy(newOrder);

    orders.push(newOrderProxy);
    return newOrderProxy;
  }

  function getVersion()
    public pure returns(string) {
      return("2.0");
    }

}
