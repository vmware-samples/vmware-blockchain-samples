/*
 * Copyright 2019 VMware, all rights reserved.
 */

pragma solidity >=0.4.21 <0.6.0;

/**
 * @title StringStorage
 */
contract StringStorage {
  string public storedString;

  constructor() public {}

  function setString(string content) external {
    storedString = content;
  }
}
