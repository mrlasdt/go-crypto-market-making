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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvmTxStorage = void 0;
const local_storage_1 = require("./local-storage");
const refcounting_closeable_1 = require("./refcounting-closeable");
class EvmTxStorage extends refcounting_closeable_1.ReferenceCountingCloseable {
    constructor(dbPath) {
        super(dbPath);
        this.localStorage = local_storage_1.LocalStorage.getInstance(dbPath, this.handle);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.localStorage.init();
        });
    }
    saveTx(chain, chainId, tx, date, currentGasPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.localStorage.save(chain + '/' + String(chainId) + '/' + tx, date.getTime().toString() + ',' + currentGasPrice.toString());
        });
    }
    deleteTx(chain, chainId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.localStorage.del(chain + '/' + String(chainId) + '/' + tx);
        });
    }
    getTxs(chain, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.localStorage.get((key, value) => {
                const splitKey = key.split('/');
                const splitValue = value.split(',');
                if (splitKey.length === 3 &&
                    splitKey[0] === chain &&
                    splitKey[1] === String(chainId) &&
                    splitValue.length === 2) {
                    return [
                        splitKey[2],
                        [new Date(parseInt(splitValue[0])), parseInt(splitValue[1])],
                    ];
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
                yield this.localStorage.close(this.handle);
            }
        });
    }
}
exports.EvmTxStorage = EvmTxStorage;
//# sourceMappingURL=evm.tx-storage.js.map