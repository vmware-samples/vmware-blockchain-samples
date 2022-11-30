// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

interface IPrivacy_VirtualContract {
    function UttInit(bytes memory data) external returns (bytes memory);
    function UttValidateTransaction(bytes memory data) external returns (bool);
    function getTransactionNullifiers(bytes memory tx) external returns (string[] memory);
    function computeRcmSignature(bytes memory pidstr, bytes memory data, uint64 sigId) external returns (uint64[] memory);
    function hasBudgetCoin(bytes memory data) external returns (bool);
    function getBudgetExpirationDate(bytes memory data) external returns (uint64);
    function computeTransactionSignatures(uint64[] memory sids, bytes memory data) external returns (bool);
    function getMintHash(bytes memory data) external returns (bytes memory);
    function getMintUserPid(bytes memory data) external returns (bytes memory);
    function getMintVal(bytes memory data) external returns (uint64);
    function validateBurnTransaction(bytes memory data) external returns (bool);
    function getBurnVal(bytes memory data) external returns (uint64);
    function getBurnUserPid(bytes memory data) external returns (bytes memory);
    function getBurnNullifier(bytes memory data) external returns (string memory);
    function computeMintSignature(uint64 sigId, bytes memory data) external returns (bool);
    function computeBudgetSignature(uint64 sigId, bytes memory data) external returns (bool);
    function getPublicConfig() external returns (bytes memory);

    function issueBudgetCoin(bytes memory pid, bytes memory randHash, uint64 value, uint64 expDate) external returns (bytes memory);
}

function uintToString(uint num) pure returns (string memory _uintAsString) {
        if (num == 0) {
            return "0";
        }
        uint j = num;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (num > 0) {
            k = k-1;
            uint8 temp = uint8(num%10 + 48);
            bstr[k] = bytes1(temp);
            num /= 10;
        }
        return string(bstr);
}

function equalBytes(bytes memory lhs, bytes memory rhs) pure returns (bool) {
    return lhs.length == rhs.length && keccak256(lhs) == keccak256(rhs);
}

// [TODO-UTT] Add an 'admin scoped' setTokenContract(address) function to set
// the instance of the token contract paired with the PrivateToken
// When minting/burning the PrivateToken must allow only this token contract
// to interact with it.

