// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./ERC20/ERC20.sol";

interface IPrivacy_Contract {
    struct PublicToPrivateRequest {
        string userId;
        uint64 value;
        bytes txData;
    }

    struct PrivateToPublicRequest {
        string userId;
        uint64 value;
        bytes txData;
    }

    function convertPublicToPrivate(PublicToPrivateRequest calldata req) external returns (bool);

    function convertPrivateToPublic(PrivateToPublicRequest calldata req) external returns (bool);
}

contract PublicToken is ERC20 {
    IPrivacy_Contract _privacyContract;

    constructor(address privacyContract, address[] memory users, uint64 initialBalance) ERC20("PrivacyToken", "PRVT") {
        _privacyContract = IPrivacy_Contract(privacyContract);
        for (uint i = 0; i < users.length; i++) {
            _mint(users[i], initialBalance);
        }
    }

    function convertPublicToPrivate(IPrivacy_Contract.PublicToPrivateRequest calldata req) external returns (bool) {
        _transfer(_msgSender(), address(_privacyContract), req.value);
        require(_privacyContract.convertPublicToPrivate(req));
        return true;
    }

    function convertPrivateToPublic(IPrivacy_Contract.PrivateToPublicRequest calldata req) external returns (bool) {
        _transfer(address(_privacyContract), _msgSender(), req.value);
        require(_privacyContract.convertPrivateToPublic(req));
        return true;
    }
}
