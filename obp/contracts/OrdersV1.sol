/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

import "./OrderV1.sol";


/**
 * @title Parent contract for each order
 */
contract OrdersV1 {

   struct Supplier {
    bytes32 supplierName;
    bytes32 purchaseDate;
    uint256 supplierWt;
    uint256 warehouseWt;
    bytes32 goodsType;
    bytes32 components;
    uint256 price;
   }

    struct PlasticTransaction {
    bytes32 TransactionID;
    bytes32 CollectonCentre;
    bytes32 CollectoinDate;
    uint256 SumittedWt;
    uint256 AcceptedWt;
    bytes32 PlasticType;
    bytes32 ShippingDate;
    bytes32 ShipmentID;
    uint256 ShipmentWt;
    bytes32 ShippingReceivedDate;
    bytes32 Status;
    bytes32 UserID;
   }


   bytes32 constant None = bytes32(0);

  address[] public orders;
  Supplier[] public suppliers;
  PlasticTransaction[] public transactions;


  /**
   * @dev Create a new order
   * @param product Is the product name for the order
   * @param amount Amount of product requested
   */
  function create(bytes32 product, uint256 amount)
    public
    payable
    returns (address)

  {

    OrderV1 newOrder = new OrderV1(product, amount, msg.sender);
    orders.push(newOrder);
    return newOrder;

  }

  /**
   * @dev Create a supplier transaction to collect plastic
  */
  function createSupplierCollection( bytes32 supplierName, bytes32 purchaseDate,uint256 supplierWt,
    uint256 warehouseWt,bytes32 goodsType,bytes32 components, uint256 price)

    public
   {
    Supplier  memory supplier=Supplier(supplierName,purchaseDate,supplierWt,warehouseWt,goodsType,components,price);

    suppliers.push(supplier);

  }

 function createPlasticTransaction( bytes32 transactionID, bytes32 collectonCentre,bytes32 collectionDate,
    uint256 submittedWt,uint256 acceptedWt,bytes32 plasticType,bytes32 shippingDate,bytes32 shipmentID, uint256 shipmentWt
    ,bytes32 ShippingReceivedDate,bytes32 status,bytes32 userid)

    public
   {
    PlasticTransaction  memory transaction=PlasticTransaction(transactionID,collectonCentre,collectionDate,submittedWt,acceptedWt,
    plasticType,shippingDate,shipmentID,shipmentWt,ShippingReceivedDate,status,userid);
    transactions.push(transaction);
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

   function baz(uint32 x) public pure returns (uint32)
   {
     return  x ;
   }

}
