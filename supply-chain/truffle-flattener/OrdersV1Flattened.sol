
// File: contracts/OrderAccessControl.sol

/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

/**
 * @title Access control for an order
 */
contract OrderAccessControl {
  address public contractCreator;
  address public supermarket;
  address public farmer;
  address public auditor;
  address public warehouse;
  address public distributor;


  // @dev Keeps track whether the contract is paused.
  bool public paused = false;

  /// @dev Access modifier for Farmer-only functionality
  modifier onlyContractCreator() {
    require(
      msg.sender == contractCreator,
      "Only the contract creator has access."
    );
    _;
  }

  /// @dev Access modifier for Farmer-only functionality
  modifier onlySupermarket() {
    require(
      msg.sender == supermarket,
      "Only the Super Market has access."
    );
    _;
  }

  /// @dev Access modifier for Farmer-only functionality
  modifier onlyFarmer() {
    require(
      msg.sender == farmer,
      "Only the Farmer has access."
    );
    _;
  }

  /// @dev Access modifier for Auditor-only functionality
  modifier onlyAuditor() {
    require(
      msg.sender == auditor,
      "Only the Auditor has access."
    );
    _;
  }

  /// @dev Access modifier for Warehouse-only functionality
  modifier onlyWarehouse() {
    require(
      msg.sender == warehouse,
      "Only the Warehouse has access."
    );
    _;
  }

  /// @dev Access modifier for Distributor-only functionality
  modifier onlyDistributor() {
    require(
      msg.sender == distributor,
      "Only the Distributor has access."
    );
    _;
  }

  modifier onlyFarmerOrAuditor() {
    require(
      msg.sender == farmer ||
      msg.sender == auditor,
      "Only the Farmer and Auditor have access."
    );
    _;
  }

  modifier onlyContractOwners() {
    require(
      msg.sender == contractCreator ||
      msg.sender == supermarket ||
      msg.sender == farmer ||
      msg.sender == auditor ||
      msg.sender == warehouse ||
      msg.sender == distributor,
      "Only the contract owners have access."
    );
    _;
  }

  /// @dev Assigns a address to contract owners. Only available to the current creator.
  /// @param _supermarket _farmer _auditor _warehouse _distributor addresses of contract owners
  function setOwners(
    address _supermarket,
    address _farmer,
    address _auditor,
    address _warehouse,
    address _distributor
  ) external onlyContractCreator {
    supermarket = _supermarket;
    farmer = _farmer;
    auditor = _auditor;
    warehouse = _warehouse;
    distributor = _distributor;
  }

  /*** Pausable functionality adapted from OpenZeppelin ***/

  /// @dev Modifier to allow actions only when the contract IS NOT paused
  modifier whenNotPaused() {
      require(!paused);
      _;
  }

  /// @dev Modifier to allow actions only when the contract IS paused
  modifier whenPaused {
      require(paused);
      _;
  }

  /// @dev Called by any contract owner role to pause the contract. Used only when
  ///  a bug or exploit is detected and we need to limit damage.
  function pause() external onlyContractOwners whenNotPaused {
      paused = true;
  }

  /// @dev Unpauses the smart contract.
  function unpause() public onlyContractOwners whenPaused {
      // can't unpause if contract was upgraded
      paused = false;
  }
}

// File: contracts/OrderV1.sol

/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;


/**
 * @title OrderV1
 */
