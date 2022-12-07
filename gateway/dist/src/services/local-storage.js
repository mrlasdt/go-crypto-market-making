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
var _LocalStorage_dbPath, _LocalStorage_db;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const level_1 = require("level");
const refcounting_closeable_1 = require("./refcounting-closeable");
class LocalStorage extends refcounting_closeable_1.ReferenceCountingCloseable {
    constructor(dbPath) {
        super(dbPath);
        _LocalStorage_dbPath.set(this, void 0);
        _LocalStorage_db.set(this, void 0);
        __classPrivateFieldSet(this, _LocalStorage_dbPath, dbPath, "f");
        __classPrivateFieldSet(this, _LocalStorage_db, new level_1.Level(dbPath, {
            createIfMissing: true,
            valueEncoding: 'json',
        }), "f");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _LocalStorage_db, "f").open({ passive: true });
        });
    }
    get dbPath() {
        return __classPrivateFieldGet(this, _LocalStorage_dbPath, "f");
    }
    get dbStatus() {
        return __classPrivateFieldGet(this, _LocalStorage_db, "f").status;
    }
    assertDbOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _LocalStorage_db, "f").status === 'open') {
                return;
            }
            else if (__classPrivateFieldGet(this, _LocalStorage_db, "f").status === 'closing') {
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                yield this.assertDbOpen();
            }
            else if (__classPrivateFieldGet(this, _LocalStorage_db, "f").status === 'closed') {
                yield __classPrivateFieldGet(this, _LocalStorage_db, "f").open({ createIfMissing: true });
                yield this.assertDbOpen();
            }
            else if (__classPrivateFieldGet(this, _LocalStorage_db, "f").status === 'opening') {
                yield __classPrivateFieldGet(this, _LocalStorage_db, "f").open({ passive: true });
            }
        });
    }
    save(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertDbOpen();
            yield __classPrivateFieldGet(this, _LocalStorage_db, "f").put(key, value);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertDbOpen();
            yield __classPrivateFieldGet(this, _LocalStorage_db, "f").del(key);
        });
    }
    get(readFunc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assertDbOpen();
            const results = {};
            const kvs = yield __classPrivateFieldGet(this, _LocalStorage_db, "f")
                .iterator({
                keys: true,
                values: true,
            })
                .all();
            for (const [key, value] of kvs) {
                const data = readFunc(key, value);
                if (data) {
                    results[data[0]] = data[1];
                }
            }
            return results;
        });
    }
    close(handle) {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this, handle);
            if (this.refCount < 1) {
                __classPrivateFieldGet(this, _LocalStorage_db, "f").close((_) => true);
            }
        });
    }
}
exports.LocalStorage = LocalStorage;
_LocalStorage_dbPath = new WeakMap(), _LocalStorage_db = new WeakMap();
//# sourceMappingURL=local-storage.js.map