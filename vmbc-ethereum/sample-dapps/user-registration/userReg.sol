// SPDX-License-Identifier: MIT
// references
// https://solidity-by-example.org/app/erc20/
// https://solidity-by-example.org/signature/
// https://www.tutorialspoint.com/solidity/solidity_pure_functions.htM

// workflow: 
// 1. user calls newUserRegisterUserStart API
// 2. admin looks for newUserRegisterUserStart event; generates otp and sends the otp to the email available from decrypting the relevant field in the event; the otp is a JWT token signed by the admin and is valid for 1 hour
// 3. user calls newUserRegisterUserComplete API with the otp received in the email
// 4. admin looks for newUserRegisterUserComplete event; it gets the otp by decrypting the relevant field in the event and checks if the user generated otp matches the otp which admin generated; it also get the user message and signature by decrypting the relevant fields in the event
// 5. admin calls newUserRegisterAdminApprove API to approve the registration of the user passing the user message and signature derived from step 4.

pragma solidity >=0.8.0;

contract userReg {
    struct userDataDefinition {
        bool register;
        uint registerTime;
        uint registerOtpStartTime;
        uint userIndex;
        //for user
        bytes data00; //encrypted user email
        bytes data01; //encrypted user otp
       
        //for admin1
        bytes data10; //encrypted user email
        bytes data11; //encrypted user otp
        
        //for admin2
        bytes data20; //encrypted user email
        bytes data21; //encrypted user otp
       
    }
    uint currentUserIndex;
    mapping(bytes => userDataDefinition) public userData;
    mapping(uint => bytes) public userIndexData;
    mapping(address => bytes) public userAddressData;
    error errMsg(string message, uint eventNumber, address addr, bytes signature);
    //
    // userAdminIdentifier - 0 user, 1 admin1, 2 admin2
    //
    
    // event signature's hash as topics[0] in log
    // ethers.utils.keccak256(ethers.utils.toUtf8Bytes("userRegister(uint256,uint256,uint256)")));
    //
    // caller as topics[1] in log
    // 0 -- newUserRegisterUserStart
    // 1 -- newUserRegisterUserComplete
    // 2 -- newUserRegisterAdminApprove

    // userIndex as topics[2] in log

    // userAdminIdentifier as topics[3] in log
    // 0 -- user
    // 1 -- admin1
    // 2 -- admin2 
    event userRegister(uint256 indexed caller, uint256 indexed userIndex, uint256 indexed userAdminIdentifier);

    function isUserRegisterAddr(address addr) view public returns (uint) {
        bytes memory userPublicKey = userAddressData[addr];

        if (userData[userPublicKey].register == true)
            return 2;

        return 0;
    }

    function isUserRegister(bytes memory userPublicKey, bytes memory signature) view public returns (uint) {
        bool validsig = false;

        //validsig = verify(address(bytes20(keccak256(userPublicKey))), userPublicKey, signature);
        validsig = true;

        if (validsig == false)
            revert errMsg({message: "isUserRegisterInvalidSignature", eventNumber: 0, addr: address(bytes20(keccak256(userPublicKey))), signature: signature});

        if (userData[userPublicKey].registerOtpStartTime > 0)
            return 1; 

        if (userData[userPublicKey].register == true)
            return 2; 

        return 0;
    }

    function userIndexToPublickey(uint index) view public returns (bytes memory){
       return  userIndexData[index];
    }

    function getCurrentUserIndex() view public returns (uint){
       return  currentUserIndex;
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through the signature field
    // data has encrypted user email - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterUserStart(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory data00, bytes memory data10, bytes memory data20, bytes memory signature) public {
        if (isValidsigPublicKey(userPublicKey, admin1PublicKey, admin2PublicKey, signature, 0) == false)
            return;

        userData[userPublicKey].register = false;
        userData[userPublicKey].registerOtpStartTime = block.timestamp;
        userData[userPublicKey].userIndex = currentUserIndex;
        userData[userPublicKey].data00 = data00;
        userData[userPublicKey].data10 = data10;
        userData[userPublicKey].data20 = data20;

        userIndexData[currentUserIndex] = userPublicKey;
        currentUserIndex = currentUserIndex + 1;

        userAddressData[address(bytes20(keccak256(userPublicKey)))] = userPublicKey;
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through signature
    // data has encrypted email, admin provided otp, user userPublicKey and user signature - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterUserComplete(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory data01, bytes memory data11, bytes memory data21, bytes memory signature) public {
        if (isValidsigPublicKey(userPublicKey, admin1PublicKey, admin2PublicKey, signature, 1) == false)
            return;

        if (block.timestamp >= (userData[userPublicKey].registerOtpStartTime + 30 minutes)) {
             //revert errMsg({message: "newUserRegisterUserOtpExpire", eventNumber: 0, addr: address(bytes20(keccak256(userPublicKey))), signature: signature});
             revert("timestamp expired !");

        }
           
        userData[userPublicKey].data01 = data01;
        userData[userPublicKey].data11 = data11;
        userData[userPublicKey].data21 = data21;
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through signature
    // data has encrypted email and admin provided otp - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterAdminApprove(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory signature) public returns (bool) {
        if (isValidsigPublicKey(userPublicKey, admin1PublicKey, admin2PublicKey, signature, 2) == false)
            return false;

        userData[userPublicKey].registerTime = block.timestamp;
        userData[userPublicKey].register = true;
        return true;
    }

    function isValidsigPublicKey(bytes memory userPublicKey, bytes memory admin1PublicKey, bytes memory admin2PublicKey, bytes memory signature, uint eventNumber) private returns (bool) {
        bool validsig = false;
        address useraddr;
        address admin1addr;
        address admin2addr;

        useraddr = address(bytes20(keccak256(userPublicKey)));
        admin1addr = address(bytes20(keccak256(admin1PublicKey)));
        admin2addr = address(bytes20(keccak256(admin2PublicKey)));

        //validsig = verify(useraddr, userPublicKey, signature);
        validsig = true;

        if (validsig == false)
            revert errMsg({message: "isValidsigPublicKeyInvalidSignature", eventNumber: eventNumber, addr: useraddr, signature: signature});
        else {
            
            emit userRegister(eventNumber, userData[userPublicKey].userIndex, 5566);
           // emit userRegister(eventNumber, currentUserIndex, 1);
           // emit userRegister(eventNumber, currentUserIndex, 2);
        }

        return validsig;
    }

    function getMessageHash(
        bytes memory message
    ) public pure returns (bytes32) {
        return keccak256(message);
    }

    function recoverSigner(
        bytes32 ethMessageHash,
        bytes memory signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(ethMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    function verify(
        address signer,
        bytes memory message,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(message);

        return recoverSigner(messageHash, signature) == signer;
    }
}
