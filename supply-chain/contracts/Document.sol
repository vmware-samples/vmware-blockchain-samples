/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

/**
 * @title Document
 */
contract Document {
  event DocumentArray(uint id);
  event DocumentTransaction();
  event DocumentEvent(string content);

  string[] public docArray;
  string public docString;

  constructor() public {}

  function inTransaction() external {
    emit DocumentTransaction();
  }

  function inArray(string content) external  {
    emit DocumentArray(docArray.length);
    docArray.push(content);
  }

  function inEvent(string content) external {
    emit DocumentEvent(content);
  }

  function inString(string content) external {
    docString = content;
  }

}
