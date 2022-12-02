// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.1;

interface IPrivacy_Contract {
    function setSig(uint64 sigId, bytes memory sig) external returns (bool);
}

/**
 * @author  VMware 2022.
 * @title   Privacy Virtual Contract Implementation.
 */

contract Privacy_VirtualContract {
    address owner;
    struct IssueBudgetPayload {
        bytes addr;
        bytes rndHash;
        bytes value;
        bytes pid;
        bytes expDate;
    }

    struct UTTInstanceEntry {
        bytes config;
        bool is_set;
    }
    mapping(address => UTTInstanceEntry) private instances_;
    address[] private uttAddresses;
    constructor() {
        // The contract's owner is the internal permissioned client who deployed the contract.
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @notice  To be used by a Privacy contract.
     * @dev     This method creates the corresponding cpp objects in the replicas.
     * @param   data  A serialized configuration (created by libutt).
     * @return  bytes  Empty in case of success (to be removed).
     */
    function UttInit(bytes memory data) public returns (bytes memory) {
        bytes memory res = registerUttInstance(data, msg.sender);
        instances_[msg.sender].is_set = true;
        instances_[msg.sender].config = data;
        uttAddresses.push(msg.sender);
        return res;
    }

    function registerUttInstance(bytes memory data, address sender) private view returns (bytes memory) {
        bytes memory badd = abi.encodePacked(sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory addrs = bytes.concat(len, badd);

        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory payload = bytes.concat(paylen, data);

        bytes memory init = bytes.concat(addrs, payload);

        uint256 len2 = init.length;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                staticcall(
                    gas(),
                    0xa,
                    add(init, 0x20),
                    len,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }
        return result;
    }

    /**
     * @notice  Validate the transaction validity w.r.t its ZK proofs.
     * @dev     Does not validate anything w.r.t nullifiers or expiration date.
     * @param   data  A serialized private transaction.
     * @return  bool  True if valid.
     */
    function UttValidateTransaction(bytes memory data) public returns (bool) {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory addrs = bytes.concat(len, badd);

        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory payload = bytes.concat(paylen, data);

        bytes memory txpayload = bytes.concat(addrs, payload);

        uint256 len2 = txpayload.length;
        bytes memory result = new bytes(len2);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x10,
                    0,
                    add(txpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }
        bool res = abi.decode(result, (bool));
        return res;
    }

    /**
     * @notice  Start an async procedure for computing the RCM signature.
     * @dev     This method returns before the actual signature is ready.
     * @param   pidstr  The client public id.
     * @param   data  rcm1 which is a commitment for the client's side secret (s1).
     * @param   sigId  A unique Id, assigned by the caller contract.
     * @return  uint64[]  A curve point, representing s2 - the server side secret.
     */
    function computeRcmSignature(
        bytes memory pidstr,
        bytes memory data,
        uint64 sigId
    ) public returns (uint64[] memory) {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory rcmlen = abi.encodePacked(uint32(data.length));
        bytes memory pidlen = abi.encodePacked(uint32(pidstr.length));
        bytes memory computeRcmPl = bytes.concat(
            len,
            badd,
            abi.encodePacked(uint32(8)),
            abi.encodePacked(sigId),
            rcmlen,
            data,
            pidlen,
            pidstr,
            abi.encodePacked(uint32(8)),
            abi.encodePacked(sigId)
        );
        uint256 len2 = computeRcmPl.length;
        bytes memory result = new bytes(1024);
        assembly {
            if iszero(
                call(
                    gas(),
                    0xc,
                    0,
                    add(computeRcmPl, 0x20),
                    len2,
                    add(result, 0x20),
                    1024
                )
            ) {
                invalid()
            }
        }
        uint64[] memory res = abi.decode(result, (uint64[]));
        return res;
    }

    function registerUttInstances() onlyOwner public view {
        for (uint i=0; i< uttAddresses.length; i++) {
            registerUttInstance(instances_[uttAddresses[i]].config, uttAddresses[i]);
        }
    }

    /**
     * @notice  This method should not be invoked by Privacy app developers.
     * @dev     The method is invoked as a callback from within the servers, once the signature is ready.
     * @param   source  The source Privacy contract that asked for this signature processing.
     * @param   sigId  The signature ID (assigned by the caller contract).
     * @param   data  The full signature data (serialized).
     * @return  bool  True if the signature is valid.
     */
    function onCompleteSig(
        bytes memory source,
        uint64 sigId,
        bytes memory data
    ) onlyOwner public returns (bool) {
        address source_add;
        assembly {
            source_add := mload(add(source, 20))
        }
        bytes memory badd = abi.encodePacked(source_add);
        bytes memory len = abi.encodePacked(uint32(badd.length));

        bytes memory sigIdLen = abi.encodePacked(uint32(8));
        bytes memory sigIdBytes = abi.encodePacked(sigId);

        bytes memory siglen = abi.encodePacked(uint32(data.length));
        bytes memory setSigPl = bytes.concat(
            len,
            badd,
            sigIdLen,
            sigIdBytes,
            siglen,
            data
        );
        uint256 tlen = setSigPl.length;

        bytes memory result = new bytes(1024);
        assembly {
            if iszero(
                call(
                    gas(),
                    0xd,
                    0,
                    add(setSigPl, 0x20),
                    tlen,
                    add(result, 0x20),
                    1024
                )
            ) {
                invalid()
            }
        }
        bytes memory sig = abi.decode(result, (bytes));
        IPrivacy_Contract source_contract = IPrivacy_Contract(source_add);
        source_contract.setSig(sigId, sig);
        return true;
    }

    /**
     * @notice  Return the transaction's nullifiers.
     * @dev     .
     * @param   data  A serialized private transaction.
     * @return  string[]  A list of the transaction's nullifiers.
     */
    function getTransactionNullifiers(bytes memory data)
        public
        returns (string[] memory)
    {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory txpayload = bytes.concat(paylen, data);

        uint256 len2 = txpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0xe,
                    0,
                    add(txpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }
        bytes[] memory bret = abi.decode(result, (bytes[]));
        string[] memory ret = new string[](bret.length);
        for (uint256 j = 0; j < bret.length; j++) {
            ret[j] = string(bret[j]);
        }
        return ret;
    }
    
    /**
     * @notice  Check if a given transaction has a budget coin.
     * @dev     .
     * @param   data  A serialized private transaction.
     * @return  bool  True if there the transaction contains a budget coin.
     */
    function hasBudgetCoin(bytes memory data) public returns (bool) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory txpayload = bytes.concat(paylen, data);

        uint256 len2 = txpayload.length;
        uint256 len = 400;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0xf,
                    0,
                    add(txpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }
        bool ret = abi.decode(result, (bool));
        return ret;
    }

    /**
     * @notice  Get a Privacy transaction's expiration date.
     * @dev     .
     * @param   data  A serialized private transaction.
     * @return  uint64  The expiration date, represented as unit64. If the transaction doesn't have a budget coin, the return value is 0.
     */
    function getBudgetExpirationDate(bytes memory data)
        public
        returns (uint64)
    {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory txpayload = bytes.concat(paylen, data);

        uint256 len2 = txpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x18,
                    0,
                    add(txpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        uint64 ret = abi.decode(result, (uint64));
        return ret;
    }

    /**
     * @notice  Start an async procedure for computing a Privacy transaction's signatures (one signature per output coin).
     * @dev     Starts an asynchronous procedure, the method returns before the actual signature is ready.
     * @param   sids  A list of unique IDs (one id per output coin) assigned by the caller Privacy contract.
     * @param   data  A serialized private transaction.
     * @return  bool  True on success.
     */
    function computeTransactionSignatures(
        uint64[] memory sids,
        bytes memory data
    ) public returns (bool) {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory txlen = abi.encodePacked(uint32(data.length));
        bytes memory computeTxPl = bytes.concat(
            len,
            badd,
            abi.encodePacked(uint32(sids.length * 8))
        );
        for (uint256 j = 0; j < sids.length; j++) {
            computeTxPl = bytes.concat(computeTxPl, abi.encodePacked(sids[j]));
        }
        computeTxPl = bytes.concat(computeTxPl, txlen, data);

        uint256 len1 = computeTxPl.length;
        uint256 len2 = 4;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                call(
                    gas(),
                    0x19,
                    0,
                    add(computeTxPl, 0x20),
                    len1,
                    add(result, 0x20),
                    len2
                )
            ) {
                invalid()
            }
        }

        return true;
    }

    /**
     * @notice  Get the encoded Mint transaction's hash.
     * @dev     .
     * @param   data  A serialized Mint transaction.
     * @return  bytes  The transaction's hash.
     */
    function getMintHash(bytes memory data) public returns (bytes memory) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory mintpayload = bytes.concat(paylen, data);

        uint256 len2 = mintpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x11,
                    0,
                    add(mintpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        bytes memory ret = abi.decode(result, (bytes));
        return ret;
    }

    /**
     * @notice  Get user public ID encoded in a Mint transaction.
     * @dev     .
     * @param   data  A serialized Mint transaction.
     * @return  bytes  The transaction's user public ID.
     */
    function getMintUserPid(bytes memory data) public returns (bytes memory) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory mintpayload = bytes.concat(paylen, data);

        uint256 len2 = mintpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x13,
                    0,
                    add(mintpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        bytes memory ret = abi.decode(result, (bytes));
        return ret;
    }

    /**
     * @notice  Get the input value encoded in a Mint transaction.
     * @dev     .
     * @param   data  A serialized Mint transaction.
     * @return  uint64  The transaction's requested value.
     */
    function getMintVal(bytes memory data) public returns (uint64) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory mintpayload = bytes.concat(paylen, data);

        uint256 len2 = mintpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x12,
                    0,
                    add(mintpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        uint64 ret = abi.decode(result, (uint64));
        return ret;
    }

    /**
     * @notice  Get the value encoded in a Burn transaction.
     * @dev     .
     * @param   data  A serialized Burn transaction.
     * @return  uint64  The transaction's input value.
     */
    function getBurnVal(bytes memory data) public returns (uint64) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory burnpayload = bytes.concat(paylen, data);

        uint256 len2 = burnpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x14,
                    0,
                    add(burnpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        uint64 ret = abi.decode(result, (uint64));
        return ret;
    }

    /**
     * @notice  Get the encoded user public ID of a Burn transaction.
     * @dev     .
     * @param   data  A serialized Burn transaction.
     * @return  bytes  The user public ID.
     */
    function getBurnUserPid(bytes memory data) public returns (bytes memory) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory burnpayload = bytes.concat(paylen, data);

        uint256 len2 = burnpayload.length;
        uint256 len = 4000;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(
                call(
                    gas(),
                    0x15,
                    0,
                    add(burnpayload, 0x20),
                    len2,
                    add(result, 0x20),
                    len
                )
            ) {
                invalid()
            }
        }

        bytes memory ret = abi.decode(result, (bytes));
        return ret;
    }

    /**
     * @notice  Start an async procedure for computing a minted coin signature.
     * @dev     Starts an asynchronous procedure, the method returns before the actual signature is ready.
     * @param   sigId  An id assigned by the caller Privacy contract.
     * @param   data  A serialized Mint transaction.
     * @return  bool  True on success.
     */
    function computeMintSignature(uint64 sigId, bytes memory data)
        public
        returns (bool)
    {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory addrs = bytes.concat(len, badd);

        bytes memory sigIdLen = abi.encodePacked(uint32(8));
        bytes memory sigIdBytes = abi.encodePacked(sigId);
        bytes memory lsigId = bytes.concat(sigIdLen, sigIdBytes);

        bytes memory mntlen = abi.encodePacked(uint32(data.length));
        bytes memory mnt = bytes.concat(mntlen, data);

        bytes memory computeMntPl = bytes.concat(addrs, lsigId, mnt);
        uint256 len1 = computeMntPl.length;
        uint256 len2 = 4;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                call(
                    gas(),
                    0x16,
                    0,
                    add(computeMntPl, 0x20),
                    len1,
                    add(result, 0x20),
                    len2
                )
            ) {
                invalid()
            }
        }

        return true;
    }

    /**
     * @notice  Start an async procedure for computing a minted budget coin signature.
     * @dev     Starts an asynchronous procedure, the method returns before the actual signature is ready..
     * @param   sigId  An id assigned by the caller Privacy contract.
     * @param   data  A serialized Budget transaction.
     * @return  bool  True on success.
     */
    function computeBudgetSignature(uint64 sigId, bytes memory data)
        public
        returns (bool)
    {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory addrs = bytes.concat(len, badd);

        bytes memory sigIdLen = abi.encodePacked(uint32(8));
        bytes memory sigIdBytes = abi.encodePacked(sigId);
        bytes memory lsigId = bytes.concat(sigIdLen, sigIdBytes);

        bytes memory mntlen = abi.encodePacked(uint32(data.length));
        bytes memory mnt = bytes.concat(mntlen, data);

        bytes memory computeMntPl = bytes.concat(addrs, lsigId, mnt);
        uint256 len1 = computeMntPl.length;
        uint256 len2 = 4;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                call(
                    gas(),
                    0x17,
                    0,
                    add(computeMntPl, 0x20),
                    len1,
                    add(result, 0x20),
                    len2
                )
            ) {
                invalid()
            }
        }

        return true;
    }
    
    /**
     * @notice  Issue a budget coin by the replicas.
     * @dev     All replicas creates a deterministic coin. Although the coin's randomness is 0, in practice we re-randomize any coin before using it
     * @param   pid  The user public id (to which we want to issue the coin).
     * @param   randHash  The coin's random has number.
     * @param   value  The budget's value.
     * @param   expDate  The budget's expiration date.
     * @return  bytes  The serialized Budget transaction.
     */
    function issueBudgetCoin(
        bytes memory pid,
        bytes memory randHash,
        uint64 value,
        uint64 expDate
    ) public returns (bytes memory) {
        IssueBudgetPayload memory payload;

        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        payload.addr = bytes.concat(len, badd);

        bytes memory rndlen = abi.encodePacked(uint32(randHash.length));
        payload.rndHash = bytes.concat(rndlen, randHash);

        bytes memory valueLen = abi.encodePacked(uint32(8));
        bytes memory valBytes = abi.encodePacked(value);
        payload.value = bytes.concat(valueLen, valBytes);

        bytes memory pidLen = abi.encodePacked(uint32(pid.length));
        payload.pid = bytes.concat(pidLen, pid);

        bytes memory expDateLen = abi.encodePacked(uint32(8));
        bytes memory expDateBytes = abi.encodePacked(expDate);
        payload.expDate = bytes.concat(expDateLen, expDateBytes);

        bytes memory issueBudgetPl = bytes.concat(
            payload.addr,
            payload.rndHash,
            payload.value,
            payload.pid,
            payload.expDate
        );
        uint256 len1 = issueBudgetPl.length;
        uint256 len2 = 6000;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                call(
                    gas(),
                    0x1a,
                    0,
                    add(issueBudgetPl, 0x20),
                    len1,
                    add(result, 0x20),
                    len2
                )
            ) {
                invalid()
            }
        }
        bytes memory ret = abi.decode(result, (bytes));
        //emit issueBudget(ret);
        return ret;
    }

    /**
     * @notice  Get the public part of a Privacy configuration.
     * @dev     This is used by the caller Privacy contract on its deployment and should not be used otherwise.
     * @return  bytes  The public config part of a given complete configuration.
     */
    function getPublicConfig() public returns (bytes memory) {
        bytes memory len = abi.encodePacked(uint32(instances_[msg.sender].config.length));
        bytes memory config = bytes.concat(len, instances_[msg.sender].config);

        uint256 len1 = config.length;
        uint256 len2 = instances_[msg.sender].config.length;
        bytes memory result = new bytes(len2);
        assembly {
            if iszero(
                call(
                    gas(),
                    0xb,
                    0,
                    add(config, 0x20),
                    len1,
                    add(result, 0x20),
                    len2
                )
            ) {
                invalid()
            }
        }
        bytes memory ret = abi.decode(result, (bytes));
        return ret;
    }

    /**
     * @notice  Get a Burn transaction's nullifier.
     * @dev     .
     * @param   data  A serialized Burn transaction.
     * @return  string  The transaction's nullifier.
     */
    function getBurnNullifier(bytes memory data) public returns (string memory) {
        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory burnpayload = bytes.concat(paylen,data);

        uint256 len2 = burnpayload.length;
        uint256 len = 1024;
        bytes memory result = new bytes(len);

        assembly {
            if iszero(call(gas(), 0x1b, 0, add(burnpayload,0x20), len2  , add(result,0x20), len)) {
                invalid()
            }
        }
        string memory ret = string(abi.decode(result, (bytes)));
        return ret;
    }

    /**
     * @notice  Validate a Burn transaction in terms of input coin validity.
     * @dev     .
     * @param   data  A serialized Burn transaction.
     * @return  bool  True if valid.
     */
    function validateBurnTransaction(bytes memory data) public returns (bool) {
        bytes memory badd = abi.encodePacked(msg.sender);
        bytes memory len = abi.encodePacked(uint32(badd.length));
        bytes memory addrs = bytes.concat(len,badd);

        bytes memory paylen = abi.encodePacked(uint32(data.length));
        bytes memory payload = bytes.concat(paylen,data);

        bytes memory txpayload = bytes.concat(addrs,payload);

        uint256 len2 = txpayload.length;
        bytes memory result = new bytes(len2);

        assembly {
            if iszero(call(gas(), 0x1c, 0, add(txpayload,0x20), len2  , add(result,0x20), len)) {
                invalid()
            }
        }
        bool ret = abi.decode(result, (bool));
        return ret;
    }
}
