"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.VmbcJsonRpcProvider = void 0;
var providers_1 = require("@ethersproject/providers");
var properties_1 = require("@ethersproject/properties");
var web_1 = require("@ethersproject/web");
var bignumber_1 = require("@ethersproject/bignumber");
var address_1 = require("@ethersproject/address");
var strings_1 = require("@ethersproject/strings");
var RLP = require("@ethersproject/rlp");
var keccak256_1 = require("@ethersproject/keccak256");
var bytes_1 = require("@ethersproject/bytes");
var signing_key_1 = require("@ethersproject/signing-key");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var errorGas = ["call", "estimateGas"];
function spelunk(value, requireData) {
    if (value == null) {
        return null;
    }
    // These *are* the droids we're looking for.
    if (typeof (value.message) === "string" && value.message.match("reverted")) {
        var data = (0, bytes_1.isHexString)(value.data) ? value.data : null;
        if (!requireData || data) {
            return { message: value.message, data: data };
        }
    }
    // Spelunk further...
    if (typeof (value) === "object") {
        for (var key in value) {
            var result = spelunk(value[key], requireData);
            if (result) {
                return result;
            }
        }
        return null;
    }
    // Might be a JSON string we can further descend...
    if (typeof (value) === "string") {
        try {
            return spelunk(JSON.parse(value), requireData);
        }
        catch (error) { }
    }
    return null;
}
function checkError(method, error, params) {
    var transaction = params.transaction || params.signedTransaction;
    // Undo the "convenience" some nodes are attempting to prevent backwards
    // incompatibility; maybe for v6 consider forwarding reverts as errors
    if (method === "call") {
        var result = spelunk(error, true);
        if (result) {
            return result.data;
        }
        // Nothing descriptive..
        logger.throwError("missing revert data in call exception; Transaction reverted without a reason string", logger_1.Logger.errors.CALL_EXCEPTION, {
            data: "0x",
            transaction: transaction,
            error: error
        });
    }
    if (method === "estimateGas") {
        // Try to find something, with a preference on SERVER_ERROR body
        var result = spelunk(error.body, false);
        if (result == null) {
            result = spelunk(error, false);
        }
        // Found "reverted", this is a CALL_EXCEPTION
        if (result) {
            logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", logger_1.Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
                reason: result.message,
                method: method,
                transaction: transaction,
                error: error
            });
        }
    }
    // @TODO: Should we spelunk for message too?
    var message = error.message;
    if (error.code === logger_1.Logger.errors.SERVER_ERROR && error.error && typeof (error.error.message) === "string") {
        message = error.error.message;
    }
    else if (typeof (error.body) === "string") {
        message = error.body;
    }
    else if (typeof (error.responseText) === "string") {
        message = error.responseText;
    }
    message = (message || "").toLowerCase();
    // "insufficient funds for gas * price + value + cost(data)"
    if (message.match(/insufficient funds|base fee exceeds gas limit/i)) {
        logger.throwError("insufficient funds for intrinsic transaction cost", logger_1.Logger.errors.INSUFFICIENT_FUNDS, {
            error: error,
            method: method,
            transaction: transaction
        });
    }
    // "nonce too low"
    if (message.match(/nonce (is )?too low/i)) {
        logger.throwError("nonce has already been used", logger_1.Logger.errors.NONCE_EXPIRED, {
            error: error,
            method: method,
            transaction: transaction
        });
    }
    // "replacement transaction underpriced"
    if (message.match(/replacement transaction underpriced|transaction gas price.*too low/i)) {
        logger.throwError("replacement fee too low", logger_1.Logger.errors.REPLACEMENT_UNDERPRICED, {
            error: error,
            method: method,
            transaction: transaction
        });
    }
    // "replacement transaction underpriced"
    if (message.match(/only replay-protected/i)) {
        logger.throwError("legacy pre-eip-155 transactions not supported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            error: error,
            method: method,
            transaction: transaction
        });
    }
    if (errorGas.indexOf(method) >= 0 && message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
        logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", logger_1.Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
            error: error,
            method: method,
            transaction: transaction
        });
    }
    throw error;
}
function getResult(payload) {
    if (payload.error) {
        // @TODO: not any
        var error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload.result;
}
var VmbcJsonRpcProvider = /** @class */ (function (_super) {
    __extends(VmbcJsonRpcProvider, _super);
    function VmbcJsonRpcProvider(url, network) {
        var _this = _super.call(this, url, network) || this;
        _this._signingKey = "";
        return _this;
    }
    VmbcJsonRpcProvider.prototype.setSigningKey = function (params) {
        this._signingKey = params.readPermissioningKeyOrEnable;
    };
    VmbcJsonRpcProvider.prototype.getSigningKey = function () {
        var pKey;
        if (this._signingKey != null) {
            pKey = this._signingKey;
        }
        else {
            pKey = null;
        }
        return pKey;
    };
    VmbcJsonRpcProvider.prototype.formatNumberField = function (value, name) {
        var result = (0, bytes_1.stripZeros)(bignumber_1.BigNumber.from(value).toHexString());
        if (result.length > 32) {
            logger.throwArgumentError("invalid length for " + name, ("transaction:" + name), value);
        }
        return result;
    };
    VmbcJsonRpcProvider.prototype.encodeReadParams = function (timestamp, params) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, pKey, blockNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = [];
                        if (params.transaction) {
                            fields.push(this.formatNumberField(params.transaction.gasPrice || 0, "gasPrice"));
                            fields.push(this.formatNumberField(params.transaction.gasLimit || 0, "gasLimit"));
                            fields.push(((params.transaction.from != null) ? (0, address_1.getAddress)(params.transaction.from) : "0x"));
                            fields.push(((params.transaction.to != null) ? (0, address_1.getAddress)(params.transaction.to) : "0x"));
                            fields.push(this.formatNumberField(params.transaction.value || 0, "value"));
                            fields.push((params.transaction.data || "0x"));
                        }
                        else {
                            fields.push(this.formatNumberField(0, "gasPrice"));
                            fields.push(this.formatNumberField(0, "gasLimit"));
                            fields.push(("0x"));
                            fields.push(("0x"));
                            fields.push(this.formatNumberField(0, "value"));
                            fields.push(("0x"));
                        }
                        pKey = this.getSigningKey();
                        if (!(typeof (pKey) === "boolean" && pKey == true && params.blockTag == "latest")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getBlockNumber()];
                    case 1:
                        blockNumber = _a.sent();
                        fields.push((0, strings_1.toUtf8Bytes)((0, bytes_1.hexlify)(blockNumber)));
                        return [3 /*break*/, 3];
                    case 2:
                        fields.push((0, strings_1.toUtf8Bytes)(params.blockTag || 0));
                        _a.label = 3;
                    case 3:
                        fields.push((0, strings_1.toUtf8Bytes)(params.includeTransactions || false));
                        if (params.filter) {
                            fields.push(params.filter.blockHash || "0x");
                            fields.push(params.filter.address || "0x");
                            fields.push(params.filter.topics || []);
                            fields.push((0, strings_1.toUtf8Bytes)(params.filter.fromBlock || 0));
                            fields.push((0, strings_1.toUtf8Bytes)(params.filter.toBlock || 0));
                        }
                        else {
                            fields.push(params.blockHash || "0x");
                            fields.push(params.address || "0x");
                            fields.push(params.topics || []);
                            fields.push((0, strings_1.toUtf8Bytes)(params.fromBlock || 0));
                            fields.push((0, strings_1.toUtf8Bytes)(params.toBlock || 0));
                        }
                        fields.push(params.transactionHash || "0x");
                        fields.push(this.formatNumberField(params.position || 0, "position"));
                        fields.push(this.formatNumberField(timestamp || 0, "timestamp"));
                        return [2 /*return*/, fields];
                }
            });
        });
    };
    /*
        VMBC: If a _vmbcCustomParam is set, then override send with adding that custom param
    */
    VmbcJsonRpcProvider.prototype.send = function (method, params) {
        var _this = this;
        // Keeping native ethers compatibility
        if (this._signingKey == "") {
            return _super.prototype.send.call(this, method, params);
        }
        var request = {
            method: method,
            params: params,
            id: (this._nextId++),
            jsonrpc: "2.0"
        };
        this.emit("debug", {
            action: "request",
            request: (0, properties_1.deepCopy)(request),
            provider: this
        });
        // We can expand this in the future to any call, but for now these
        // are the biggest wins and do not require any serializing parameters.
        /*const cache = ([ "eth_chainId", "eth_blockNumber" ].indexOf(method) >= 0);
        if (cache && this._cache[method]) {
            return this._cache[method];
        }*/
        var result = (0, web_1.fetchJson)(this.connection, JSON.stringify(request), getResult).then(function (result) {
            _this.emit("debug", {
                action: "response",
                request: request,
                response: result,
                provider: _this
            });
            return result;
        }, function (error) {
            _this.emit("debug", {
                action: "response",
                error: error,
                request: request,
                provider: _this
            });
            throw error;
        });
        // Cache the fetch, but clear it on the next event loop
        /* if (cache) {
             this._cache[method] = result;
             setTimeout(() => {
                 this._cache[method] = null;
             }, 0);
         }*/
        return result;
    };
    /*
        VMBC: If a _signingKey is set, then override perform
    */
    VmbcJsonRpcProvider.prototype.perform = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, feeData, signature, timestamp, expiryMilliSeconds, pKey, encodedFields, excludeReadSigning, args, encodedBytes, encodedBytesHash, signerAddress, signedSignature, signingKey, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Keeping native ethers compatibility
                        if (this._signingKey == "") {
                            return [2 /*return*/, _super.prototype.perform.call(this, method, params)];
                        }
                        if (!(method === "call" || method === "estimateGas")) return [3 /*break*/, 2];
                        tx = params.transaction;
                        if (!(tx && tx.type != null && bignumber_1.BigNumber.from(tx.type).isZero())) return [3 /*break*/, 2];
                        if (!(tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getFeeData()];
                    case 1:
                        feeData = _a.sent();
                        if (feeData.maxFeePerGas == null && feeData.maxPriorityFeePerGas == null) {
                            // Network doesn't know about EIP-1559 (and hence type)
                            params = (0, properties_1.shallowCopy)(params);
                            params.transaction = (0, properties_1.shallowCopy)(tx);
                            delete params.transaction.type;
                        }
                        _a.label = 2;
                    case 2:
                        signature = null;
                        expiryMilliSeconds = 30000;
                        pKey = this.getSigningKey();
                        encodedFields = [];
                        if (!pKey) return [3 /*break*/, 5];
                        excludeReadSigning = ["estimateGas", "sendTransaction", "getGasPrice", "getBlockNumber"];
                        if (!excludeReadSigning.includes(method)) return [3 /*break*/, 3];
                        pKey = null;
                        return [3 /*break*/, 5];
                    case 3:
                        timestamp = Date.now() + expiryMilliSeconds;
                        return [4 /*yield*/, this.encodeReadParams(timestamp, params)];
                    case 4:
                        encodedFields = _a.sent();
                        _a.label = 5;
                    case 5:
                        args = this.prepareRequest(method, params);
                        if (args == null) {
                            logger.throwError(method + " not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, { operation: method });
                        }
                        if (!pKey) return [3 /*break*/, 9];
                        // push method in the begining of an array
                        encodedFields.unshift((0, strings_1.toUtf8Bytes)(args[0]));
                        encodedBytes = RLP.encode(encodedFields);
                        encodedBytesHash = (0, keccak256_1.keccak256)(encodedBytes);
                        if (!(typeof (pKey) === "boolean" && pKey == true)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getSigner().getAddress()];
                    case 6:
                        signerAddress = _a.sent();
                        return [4 /*yield*/, this.send("eth_sign", [signerAddress.toLowerCase(), (0, bytes_1.hexlify)(encodedBytesHash)])];
                    case 7:
                        signedSignature = _a.sent();
                        signature = (0, bytes_1.splitSignature)(signedSignature);
                        return [3 /*break*/, 9];
                    case 8:
                        if (typeof (pKey) === "string" && pKey != "") {
                            signingKey = new signing_key_1.SigningKey(pKey);
                            signature = signingKey.signDigest(encodedBytesHash);
                        }
                        else {
                            signature = null;
                        }
                        _a.label = 9;
                    case 9:
                        if (signature) {
                            args[1].push(signature);
                            args[1].push({ "expiryTime": timestamp });
                        }
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.send(args[0], args[1])];
                    case 11: return [2 /*return*/, _a.sent()];
                    case 12:
                        error_1 = _a.sent();
                        return [2 /*return*/, checkError(method, error_1, params)];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return VmbcJsonRpcProvider;
}(providers_1.JsonRpcProvider));
exports.VmbcJsonRpcProvider = VmbcJsonRpcProvider;
