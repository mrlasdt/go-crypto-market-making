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
exports.ReferenceCountingCloseable = void 0;
const uuid_1 = require("uuid");
class ReferenceCountingCloseable {
    constructor(retrievalKey) {
        this._retrievalKey = retrievalKey;
        this._handle = ReferenceCountingCloseable.createHandle();
    }
    get retrievalKey() {
        return this._retrievalKey;
    }
    get handle() {
        return this._handle;
    }
    get refCount() {
        const fullKey = `${this.constructor.name}/${this.retrievalKey}`;
        if (fullKey in ReferenceCountingCloseable._refCounts) {
            return ReferenceCountingCloseable._refCounts[fullKey].size;
        }
        return 0;
    }
    static createHandle() {
        return (0, uuid_1.v4)();
    }
    static getInstance(retrievalKey, ownerHandle) {
        const fullKey = `${this.name}/${retrievalKey}`;
        if (fullKey in ReferenceCountingCloseable._retrievalMap) {
            ReferenceCountingCloseable._refCounts[fullKey].add(ownerHandle);
            return ReferenceCountingCloseable._retrievalMap[fullKey];
        }
        const instance = this.createInstanceFromKey(retrievalKey);
        ReferenceCountingCloseable._retrievalMap[fullKey] = instance;
        ReferenceCountingCloseable._refCounts[fullKey] = new Set([ownerHandle]);
        return instance;
    }
    static createInstanceFromKey(retrievalKey) {
        return new this(retrievalKey);
    }
    declareOwnership(ownerHandle) {
        const fullKey = `${this.constructor.name}/${this.retrievalKey}`;
        if (!(fullKey in ReferenceCountingCloseable._retrievalMap)) {
            ReferenceCountingCloseable._retrievalMap[fullKey] = this;
        }
        if (!(fullKey in ReferenceCountingCloseable._refCounts)) {
            ReferenceCountingCloseable._refCounts[fullKey] = new Set([ownerHandle]);
        }
        else {
            ReferenceCountingCloseable._refCounts[fullKey].add(ownerHandle);
        }
    }
    close(ownerHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullKey = `${this.constructor.name}/${this.retrievalKey}`;
            if (fullKey in ReferenceCountingCloseable._retrievalMap) {
                ReferenceCountingCloseable._refCounts[fullKey].delete(ownerHandle);
                if (ReferenceCountingCloseable._refCounts[fullKey].size < 1) {
                    delete ReferenceCountingCloseable._refCounts[fullKey];
                    delete ReferenceCountingCloseable._retrievalMap[fullKey];
                }
            }
        });
    }
}
exports.ReferenceCountingCloseable = ReferenceCountingCloseable;
ReferenceCountingCloseable._retrievalMap = {};
ReferenceCountingCloseable._refCounts = {};
//# sourceMappingURL=refcounting-closeable.js.map