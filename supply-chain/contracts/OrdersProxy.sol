/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

pragma solidity >=0.4.21 <0.6.0;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
 * @title OrdersProxy
 * @dev This contract proxies Orders
*/
contract OrdersProxy is AdminUpgradeabilityProxy {

    constructor(address implementation)
      public
      AdminUpgradeabilityProxy(implementation)
    { }

}
