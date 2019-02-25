/*
 * Copyright 2019 VMware, all rights reserved.
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
