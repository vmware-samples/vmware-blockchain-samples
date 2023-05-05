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

pragma solidity >=0.8.1;

/*
contract userReg {
    struct userDataDefinition {
        bool register;
        uint registerTime;
        uint registerOtpStartTime;
    }
    bytes adminPublicKey;
    mapping(bytes => userDataDefinition) public userData;
    error errMsg(string message, address addr, bytes data, bytes signature);
    event userRegister(string caller, address addr, bytes data);
    function test1(address eoa, bytes memory userPublicKey, bytes memory signature, bytes memory otp) public returns (bool) {
        bool validsig = false;
        validsig = verify(eoa, userPublicKey, signature);
        return true;
    }

    function isUserRegister(bytes memory userPublicKey, bytes memory signature, bytes memory otp) public returns (bool) {
        bool validsig = false;

        validsig = verify(address(bytes20(keccak256(userPublicKey))), userPublicKey, signature);

        if (validsig == false)
            //revert errMsg({message: "isUserRegister", addr: address(bytes20(keccak256(userPublicKey))), data: "", signature: signature});
            revert ("aaaa");

        if (userData[signature].registerOtpStartTime > 0)
            //revert errMsg({message: "userRegistrationInProgress", addr: address(bytes20(keccak256(userPublicKey))), data: "", signature: signature});
            revert ("bbbb");

        if (userData[signature].register == true) {
            //check otp
            //revert errMsg({message: "duplicateUser", addr: address(bytes20(keccak256(userPublicKey))), data: "", signature: signature});
            revert ("cccc");
        }

        return true;
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through the signature field
    // data has encrypted user email - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterUserStart(bytes[] memory publicKey, bytes[] memory data, bytes memory userPublicKey, bytes memory signature) public {
        if (isValidsigPublicKey(publicKey, data, userPublicKey, signature, "newUserRegisterUserStart") == false)
            return;

        userData[signature].register = false;
        userData[signature].registerOtpStartTime = block.timestamp;
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through signature
    // data has encrypted email, admin provided otp, user userPublicKey and user signature - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterUserComplete(bytes[] memory publicKey, bytes[] memory data, bytes memory userPublicKey, bytes memory signature) public {
        if (isValidsigPublicKey(publicKey, data, userPublicKey, signature, "newUserRegisterUserComplete") == false)
            return;

        if (block.timestamp >= (userData[signature].registerOtpStartTime + 30 minutes))
            revert errMsg({message: "newUserRegisterUserOtpExpire", addr: address(bytes20(keccak256(publicKey[0]))), data: data[0], signature: signature});
    }

    // userPublicKey is the public key of the user
    // user signs userPublicKey with his private key and passes it through signature
    // data has encrypted email and admin provided otp - data[0] is encrypted by public key of user and only visible to user; data[1] is encrypted by public key of admin 1 and only visible to admin 1
    function newUserRegisterAdminApprove(bytes[] memory publicKey, bytes[] memory data, bytes memory userPublicKey, bytes memory signature) public {
        if (isValidsigPublicKey(publicKey, data, userPublicKey, signature, "newUserRegisterAdminApprove") == false)
            return;

        userData[signature].registerTime = block.timestamp;
        userData[signature].register = true;
    }

    function isValidsigPublicKey(bytes[] memory publicKey, bytes[] memory data, bytes memory userPublicKey, bytes memory signature, string memory str) private returns (bool) {
        bool validsig = false;
        uint i = 0;
        string memory err = string.concat("invalid signature ", str);
        address[] memory addr;

        for (i = 0; i < publicKey.length; i++)
            addr[i] = address(bytes20(keccak256(publicKey[i])));

        validsig = verify(addr[0], userPublicKey, signature);

        if (validsig == false)
            revert errMsg({message: err, addr: addr[0], data: data[0], signature: signature});
        else {
            for (i = 0; i < addr.length; i++)
                emit userRegister(str, addr[i], data[i]);
        }

        return validsig;
    }

    function getMessageHash(
        bytes memory message
    ) public returns (bytes32) {
        return keccak256(abi.encodePacked(message));
    }

    function getEthSignedMessageHash(
        bytes32 messageHash
    ) public returns (bytes32) {

        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
            );
    }

    function recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) public returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
  

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
    ) public returns (bool) {
        bytes32 messageHash = getMessageHash(message);
        //bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(messageHash, signature) == signer;
    }
}
*/


/* Signature Verification

How to Sign and Verify
# Signing
1. Create message to sign
2. Hash the message
3. Sign the hash (off chain, keep your private key secret)

# Verify
1. Recreate hash from the original message
2. Recover signer from signature and hash
3. Compare recovered signer to claimed signer
*/

contract userReg {
    /* 1. Unlock MetaMask account
    ethereum.enable()
    */

    /* 2. Get message hash to sign
    getMessageHash(
        0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C,
        123,
        "coffee and donuts",
        1
    )

    hash = "0xcf36ac4f97dc10d91fc2cbb20d718e94a8cbfe0f82eaedc6a4aa38946fb797cd"
    */
    error errMsg(string message, address verifier, address signer);
    function test1(address eoa, string memory userPublicKey, bytes memory signature, bytes memory otp) public view returns (bool) {
        bool validsig = false;
        validsig = verify(eoa, eoa, 1000, userPublicKey, 1, signature);
        if (validsig == false) {
            revert("test1");
        }
        return true;
    }

    function getMessageHash(
        address _to,
        uint _amount,
        string memory _message,
        uint _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _message, _nonce));
    }

    /* 3. Sign message hash
    # using browser
    account = "copy paste account of signer here"
    ethereum.request({ method: "personal_sign", params: [account, hash]}).then(console.log)

    # using web3
    web3.personal.sign(hash, web3.eth.defaultAccount, console.log)

    Signature will be different for different accounts
    0x993dab3dd91f5c6dc28e17439be475478f5635c92a56e17e82349d3fb2f166196f466c0b4e0c146f285204f0dcb13e5ae67bc33f4b888ec32dfe0a063e8f3f781b
    */
    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    /* 4. Verify signature
    signer = 0xB273216C05A8c0D4F0a4Dd0d7Bae1D2EfFE636dd
    to = 0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C
    amount = 123
    message = "coffee and donuts"
    nonce = 1
    signature =
        0x993dab3dd91f5c6dc28e17439be475478f5635c92a56e17e82349d3fb2f166196f466c0b4e0c146f285204f0dcb13e5ae67bc33f4b888ec32dfe0a063e8f3f781b
    */
    function verify(
        address _signer,
        address _to,
        uint _amount,
        string memory _message,
        uint _nonce,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_to, _amount, _message, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address raddress = recoverSigner(ethSignedMessageHash, signature);

        if (raddress != _signer) {
            //revert("verify error", raddress);
            revert errMsg({message: "verify error", verifier: raddress, signer: _signer});
        }
        return true;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        address rc = ecrecover(_ethSignedMessageHash, v, r, s);
        if ( rc == address(0) ) {
            revert("recoverSigner");
        }

        return rc;
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
}

