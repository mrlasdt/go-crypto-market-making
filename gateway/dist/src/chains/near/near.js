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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Near = void 0;
const near_api_js_1 = require("near-api-js");
const near_abi_json_1 = __importDefault(require("./near.abi.json"));
const logger_1 = require("../../services/logger");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const near_base_1 = require("./near.base");
const near_config_1 = require("./near.config");
class Near extends near_base_1.NearBase {
    constructor(network) {
        const config = (0, near_config_1.getNearConfig)('near', network);
        super('near', config.network.nodeURL, network, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
        this._chain = config.network.name;
        this._nativeTokenSymbol = config.nativeCurrencySymbol;
        this._gasPrice = config.manualGasPrice;
        this._gasPriceRefreshInterval =
            config.network.gasPriceRefreshInterval !== undefined
                ? config.network.gasPriceRefreshInterval
                : null;
        this.updateGasPrice();
    }
    static getInstance(network) {
        if (Near._instances === undefined) {
            Near._instances = {};
        }
        if (!(network in Near._instances)) {
            Near._instances[network] = new Near(network);
        }
        return Near._instances[network];
    }
    static getConnectedInstances() {
        return Near._instances;
    }
    get gasPrice() {
        return this._gasPrice;
    }
    get nativeTokenSymbol() {
        return this._nativeTokenSymbol;
    }
    get chain() {
        return this._chain;
    }
    getContract(tokenAddress, account) {
        return new near_api_js_1.Contract(account, tokenAddress, near_abi_json_1.default);
    }
    getSpender(reqSpender) {
        return reqSpender;
    }
    updateGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._gasPriceRefreshInterval === null) {
                return;
            }
            const gasPrice = yield this.getGasPrice();
            if (gasPrice !== null) {
                this._gasPrice = Number(gasPrice);
            }
            else {
                logger_1.logger.info('gasPrice is unexpectedly null.');
            }
            setTimeout(this.updateGasPrice.bind(this), this._gasPriceRefreshInterval * 1000);
        });
    }
    cancelTx(account, nonce) {
        const _super = Object.create(null, {
            cancelTx: { get: () => super.cancelTx }
        });
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Canceling any existing transaction(s) with nonce number ' + nonce + '.');
            return _super.cancelTx.call(this, account, nonce);
        });
    }
}
exports.Near = Near;
//# sourceMappingURL=near.js.map