"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EVMNonceManager_addressToLeadingNonce, _EVMNonceManager_addressToPendingNonces, _EVMNonceManager_initialized, _EVMNonceManager_chainId, _EVMNonceManager_chainName, _EVMNonceManager_db;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMNonceManager = exports.NonceLocalStorage = exports.NonceInfo = void 0;
const error_handler_1 = require("./error-handler");
const local_storage_1 = require("./local-storage");
const logger_1 = require("./logger");
const refcounting_closeable_1 = require("./refcounting-closeable");
class NonceInfo {
    constructor(nonce, expiry) {
        this.nonce = nonce;
        this.expiry = expiry;
    }
}
exports.NonceInfo = NonceInfo;
NonceInfo.prototype.valueOf = function () {
    return this.nonce;
};
class NonceLocalStorage extends refcounting_closeable_1.ReferenceCountingCloseable {
    constructor(dbPath) {
        super(dbPath);
        this._localStorage = local_storage_1.LocalStorage.getInstance(dbPath, this.handle);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._localStorage.init();
        });
    }
    saveLeadingNonce(chain, chainId, address, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            const nonceValue = String(nonce.nonce);
            const nonceExpiry = String(nonce.expiry);
            return this._localStorage.save(chain + '/' + String(chainId) + '/' + address, `${nonceValue}:${nonceExpiry}`);
        });
    }
    getLeadingNonces(chain, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._localStorage.get((key, value) => {
                const splitKey = key.split('/');
                if (splitKey.length === 3 &&
                    splitKey[0] === chain &&
                    splitKey[1] === String(chainId)) {
                    const nonceValues = value.split(':');
                    const address = String(splitKey[2]);
                    const nonce = new NonceInfo(parseInt(nonceValues[0]), parseInt(nonceValues[1]));
                    return [address, nonce];
                }
                return;
            });
        });
    }
    savePendingNonces(chain, chainId, address, nonces) {
        return __awaiter(this, void 0, void 0, function* () {
            let value = '';
            for (const nonce of nonces) {
                const nonceValue = String(nonce.nonce);
                const nonceExpiry = String(nonce.expiry);
                value = value + ',' + `${nonceValue}:${nonceExpiry}`;
            }
            return this._localStorage.save(`${chain}/${String(chainId)}/${address}/pending`, value);
        });
    }
    getPendingNonces(chain, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._localStorage.get((key, value) => {
                const splitKey = key.split('/');
                if (splitKey.length === 4 &&
                    splitKey[0] === chain &&
                    splitKey[1] === String(chainId) &&
                    splitKey[3] === String('pending')) {
                    const address = String(splitKey[2]);
                    const rawNonceValues = value.split(',');
                    const nonceInfoList = [];
                    for (const values of rawNonceValues) {
                        const nonceValues = values.split(':');
                        nonceInfoList.push(new NonceInfo(parseInt(nonceValues[0]), parseInt(nonceValues[1])));
                    }
                    nonceInfoList.splice(0, 1);
                    return [`${address}`, nonceInfoList];
                }
                return;
            });
        });
    }
    close(handle) {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this, handle);
            if (this.refCount < 1) {
                yield this._localStorage.close(this.handle);
            }
        });
    }
}
exports.NonceLocalStorage = NonceLocalStorage;
class EVMNonceManager extends refcounting_closeable_1.ReferenceCountingCloseable {
    constructor(chainName, chainId, dbPath, localNonceTTL = 300 * 1000, pendingNonceTTL = 300 * 1000) {
        const refCountKey = `${chainName}/${chainId}/${dbPath}`;
        super(refCountKey);
        _EVMNonceManager_addressToLeadingNonce.set(this, {});
        _EVMNonceManager_addressToPendingNonces.set(this, {});
        _EVMNonceManager_initialized.set(this, false);
        _EVMNonceManager_chainId.set(this, void 0);
        _EVMNonceManager_chainName.set(this, void 0);
        _EVMNonceManager_db.set(this, void 0);
        this._provider = null;
        __classPrivateFieldSet(this, _EVMNonceManager_chainName, chainName, "f");
        __classPrivateFieldSet(this, _EVMNonceManager_chainId, chainId, "f");
        __classPrivateFieldSet(this, _EVMNonceManager_db, NonceLocalStorage.getInstance(dbPath, this.handle), "f");
        this._localNonceTTL = localNonceTTL;
        this._pendingNonceTTL = pendingNonceTTL;
    }
    init(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._localNonceTTL < 0) {
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.init localNonceTTL must be greater than or equal to zero.'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
            if (this._pendingNonceTTL < 0) {
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.init pendingNonceTTL must be greater than or equal to zero.'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
            if (!this._provider) {
                this._provider = provider;
            }
            if (!__classPrivateFieldGet(this, _EVMNonceManager_initialized, "f")) {
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").init();
                const addressToLeadingNonce = yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").getLeadingNonces(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"));
                const addressToPendingNonces = yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").getPendingNonces(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"));
                for (const [address, nonce] of Object.entries(addressToLeadingNonce)) {
                    logger_1.logger.info(`Loading leading nonce ${nonce} for address ${address}.`);
                    __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[address] = nonce;
                }
                for (const [address, pendingNonceInfoList] of Object.entries(addressToPendingNonces)) {
                    __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[address] = pendingNonceInfoList;
                }
                yield Promise.all(Object.keys(__classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")).map((address) => __awaiter(this, void 0, void 0, function* () {
                    yield this.mergeNonceFromEVMNode(address, true);
                })));
                __classPrivateFieldSet(this, _EVMNonceManager_initialized, true, "f");
            }
        });
    }
    mergeNonceFromEVMNode(ethAddress, intializationPhase = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._provider != null && (intializationPhase || __classPrivateFieldGet(this, _EVMNonceManager_initialized, "f"))) {
                const leadingNonceExpiryTimestamp = __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress]
                    ? __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress].expiry
                    : -1;
                const now = new Date().getTime();
                if (leadingNonceExpiryTimestamp > now) {
                    return;
                }
                const externalNonce = (yield this._provider.getTransactionCount(ethAddress, 'latest')) - 1;
                __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress] = new NonceInfo(externalNonce, now + this._localNonceTTL);
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").saveLeadingNonce(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress]);
                yield this.dropExpiredPendingNonces(ethAddress);
            }
            else {
                logger_1.logger.error('EVMNonceManager.mergeNonceFromEVMNode called before initiated');
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.mergeNonceFromEVMNode'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
        });
    }
    getNonceFromMemory(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _EVMNonceManager_initialized, "f")) {
                if (__classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress]) {
                    yield this.mergeNonceFromEVMNode(ethAddress);
                    return __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress].nonce;
                }
                else {
                    return null;
                }
            }
            else {
                logger_1.logger.error('EVMNonceManager.getNonceFromMemory called before initiated');
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.getNonceFromMemory'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
        });
    }
    getNonceFromNode(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _EVMNonceManager_initialized, "f") && this._provider != null) {
                const externalNonce = (yield this._provider.getTransactionCount(ethAddress)) - 1;
                const now = new Date().getTime();
                __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress] = new NonceInfo(externalNonce, now + this._pendingNonceTTL);
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").saveLeadingNonce(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress]);
                return __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress].nonce;
            }
            else {
                logger_1.logger.error('EVMNonceManager.getNonceFromNode called before initiated');
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.getNonceFromNode'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
        });
    }
    getNonce(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let nonce = yield this.getNonceFromMemory(ethAddress);
            if (nonce === null) {
                nonce = yield this.getNonceFromNode(ethAddress);
            }
            return nonce;
        });
    }
    getNextNonce(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _EVMNonceManager_initialized, "f")) {
                yield this.mergeNonceFromEVMNode(ethAddress);
                yield this.dropExpiredPendingNonces(ethAddress);
                let newNonce = null;
                let numberOfPendingNonce = 0;
                const now = new Date().getTime();
                if (__classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress] instanceof Array)
                    numberOfPendingNonce = __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress].length;
                if (numberOfPendingNonce > 0) {
                    const pendingNonces = __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress];
                    for (const nonceInfo of pendingNonces) {
                        if (now > nonceInfo.expiry) {
                            newNonce = nonceInfo;
                            newNonce.expiry = now + this._pendingNonceTTL;
                            break;
                        }
                    }
                    if (newNonce === null) {
                        newNonce = new NonceInfo(pendingNonces[pendingNonces.length - 1].nonce + 1, now + this._pendingNonceTTL);
                        __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress].push(newNonce);
                    }
                }
                else {
                    newNonce = new NonceInfo((yield this.getNonce(ethAddress)) + 1, now + this._pendingNonceTTL);
                    __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress] = [newNonce];
                }
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").savePendingNonces(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), `${ethAddress}`, __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress]);
                return newNonce.nonce;
            }
            else {
                logger_1.logger.error('EVMNonceManager.getNextNonce called before initiated');
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.getNextNonce'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
        });
    }
    dropExpiredPendingNonces(ethAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress] instanceof Array) {
                const now = new Date().getTime();
                const leadingNonce = __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress];
                const unexpiredPendingNonces = [];
                for (const pendingNonceInfo of __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress]) {
                    if (pendingNonceInfo.expiry > now &&
                        (leadingNonce === undefined ||
                            pendingNonceInfo.nonce > leadingNonce.nonce)) {
                        unexpiredPendingNonces.push(pendingNonceInfo);
                    }
                }
                __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress] = unexpiredPendingNonces;
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").savePendingNonces(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress]);
            }
        });
    }
    provideNonce(nonce, ethAddress, f) {
        return __awaiter(this, void 0, void 0, function* () {
            let nextNonce;
            if (nonce === undefined) {
                nextNonce = yield this.getNextNonce(ethAddress);
            }
            else {
                nextNonce = nonce;
            }
            try {
                logger_1.logger.info(`Providing the next nonce ${nextNonce} for address ${ethAddress}.`);
                const result = yield f(nextNonce);
                yield this.commitNonce(ethAddress, nextNonce);
                return result;
            }
            catch (err) {
                logger_1.logger.error(`Transaction with nonce ${nextNonce} for address ${ethAddress} failed : ${err}`);
                __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress] = __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress].filter((pendingNonceInfo) => pendingNonceInfo.nonce < nextNonce);
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").savePendingNonces(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, __classPrivateFieldGet(this, _EVMNonceManager_addressToPendingNonces, "f")[ethAddress]);
                throw err;
            }
        });
    }
    commitNonce(ethAddress, txNonce) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _EVMNonceManager_initialized, "f")) {
                const now = new Date().getTime();
                if (__classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress]) {
                    if (txNonce > __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress].nonce) {
                        const nonce = new NonceInfo(txNonce, now + this._localNonceTTL);
                        __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress] = nonce;
                        yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").saveLeadingNonce(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, nonce);
                        return;
                    }
                    else {
                        logger_1.logger.error('Provided txNonce is < currentNonce');
                        throw new error_handler_1.InvalidNonceError(error_handler_1.INVALID_NONCE_ERROR_MESSAGE +
                            `txNonce(${txNonce}) < currentNonce(${__classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress].nonce})`, error_handler_1.INVALID_NONCE_ERROR_CODE);
                    }
                }
                const nonce = new NonceInfo(txNonce, now + this._localNonceTTL);
                __classPrivateFieldGet(this, _EVMNonceManager_addressToLeadingNonce, "f")[ethAddress] = nonce;
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").saveLeadingNonce(__classPrivateFieldGet(this, _EVMNonceManager_chainName, "f"), __classPrivateFieldGet(this, _EVMNonceManager_chainId, "f"), ethAddress, nonce);
            }
            else {
                logger_1.logger.error('EVMNonceManager.commitNonce called before initiated');
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.commitNonce'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            }
        });
    }
    isValidNonce(ethAddress, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            const expectedNonce = yield this.getNextNonce(ethAddress);
            if (nonce == expectedNonce)
                return true;
            return false;
        });
    }
    close(ownerHandle) {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this, ownerHandle);
            if (this.refCount < 1) {
                yield __classPrivateFieldGet(this, _EVMNonceManager_db, "f").close(this.handle);
            }
        });
    }
}
exports.EVMNonceManager = EVMNonceManager;
_EVMNonceManager_addressToLeadingNonce = new WeakMap(), _EVMNonceManager_addressToPendingNonces = new WeakMap(), _EVMNonceManager_initialized = new WeakMap(), _EVMNonceManager_chainId = new WeakMap(), _EVMNonceManager_chainName = new WeakMap(), _EVMNonceManager_db = new WeakMap();
//# sourceMappingURL=evm.nonce.js.map