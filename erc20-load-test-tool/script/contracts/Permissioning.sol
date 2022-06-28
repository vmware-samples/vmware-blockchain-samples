pragma solidity ~0.7.6;

contract Permissioning {

    enum UserStatus {
        Active,
        Paused,
        Inactive
    }

    // Enums will get converted integers during the compilation so the equivalent value will be 0 - Read, 1 - Write, 2 - Deploy
    enum UserAction{
        Read,
        Write,
        Deploy
    }

    struct UserRoleData {
        UserStatus status;
        bool isActive;
    }

    uint8 public  SUPER_ADMIN_ROLE = 1;
    uint8 public  WRITER_ROLE = 2;
    uint8 public  READER_ROLE = 3;
    uint8 public  DEPLOYER_ROLE = 4; // smart-contract deployer

    struct RoleData {
        mapping(address => UserRoleData) members;
    }

    struct VotingData {
        mapping(address => mapping (uint => bool)) voter;
    }

    mapping(uint8 => RoleData) private _roles;

    struct NewUserRequest {
        uint8[] roles;
        address submitter;
        uint8 approvalCount;
    }

    address private owner;
    mapping(address => NewUserRequest) private newUserRequests;

    event VoteUpdateEvent(address indexed _from, address indexed _userId);

    event NewRequestEvent(address indexed _from, address indexed _userId, uint8[] indexed _roles);

    event NewUserEvent(address indexed _userId, uint8 indexed _role);

    event UserStatusEvent(address indexed _from, address indexed _userId, UserStatus indexed _status);

    mapping (address => VotingData) private approverVotes;

    uint8 private _approvalThreshold = 255; // uint8 max value

    constructor(address[] memory superAdmins) {
        owner = msg.sender;
        mapping(address => UserRoleData) storage admins = _roles[SUPER_ADMIN_ROLE]
            .members;
        require(superAdmins.length > 3, "Need minimum 4 super admins");

        require(superAdmins.length < 11, "Maximum of 10 super admins are only allowed");

        setApprovalThresholdCount(uint8(superAdmins.length));
        for (uint8 i = 0; i < superAdmins.length; i++) {
            admins[superAdmins[i]] = UserRoleData(UserStatus.Active, true);
        }
    }

    modifier onlySuperAdmin() {
        mapping(address => UserRoleData) storage admins = _roles[SUPER_ADMIN_ROLE]
            .members;
        require(admins[msg.sender].isActive, "Not a super admin");
        _;
    }

     modifier validRole(uint8 roleId) {
       if(!(roleId == WRITER_ROLE || roleId  == READER_ROLE || roleId  == DEPLOYER_ROLE))
       {
           revert("Invalid Role");
       }
       _;
    }


    modifier validRoles(uint8[] calldata roles) {
        if(roles.length == 0)
        {
            revert("No Valid Role(s)");
        }
        for(uint8 i = 0; i < roles.length; i++){
            uint8 roleId = roles[i];
            if(!(roleId == WRITER_ROLE || roleId  == READER_ROLE || roleId  == DEPLOYER_ROLE))
            {
                revert("Invalid Role");
            }
            _;
        }

    }

    modifier noExistingRequest(address user) {
        NewUserRequest storage request =  newUserRequests[user];
        if(request.submitter != address(0))
        {
            revert("There is an existing request for the user in queue");
        }
        _;
    }

    function setApprovalThresholdCount(uint8 adminCount) private {
        _approvalThreshold = (adminCount/3)+1;
    }

    function getApprovalThresholdCount() public view returns(uint8){
        return _approvalThreshold;
    }

    function addUser(address newUser, uint8[] calldata roles)
        external
        onlySuperAdmin
        noExistingRequest(newUser)
        validRoles(roles)
    {
        NewUserRequest memory newRequest =  NewUserRequest({
            roles: roles,
            submitter: msg.sender,
            approvalCount: 0
        });
        newUserRequests[newUser] = newRequest;
        emit NewRequestEvent(msg.sender, newUser, roles);
    }

    function approveUserRequest(address newUser, uint8[] memory roles) external onlySuperAdmin {

        NewUserRequest storage request =  newUserRequests[newUser];

        for(uint8 i = 0; i < roles.length; i++)
        {
            uint8 role = roles[i];
            if(approverVotes[newUser].voter[msg.sender][role])
            {
                revert("You have approved already");
            } else {
                approverVotes[newUser].voter[msg.sender][role] = true;
                emit VoteUpdateEvent(msg.sender, newUser);
            }
        }

        if(request.submitter == address(0))
        {
            revert("There is no valid request for given user");
        }

        newUserRequests[newUser].approvalCount++;
        if (newUserRequests[newUser].approvalCount >= _approvalThreshold) {
            uint8[] memory uroles = newUserRequests[newUser].roles;
            for(uint8 i = 0; i < uroles.length; i++)
            {
                uint8 role = uroles[i];
                _roles[role].members[newUser] = UserRoleData(UserStatus
                .Active, true);
                emit NewUserEvent(newUser, role);
            }

            delete newUserRequests[newUser];
            delete approverVotes[newUser];
        }
    }

    function disableUser(address oldUser, uint8 role)external
        onlySuperAdmin
        validRole(role) {

        if(_roles[role].members[oldUser].status != UserStatus.Active)
         {
             revert("Invalid User State");
         }

        _roles[role].members[oldUser].isActive = false;
        _roles[role].members[oldUser].status = UserStatus.Inactive;
        emit UserStatusEvent(msg.sender, oldUser, UserStatus.Inactive);
    }

    function enableUser(address oldUser, uint8 role)external
        onlySuperAdmin
        validRole(role) {
         if(_roles[role].members[oldUser].status != UserStatus.Inactive)
         {
             revert("Invalid User State");
         }

        _roles[role].members[oldUser].isActive = true;
        _roles[role].members[oldUser].status = UserStatus.Active;
        emit UserStatusEvent(msg.sender, oldUser, UserStatus.Active);
    }

    function isWriter() external view returns (bool) {
        return _roles[WRITER_ROLE].members[msg.sender].isActive;
    }

    function isViewer() external view returns (bool) {
        return _roles[READER_ROLE].members[msg.sender].isActive;
    }

    function isSuperAdmin() external view returns(bool) {
        return _roles[SUPER_ADMIN_ROLE].members[msg.sender].isActive;
    }

    function isDeployer() external view returns(bool) {
        return _roles[DEPLOYER_ROLE].members[msg.sender].isActive;
    }

    function checkUserAction(address from, UserAction action) external view returns(bool) {
        require (action == UserAction.Read || action == UserAction.Write || action == UserAction.Deploy, "Invalid Action");

        if(action == UserAction.Deploy)
        {
            return _roles[DEPLOYER_ROLE].members[from].isActive;
        } else if(action == UserAction.Write)
        {
            return _roles[WRITER_ROLE].members[from].isActive;
        }
        return _roles[READER_ROLE].members[from].isActive;
    }
}
