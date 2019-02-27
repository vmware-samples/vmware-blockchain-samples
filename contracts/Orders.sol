/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

import "./Order.sol";

/**
 * @title Parent contract for each order
 */
contract Orders {
  Order[] public orders;

  /**
   * @dev Create a new order
   * @param product Is the product name for the order
   * @param amount Amount of product requested
   */
  function create(bytes32 product, uint amount)
    public
    payable
    returns (Order)
  {
    Order newOrder = new Order(product, amount, msg.sender);

    orders.push(newOrder);
    return newOrder;
  }

  /**
   * @dev Returns how many orders have been created
   */
  function getAmount()
    public
    view
    returns(uint)
  {
    return (orders.length);
  }

}