contract OrderV1 is OrderAccessControl {

  // Order meta data
  struct Meta {
    bytes32 product;
    uint amount;
    bool revoked;
  }

  // Record
  struct Record {
    address who;
    bytes32 action;
    uint32 when;
  }

  // Location of order
  struct Location {
    bytes32 latitude;
    bytes32 longitude;
    address who;
  }

  enum State {
    // Positive states
    Ordered,
    Approved,
    Audited,
    AuditDocUploaded,
    AtWarehouse,
    WarehouseReleased,
    InTransit,
    Delivered,
    // Negative States
    NotApproved,
    AuditFailed,
    NotAtWarehouse,
    WarehouseIssue,
    DistributorNeverReceived,
    NotDelivered,
    Revoked

  }

  enum SubState {
    None, Pending, InTransit
  }

  Meta public meta;
  address public auditDocument;
  Record[] public history;
  Location[] public locationHistory;
  State public state;
  SubState public subState;

  modifier inState(State _state) {
      require(
          state == _state,
          "Invalid state."
      );
      _;
  }

  constructor(
    bytes32 product, uint amount, address creator
  ) public {
    contractCreator = creator;
    meta.product = product;
    meta.amount = amount;
    meta.revoked = false;

    state = State.Ordered;
    subState = SubState.None;
  }

  //
  // Order Form
  //

  /**
   * @dev Farmer must approve order created by the Supermarket
   */
  function approve()
    public
    onlyFarmer
    inState(State.Ordered)
  {
    addRecord(bytes32("Approved"));
    state = State.Approved;

  }

  /**
   * @dev Farmer doesn't approve the order
   */
  function notApprove()
    public
    onlyFarmer
    inState(State.Ordered)
  {
    addRecord(bytes32("Not Approved"));
    state = State.NotApproved;

  }

  /**
   * @dev Auditor will validate if order is organic
   */
  function validated()
    public
    onlyAuditor
    inState(State.Approved)
  {
    addRecord(bytes32("Audited"));
    state = State.Audited;
  }

  /**
   * @dev Auditor failed the audit
   */
  function invalid()
    public
    onlyAuditor
    inState(State.Approved)
  {
    addRecord(bytes32("Audit Failed"));
    state = State.AuditFailed;
  }

  /**
   * @dev Auditor will store the audit document
   */
  function storeAuditDocument(address document)
    public
    onlyAuditor
    inState(State.Audited)
  {
    auditDocument = document;
    addRecord(bytes32("Stored document"));
    state = State.AuditDocUploaded;
  }

  /**
   * @dev Warehouse will store the order shipment
   */
  function warehouseReceivedOrder()
    public
    onlyWarehouse
    inState(State.AuditDocUploaded)
  {
    state = State.AtWarehouse;
    addRecord(bytes32("Received"));
  }

  /**
   * @dev Warehouse didn't receive the order
   */
  function warehouseNotReceivedOrder()
    public
    onlyWarehouse
    inState(State.AuditDocUploaded)
  {
    state = State.NotAtWarehouse;
    addRecord(bytes32("Did not receive"));
  }

  /**
   * @dev Warehouse releases order to distributor
   */
  function warehouseReleasedOrder()
    public
    onlyWarehouse
    inState(State.AtWarehouse)
  {
    state = State.WarehouseReleased;
    addRecord(bytes32("Released"));
  }

  /**
   * @dev Warehouse has issue with order
   */
  function warehouseIssueOrder()
    public
    onlyWarehouse
    inState(State.AtWarehouse)
  {
    state = State.WarehouseIssue;
    addRecord(bytes32("Issue at warehouse"));
  }

  /**
   * @dev Distributor pickups order at warehouse and puts order in transit
   */
  function receivedAndInTransit()
    public
    onlyDistributor
    inState(State.WarehouseReleased)
  {
    addRecord(bytes32("In Transit"));
    state = State.InTransit;
  }

  /**
   * @dev Distributor never received order
   */
  function neverReceived()
    public
    onlyDistributor
    inState(State.WarehouseReleased)
  {
    addRecord(bytes32("Never Received"));
    state = State.DistributorNeverReceived;
  }

  /**
   * @dev SuperMarket confirms delivery of order
   */
  function confirmDelivery()
    public
    onlySupermarket
    inState(State.InTransit)
  {
    addRecord(bytes32("Confirmed Delivery"));
    state = State.Delivered;
  }

  /**
   * @dev SuperMarket didn't receive order
   */
  function notDelivered()
    public
    onlySupermarket
    inState(State.InTransit)
  {
    addRecord(bytes32("Not Delivered"));
    state = State.NotDelivered;
  }

  /**
   * @dev Farmer or auditor revokes order due to compliance or issues with order
   */
  function revoke()
    public
    onlyFarmerOrAuditor
  {
    state = State.Revoked;
    addRecord(bytes32("Revoked"));
    meta.revoked = true;
  }

  //
  // Storage
  //

  /**
   * @dev Record history
   * @param action The action of the order
   */
  function addRecord(bytes32 action) internal {
    history.push(Record({
        who: msg.sender,
        action: action,
        when: uint32(now)
      }));
  }

  /**
   * @dev Get order history length
   */
  function getHistoryLength()
    public
    view
    returns(uint)
  {
    return (history.length);
  }


  /**
   * @dev Contract owners are allowed to record the contract location
   * @param latitude The latitudinal coordinate of the order
   * @param longitude The longitudinal coordinate of the order
   */
  function updateLocation(
    bytes32 latitude, bytes32 longitude
  )
    public
    onlyContractOwners
  {
    locationHistory.push(Location({
        latitude: latitude,
        longitude: longitude,
        who: msg.sender
      }));
  }

  /**
   * @dev Get location history length
   */
  function getLocationLength()
    public
    view
    returns(uint)
  {
    return (locationHistory.length);
  }

}

// File: contracts/OrdersV1.sol

/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;


/**
 * @title Parent contract for each order
 */
contract OrdersV1 {
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
    OrderV1 newOrder = new OrderV1(product, amount, msg.sender);

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