contract PrivateToken {
    event RegSigAdded(string userId);

    struct Registration {
        bool isSet;
        string pk;
        uint64[] s2;
        uint64 sigId;
    }

    struct Budget {
        bool isSet;
        bytes token;
        uint64 sigId;
    }

    enum TxType{ NotSet, Mint, Burn, Transfer }

    struct Tx {
        TxType txType;
        bytes txData;
        uint64[] sigIds;
    }

    mapping(uint64 => bytes) _sigIdToSig;

    // Note: This hardcoded virtual contract address will be the same if
    // the same default VMBC ethereum account deploys the virtual contract as its first transaction.
    // Addresses of deployed contracts are computed deterministically from the address of the
    // deployment address and its nonce (number of transactions previously made).
    address public constant VIRTUAL_CONTRACT_ADDR =
        0x01C0E949a87590D4635794Ab4B10F012Ff28522d;
    IPrivacy_VirtualContract _vc = IPrivacy_VirtualContract(VIRTUAL_CONTRACT_ADDR);

    bytes _publicConfig;

    uint64 _lastTxNum = 0;
    uint64 _lastTokenId = 0;
    uint64 _lastSigId = 0;

    mapping(string => Registration) _regs;
    mapping(string => Budget) _budgets;
    mapping(uint64 => Tx) _ledger;
    mapping (string => bool) _nullifiers;

    constructor(bytes memory config) {
        require(config.length > 0);
        _vc.UttInit(config);
        _publicConfig = _vc.getPublicConfig();
        require(_publicConfig.length > 0);
    }

    struct RegisterUserRequest {
        string userId;
        string userPk;
        bytes rcm1;
    }

    struct CreateBudgetRequest {
        string userId;
        uint64 expirationDate;
        uint64 value;
    }

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

    struct TransferRequest {
        bytes txData;
        uint32 numOutputs;
    }

    // Test code to make sure that the config is persisted in the VC
    // function getConfig() external view returns (bytes memory) {
    //     return _vc.getConfig(address(this));
    // }

    function getRegS2(string calldata userId)
        external
        view
        returns (uint64[] memory)
    {
        require(_regs[userId].isSet);
        return _regs[userId].s2;
    }

    function getRegSignature(string calldata userId)
        external
        view
        returns (bytes memory)
    {
        require(_regs[userId].isSet);
        return _sigIdToSig[_regs[userId].sigId];
    }

    function getUserPk(string calldata userId)
        external
        view
        returns (string memory)
    {
        require(_regs[userId].isSet);
        return _regs[userId].pk;
    }

    function registerUser(RegisterUserRequest calldata req)
        external
        returns (bool)
    {
        if (_regs[req.userId].isSet) {
            return false; // Already registered
        }

        uint64 nextSigId = _lastSigId + 1;
        uint64[] memory s2 = _vc.computeRcmSignature(
            bytes(req.userId),
            req.rcm1,
            nextSigId
        );
        require(s2.length > 0);

        // Note: Everything is set except the signature, which is computed asynchronously
        // and is expected to be delivered with 'setSig'
        _regs[req.userId].isSet = true;
        _regs[req.userId].s2 = s2;
        _regs[req.userId].pk = req.userPk;
        _regs[req.userId].sigId = nextSigId;

        _lastSigId = nextSigId;

        return true;
    }

    function isRegistered(string memory userId) external view returns (bool) {
        return _regs[userId].isSet;
    }
    
    function createPublicBudget(CreateBudgetRequest calldata req) public returns (bool) {
        require(req.value > 0);

        // Issue budget token
        //uint64 nextTokenId = _lastTokenId + 1;

        // We just need a unique hash per user - only a single budget token will be minted for each user
        // when testing
        string memory budgetHash = string.concat("budget|", req.userId, uintToString(_lastSigId));

        bytes memory token = _vc.issueBudgetCoin(bytes(req.userId), bytes(budgetHash), req.value, req.expirationDate);

        _budgets[req.userId].isSet = true;
        _budgets[req.userId].token = token;

        // Sign budget token
        uint64 nextSigId = _lastSigId + 1;
        _vc.computeBudgetSignature(nextSigId, token);
        _budgets[req.userId].sigId = nextSigId;

        _lastSigId = nextSigId;
        //_lastTokenId = nextTokenId;

        // [TODO-UTT] Clear any previous signatures that have been computed

        return true;
    }

    function getLatestPublicBudget(string calldata userId) external view returns (bytes memory) {
        require(_budgets[userId].isSet);
        return _budgets[userId].token;
    }

    function getLatestPublicBudgetSig(string calldata userId) external view returns (bytes memory) {
        // [TODO-UTT] Alternatively check if sig ids match between the token and the signature 
        require(_budgets[userId].isSet);
        return _sigIdToSig[_budgets[userId].sigId];
    }

    function convertPublicToPrivate(PublicToPrivateRequest calldata req) public returns (bool) {
        require(_vc.getMintVal(req.txData) == req.value);
        require(equalBytes(_vc.getMintUserPid(req.txData), bytes(req.userId)));

        uint64 nextTxNum = _lastTxNum + 1;
        uint64 nextSigId = _lastSigId + 1;
        
        if (!_vc.computeMintSignature(nextSigId, req.txData)) {
            return false;
        }

        _ledger[nextTxNum].txType = TxType.Mint;
        _ledger[nextTxNum].txData = req.txData;
        _ledger[nextTxNum].sigIds = new uint64[](1);
        _ledger[nextTxNum].sigIds[0] = nextSigId;

        _lastTxNum = nextTxNum;
        _lastSigId = nextSigId;

        return true;
    }

    function convertPrivateToPublic(PrivateToPublicRequest calldata req) public returns (bool) {
        require(_vc.validateBurnTransaction(req.txData));
        require(_vc.getBurnVal(req.txData) == req.value);
        require(equalBytes(_vc.getBurnUserPid(req.txData), bytes(req.userId)));

        string memory nullifier = _vc.getBurnNullifier(req.txData);
        require(bytes(nullifier).length > 0);
        require(_nullifiers[nullifier] == false);
        _nullifiers[nullifier] = true;

        uint64 nextTxNum = _lastTxNum + 1;
        _ledger[nextTxNum].txType = TxType.Burn;
        _ledger[nextTxNum].txData = req.txData;

        _lastTxNum = nextTxNum;

        return true;
    }

    function transfer(TransferRequest calldata req) public returns (bool) {
        require(req.numOutputs > 0);
        require(_vc.UttValidateTransaction(req.txData));
        
        string[] memory nulls = _vc.getTransactionNullifiers(req.txData);
        require(nulls.length > 0);
        for (uint i = 0; i < nulls.length; i++) {
            require(bytes(nulls[i]).length > 0);
            require(_nullifiers[nulls[i]] == false);
            _nullifiers[nulls[i]] = true;
        }

        uint64[] memory sigIds = new uint64[](req.numOutputs);
        uint64 nextSigId = _lastSigId;
        for (uint i = 0; i < req.numOutputs; i++) {
            nextSigId++;
            sigIds[i] = nextSigId; 
        }

        require(_vc.computeTransactionSignatures(sigIds, req.txData));

        uint64 nextTxNum = _lastTxNum + 1;

        _ledger[nextTxNum].txType = TxType.Transfer;
        _ledger[nextTxNum].sigIds = sigIds;
        _ledger[nextTxNum].txData = req.txData;

        _lastTxNum = nextTxNum;
        _lastSigId = nextSigId;
        
        return true;
    }

    function getPublicConfig() external view returns (bytes memory) {
        return _publicConfig;
    }

    function getNumOfLastAddedTransaction() external view returns (uint64) {
        return _lastTxNum;
    }

    function getTransaction(uint64 txNum) external view returns (Tx memory) {
        require(_ledger[txNum].txType != TxType.NotSet);
        return _ledger[txNum];
    }

    function getTransactionSigs(uint64 txNum) external view returns (bytes[] memory) {
        require(_ledger[txNum].txType != TxType.NotSet);

        bytes[] memory result = new bytes[](_ledger[txNum].sigIds.length);

        for (uint i = 0; i < _ledger[txNum].sigIds.length; ++i) {
            result[i] = _sigIdToSig[_ledger[txNum].sigIds[i]];
        }

        return result;
    }

    // This function is called from the Virtual Contract when a signature is ready
    function setSig(uint64 sigId, bytes memory sig) external returns (bool) {
        _sigIdToSig[sigId] = sig;

        // emit RegSigAdded(userId); // Presumably we can subscribe to such events and use them in a dApp
        return true;
    }
}
