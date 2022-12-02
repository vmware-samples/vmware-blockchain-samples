import {JsonRpcProvider} from "@ethersproject/providers"
import {deepCopy, shallowCopy} from "@ethersproject/properties";
import {ConnectionInfo, fetchJson} from "@ethersproject/web";
import {Networkish} from "@ethersproject/networks";

import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { getAddress } from "@ethersproject/address";
import { toUtf8Bytes } from "@ethersproject/strings";
import * as RLP from "@ethersproject/rlp";
import { keccak256 } from "@ethersproject/keccak256";
import { hexlify, isHexString, splitSignature, stripZeros } from "@ethersproject/bytes";
import { SigningKey } from "@ethersproject/signing-key";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

const errorGas = [ "call", "estimateGas" ];

function spelunk(value: any, requireData: boolean): null | { message: string, data: null | string } {
    if (value == null) { return null; }

    // These *are* the droids we're looking for.
    if (typeof(value.message) === "string" && value.message.match("reverted")) {
        const data = isHexString(value.data) ? value.data: null;
        if (!requireData || data) {
            return { message: value.message, data };
        }
    }

    // Spelunk further...
    if (typeof(value) === "object") {
        for (const key in value) {
            const result = spelunk(value[key], requireData);
            if (result) { return result; }
        }
        return null;
    }

    // Might be a JSON string we can further descend...
    if (typeof(value) === "string") {
        try {
            return spelunk(JSON.parse(value), requireData);
        } catch (error) { }
    }

    return null;
}

function checkError(method: string, error: any, params: any): any {

    const transaction = params.transaction || params.signedTransaction;

    // Undo the "convenience" some nodes are attempting to prevent backwards
    // incompatibility; maybe for v6 consider forwarding reverts as errors
    if (method === "call") {
        const result = spelunk(error, true);
        if (result) { return result.data; }

        // Nothing descriptive..
        logger.throwError("missing revert data in call exception; Transaction reverted without a reason string", Logger.errors.CALL_EXCEPTION, {
            data: "0x", transaction, error
        });
    }

    if (method === "estimateGas") {
        // Try to find something, with a preference on SERVER_ERROR body
        let result = spelunk(error.body, false);
        if (result == null) { result = spelunk(error, false); }

        // Found "reverted", this is a CALL_EXCEPTION
        if (result) {
            logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
                reason: result.message, method, transaction, error
            });
        }
    }

    // @TODO: Should we spelunk for message too?

    let message = error.message;
    if (error.code === Logger.errors.SERVER_ERROR && error.error && typeof(error.error.message) === "string") {
        message = error.error.message;
    } else if (typeof(error.body) === "string") {
        message = error.body;
    } else if (typeof(error.responseText) === "string") {
        message = error.responseText;
    }
    message = (message || "").toLowerCase();

    // "insufficient funds for gas * price + value + cost(data)"
    if (message.match(/insufficient funds|base fee exceeds gas limit/i)) {
        logger.throwError("insufficient funds for intrinsic transaction cost", Logger.errors.INSUFFICIENT_FUNDS, {
            error, method, transaction
        });
    }

    // "nonce too low"
    if (message.match(/nonce (is )?too low/i)) {
        logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
            error, method, transaction
        });
    }

    // "replacement transaction underpriced"
    if (message.match(/replacement transaction underpriced|transaction gas price.*too low/i)) {
        logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
            error, method, transaction
        });
    }

    // "replacement transaction underpriced"
    if (message.match(/only replay-protected/i)) {
        logger.throwError("legacy pre-eip-155 transactions not supported", Logger.errors.UNSUPPORTED_OPERATION, {
            error, method, transaction
        });
    }

    if (errorGas.indexOf(method) >= 0 && message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
        logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
            error, method, transaction
        });
    }

    throw error;
}

function getResult(payload: { error?: { code?: number, data?: any, message?: string }, result?: any }): any {
    if (payload.error) {
        // @TODO: not any
        const error: any = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }

    return payload.result;
}

export class VmbcJsonRpcProvider extends JsonRpcProvider {
    _signingKey: any = "";

    constructor(url?: ConnectionInfo | string, network?: Networkish) {
        super(url, network);
    }

    setSigningKey(params: any) {
        this._signingKey = params.readPermissioningKeyOrEnable;
    }

    getSigningKey(): string {
        var pKey:string;
        
        if (this._signingKey != null) {
            pKey =  this._signingKey;
        } else {
            pKey = null;
        }

        return pKey;
    }

    formatNumberField(value: BigNumberish, name: string): Uint8Array {
        const result = stripZeros(BigNumber.from(value).toHexString());
        if (result.length > 32) {
            logger.throwArgumentError("invalid length for " + name, ("transaction:" + name), value);
        }
        return result;
    }

