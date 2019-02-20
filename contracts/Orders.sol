/*
 * Copyright 2019 VMware, all rights reserved.
 */

pragma solidity >=0.4.21 <0.6.0;

import "./Order.sol";

/**
 * @title Parent contract for each order
 */
contract Orders {
  address[] public orders;

  /**
   * @dev Create a new order
   * @param product Is the product name for the order
   * @param amount Amount of product requested
   */
  function create(bytes32 product, uint amount)
    public
    payable
    returns (address)
  {
    address newOrder = new Order(product, amount);

    orders.push(newOrder);
    return newOrder;
  }

}
