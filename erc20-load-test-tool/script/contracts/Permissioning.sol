pragma solidity ^0.7.6;

contract Permissioning {

    enum UserAction {
        None,
        Read,
        Write,
        Deploy,
        Approve
    }

    // Minimum Admins
    uint8 constant min_admins = 4;

    // Maximum Admins
    uint8 constant max_admins = 11;

    // Storage variable will be stored in Blockchain
    // Use bits to save memory ( uint is 32 bit (0 to 31))
    // ( N - None, R - Read, W - Write, D - deploy, A - Approve )
    // 31............8   7   6    5     4     3     2     1    0
    // -----------------------------------------------------------
    //  |   |   |   |   |   |   |    |  A  |  D  |  W  |  R |  N  |
    // -----------------------------------------------------------
    mapping(address => mapping(address=>uint)) _permissions;

    // User request will be submitted by approver/admin.
    // Admin should have the key combination (from,to,role)
    mapping(address => mapping(address => mapping(uint => bool))) _userRequest;

    // Voter should have key combination from,to,role,submitter
    mapping(address => mapping(address => mapping(uint => mapping(address=>bool)))) _isVoted;

    // approvalCount should have key combination from,to,role
    mapping(address => mapping(address => mapping(uint => uint8))) _approvalCount;

    // uint8 max value
    uint8 private _approvalThreshold = 255;

    // events for debugging
    event VoteUpdateEvent(address indexed _from, address indexed _to, uint8 indexed _role, address  _sender);
    event NewRequestEvent(address indexed _from, address indexed _to, uint8 indexed _role);
    event NewApproveEvent(address indexed _from, address indexed _to, uint8 indexed _role);

    // Custom errors - Not supported in 0.7.6 solidity
    // error RoleAlreadyRequested(address from, address to, uint8 role);
    // error VotedAlready(address from, address to, uint8 role, address voter);

    // Key: combination of "from" and "to" addressess
    // Value: set single bit
    function setPermissionBit(address from, address to, UserAction setRole) internal {
        _permissions[from][to] |= 1 << uint8(setRole);
    }

    // Check if the permission bit for a role is set or not
    function getPermissionBit(address from, address to, UserAction getRole) internal view returns (bool) {
        uint tmp = _permissions[from][to];
        return tmp >> uint8(getRole) & 1 == 1;
    }

    // Set approval threshold
    function setApprovalThresholdCount(uint8 adminCount) private {
        _approvalThreshold = (adminCount/(min_admins-1))+1;
    }

    // Get approval threshold
    function getApprovalThresholdCount() public view returns(uint8){
        return _approvalThreshold;
    }

    // Constructor should accept the addresses from genesis file and make them as approver
    constructor(address[] memory approvers) {

        require(approvers.length >= min_admins, "Need minimum 4 super admins");
        require(approvers.length <= max_admins, "Maximum of 10 super admins are only allowed");

        setApprovalThresholdCount(uint8(approvers.length));
        for (uint8 i = 0; i < approvers.length; i++) {
            setPermissionBit(approvers[i], address(0x0), UserAction.Approve);
        }
    }

    // Avoid multiple requests for an entity
    modifier noExistingRequest(address _fromAddress, address _toAddress, uint8 _role1) {
        bool request =  _userRequest[_fromAddress][_toAddress][_role1];
        if(request)
        {
            revert("RoleAlreadyRequested");
        }
        _;
    }
    // Check the Approve bit has set for the msg.sender
    modifier onlyApprover() {
        require(getPermissionBit(msg.sender, address(0x0), UserAction.Approve), "Not an Approver/Admin");
        _;
    }

    // Check the request has been approved already
    modifier notAlreadyApproved(address _from, address _to, uint8 _newrole) {
        require(! getPermissionBit(_from, _to, UserAction(_newrole)), "Role already authorized");
        _;
    }

    // AddUser request from, to, role ( as of now one role at a time )
    function addUserRequest(address _from, address _to, uint8 _newrole)
        external
        onlyApprover
        notAlreadyApproved(_from, _to, _newrole)
        noExistingRequest(_from, _to, _newrole)
    {
        _userRequest[_from][_to][_newrole] = true;
        emit NewRequestEvent(_from, _to, _newrole);
    }

    // To approve user request, approver should be an admin and should vote only once
    // This function will be called by different admins/approvers, so the vote info
    // should be in storage
    function approveUserRequest(address _from, address _to, uint8 _role)
        external
        onlyApprover
        notAlreadyApproved(_from, _to, _role)
        {

        if(_isVoted[_from][_to][_role][msg.sender])
        {
            revert("VotedAlready");
        } else {
            _isVoted[_from][_to][_role][msg.sender] = true;
            emit VoteUpdateEvent(_from, _to, _role, msg.sender);
        }

        _approvalCount[_from][_to][_role] ++;

        if (_approvalCount[_from][_to][_role] > _approvalThreshold) {
            setPermissionBit(_from, _to, UserAction(_role));
            emit NewApproveEvent(_from, _to, _role);
            delete _userRequest[_from][_to][_role];
        }
    }

    // Check user action (READ/WRITE/DEPLOY/APPROVE)
    function checkUserAction(address from, address to, UserAction action) external view returns(bool) {
        return getPermissionBit(from, to, action);
    }

}
