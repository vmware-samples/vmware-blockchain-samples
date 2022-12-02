// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Permissioning {
    uint admin_count = 0;
    
    // Permissions are stored as bits
    uint8 constant USER_ACTION_READ = 0x1;
    uint8 constant USER_ACTION_WRITE = 0x2;
    uint8 constant USER_ACTION_DEPLOY = 0x4;
    uint8 constant USER_ACTION_ADMIN = 0x8;

    // Events for debugging, the action fields are stored in bits as per the above format
    event AddPermission(address indexed _from, address indexed _to, uint8 indexed action);
    event RemovePermission(address indexed _from, address indexed _to, uint8 indexed action);

    // Permission maps
    mapping(address => uint8) _from_permissions;
    mapping(address => uint8) _to_permissions;
    mapping(address => mapping(address=>uint8)) _from_to_permissions;

    // Check if the sender is an admin or not
    modifier onlyAdmin() {
        require(checkPermission(msg.sender, address(0x0), USER_ACTION_ADMIN), "Not an Admin");
        _;
    }

    /* -------------------------------------------------------------------------------------------- **
    Function    : checkPermission
    Description : Check whether the given 'from' address and 'to' address has the given action or not. 
                  Here the actions are combination of permissions (Eg: READ+WRTITE, DEPLOY+READ, ...)
    ** -------------------------------------------------------------------------------------------- */
    function checkPermission(address from, address to, uint8 action) internal view returns (bool) {
        uint p1 = _from_permissions[from];
        uint p2 = _to_permissions[to];
        uint p3 = _from_to_permissions[from][to];
        return (p1 | p2 | p3) & action == action;
    }

    /* -------------------------------------------------------------------------------------------- **
    Function    : updatePermissions
    Description : This function will be called only by Admin(s). The new permissions will always overwrite
                  the old permissions. 
    ** -------------------------------------------------------------------------------------------- */
    function updatePermissions(address from, address to, uint8 action) external onlyAdmin {
        if (action == 0) {
            emit RemovePermission(from, to, action);
        } else {
            emit AddPermission(from, to, action);
        }
        if(from == address(0x0)) {
            _to_permissions[to] = action;
        } else if (to == address(0x0)) {
            _from_permissions[from] = action;
        } else {
            _from_to_permissions[from][to] = action;
        }
    }

    /* -------------------------------------------------------------------------------------------- **
    Function    : checkUserAction
    Description : Check whether the given 'from' address and 'to' address has the given action or not. 
                  Here the actions are combination of permissions (Eg: READ+WRTITE, DEPLOY+READ).
                  End-user should NOT modify this function at any cost. This function will be called
                  by the validator (concord).
    ** -------------------------------------------------------------------------------------------- */
    function checkUserAction(address from, address to, uint8 action) external view returns(bool) {
        return checkPermission(from, to, action);
    }

    /* -------------------------------------------------------------------------------------------- **
    Function    : constructor
    Description : Permissioning contract is a pre-deployed contract. It will be deployed as a 2nd block 
                  right after the genesis block. The list of all the addresses under 'alloc' in genesis.json
                  will be considered as admins. All these admins will have all the permissions by default
                  (READ, WRITE, DEPLOY, ADMIN).
    ** -------------------------------------------------------------------------------------------- */
    constructor(address[] memory admins) {
        require(admins.length > 0, "At least one admin address required");
        for (uint i = 0; i < admins.length; i++) {
            _from_permissions[admins[i]] = USER_ACTION_ADMIN | USER_ACTION_READ | USER_ACTION_WRITE | USER_ACTION_DEPLOY;
        }
        admin_count = admins.length;
    }
}
