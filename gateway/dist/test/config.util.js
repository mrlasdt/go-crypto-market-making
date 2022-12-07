"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _OverrideConfigs_testNonceDbPath, _OverrideConfigs_testTransactionDbPath, _OverrideConfigs_initialized;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBPathOverride = exports.OverrideConfigs = void 0;
const config_manager_v2_1 = require("../src/services/config-manager-v2");
class OverrideConfigs {
    constructor() {
        _OverrideConfigs_testNonceDbPath.set(this, '');
        _OverrideConfigs_testTransactionDbPath.set(this, '');
        _OverrideConfigs_initialized.set(this, false);
        this.nonceDbPath = config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath');
        this.transactionDbPath = config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath');
    }
    init() {
        if (!__classPrivateFieldGet(this, _OverrideConfigs_initialized, "f")) {
            __classPrivateFieldSet(this, _OverrideConfigs_testNonceDbPath, this.nonceDbPath + '.test', "f");
            __classPrivateFieldSet(this, _OverrideConfigs_testTransactionDbPath, this.transactionDbPath + '.test', "f");
            __classPrivateFieldSet(this, _OverrideConfigs_initialized, true, "f");
        }
    }
    updateConfigs() {
        config_manager_v2_1.ConfigManagerV2.getInstance().set('database.nonceDbPath', __classPrivateFieldGet(this, _OverrideConfigs_testNonceDbPath, "f"));
        config_manager_v2_1.ConfigManagerV2.getInstance().set('database.transactionDbPath', __classPrivateFieldGet(this, _OverrideConfigs_testTransactionDbPath, "f"));
    }
    resetConfigs() {
        config_manager_v2_1.ConfigManagerV2.getInstance().set('database.nonceDbPath', this.nonceDbPath);
        config_manager_v2_1.ConfigManagerV2.getInstance().set('database.transactionDbPath', this.transactionDbPath);
    }
}
exports.OverrideConfigs = OverrideConfigs;
_OverrideConfigs_testNonceDbPath = new WeakMap(), _OverrideConfigs_testTransactionDbPath = new WeakMap(), _OverrideConfigs_initialized = new WeakMap();
exports.DBPathOverride = new OverrideConfigs();
//# sourceMappingURL=config.util.js.map