    async encodeReadParams(timestamp:number, params: any): Promise<any[]> {
        /* ================================================
        String method
        Number gasPrice
        Number gasLimit
        String from
        String to
        Number value
        String data
        String/Number blockTag
        Boolean includeTransactions
        String blockHash
        String address
        String[] topics
        String fromBlock
        String toBlock
        String transactionHash
        Number position
        Number timestamp
        ================================================ */
        const fields:any[] = [];
       if (params.transaction) {
            fields.push(this.formatNumberField(params.transaction.gasPrice || 0, "gasPrice"));
            fields.push(this.formatNumberField(params.transaction.gasLimit || 0, "gasLimit"));
            fields.push(((params.transaction.from != null) ? getAddress(params.transaction.from) : "0x"));
            fields.push(((params.transaction.to != null) ? getAddress(params.transaction.to) : "0x"));
            fields.push(this.formatNumberField(params.transaction.value || 0, "value"));
            fields.push((params.transaction.data || "0x"));
        } else {
            fields.push(this.formatNumberField(0, "gasPrice"));
            fields.push(this.formatNumberField(0, "gasLimit"));
            fields.push(("0x"));
            fields.push(("0x"));
            fields.push(this.formatNumberField(0, "value"));
            fields.push(("0x"));
        }
        var pKey = this.getSigningKey();
        if (typeof(pKey) === "boolean" && pKey == true && params.blockTag == "latest") {
            var blockNumber = await this.getBlockNumber();
            fields.push(toUtf8Bytes(hexlify(blockNumber)));
        } else {
            fields.push(toUtf8Bytes(params.blockTag || 0));
        }
        fields.push(toUtf8Bytes(params.includeTransactions || false));
        if (params.filter) {
            fields.push(params.filter.blockHash || "0x");
            fields.push(params.filter.address || "0x");
            fields.push(params.filter.topics || []);
            fields.push(toUtf8Bytes(params.filter.fromBlock || 0));
            fields.push(toUtf8Bytes(params.filter.toBlock || 0));
        } else {
            fields.push(params.blockHash || "0x");
            fields.push(params.address || "0x");
            fields.push(params.topics || []);
            fields.push(toUtf8Bytes(params.fromBlock || 0));
            fields.push(toUtf8Bytes(params.toBlock || 0));
        }
        fields.push(params.transactionHash || "0x");
        fields.push(this.formatNumberField(params.position || 0, "position"));
        fields.push(this.formatNumberField(timestamp || 0, "timestamp"));

        return fields;
    }

    /*
        VMBC: If a _vmbcCustomParam is set, then override send with adding that custom param
    */
    send(method: string, params: Array<any>): Promise<any> {
        // Keeping native ethers compatibility
        if (this._signingKey == "") {
            return super.send(method, params);
        }

        const request = {
            method: method,
            params: params,
            id: (this._nextId++),
            jsonrpc: "2.0"
        };

        this.emit("debug", {
            action: "request",
            request: deepCopy(request),
            provider: this
        });

        // We can expand this in the future to any call, but for now these
        // are the biggest wins and do not require any serializing parameters.
        /*const cache = ([ "eth_chainId", "eth_blockNumber" ].indexOf(method) >= 0);
        if (cache && this._cache[method]) {
            return this._cache[method];
        }*/

        const result = fetchJson(this.connection, JSON.stringify(request), getResult).then((result) => {
            this.emit("debug", {
                action: "response",
                request: request,
                response: result,
                provider: this
            });

            return result;

        }, (error) => {
            this.emit("debug", {
                action: "response",
                error: error,
                request: request,
                provider: this
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
    }

    /*
        VMBC: If a _signingKey is set, then override perform
    */
    async perform(method: string, params: any): Promise<any> {
        // Keeping native ethers compatibility
        if (this._signingKey == "") {
            return super.perform(method, params);
        }

        // Legacy networks do not like the type field being passed along (which
        // is fair), so we delete type if it is 0 and a non-EIP-1559 network
        if (method === "call" || method === "estimateGas") {
            const tx = params.transaction;
            if (tx && tx.type != null && BigNumber.from(tx.type).isZero()) {
                // If there are no EIP-1559 properties, it might be non-EIP-1559
                if (tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null) {
                    const feeData = await this.getFeeData();
                    if (feeData.maxFeePerGas == null && feeData.maxPriorityFeePerGas == null) {
                        // Network doesn't know about EIP-1559 (and hence type)
                        params = shallowCopy(params);
                        params.transaction = shallowCopy(tx);
                        delete params.transaction.type;
                    }
                }
            }
        }

        var signature:any = null;
        var timestamp:number;
        let expiryMilliSeconds: number = 30000;
        var pKey = this.getSigningKey();
        var encodedFields:any = [];
        if (pKey) {
            const excludeReadSigning = ["estimateGas", "sendTransaction", "getGasPrice", "getBlockNumber"];
            if (excludeReadSigning.includes(method)) {
                pKey = null; 
            } else {
                timestamp = Date.now() + expiryMilliSeconds;
                encodedFields = await this.encodeReadParams(timestamp, params);
            }
        }
       
        const args = this.prepareRequest(method,  params);
        if (args == null) {
            logger.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, { operation: method });
        }

        if (pKey) {
            // push method in the begining of an array
            encodedFields.unshift(toUtf8Bytes(args[0]))
            let encodedBytes = RLP.encode(encodedFields);
            let encodedBytesHash = keccak256(encodedBytes);
            if (typeof(pKey) === "boolean" && pKey == true) {
                let signerAddress = await this.getSigner().getAddress();
                let signedSignature = await this.send("eth_sign", [ signerAddress.toLowerCase(), hexlify(encodedBytesHash) ]);
                signature = splitSignature(signedSignature);
            } else if (typeof(pKey) === "string" && pKey != "") {
                const signingKey = new SigningKey(pKey);
                signature =  signingKey.signDigest(encodedBytesHash); 
            } else {
                signature = null;
            }
        }
        if (signature) {
            args[1].push(signature);
            args[1].push({"expiryTime":timestamp});
        }

        try {
            return await this.send(args[0], args[1]);
        } catch (error) {
            return checkError(method, error, params);
        }
    }
}