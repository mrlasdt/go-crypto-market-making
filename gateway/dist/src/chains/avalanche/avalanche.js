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
exports.Avalanche = void 0;
const ethereum_abi_json_1 = __importDefault(require("../../services/ethereum.abi.json"));
const logger_1 = require("../../services/logger");
const ethers_1 = require("ethers");
const ethereum_base_1 = require("../../services/ethereum-base");
const ethereum_config_1 = require("../ethereum/ethereum.config");
const traderjoe_config_1 = require("../../connectors/traderjoe/traderjoe.config");
const pangolin_config_1 = require("../../connectors/pangolin/pangolin.config");
const openocean_config_1 = require("../../connectors/openocean/openocean.config");
const config_manager_v2_1 = require("../../services/config-manager-v2");
class Avalanche extends ethereum_base_1.EthereumBase {
    constructor(network) {
        const config = (0, ethereum_config_1.getEthereumConfig)('avalanche', network);
        super('avalanche', config.network.chainID, config.network.nodeURL, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath'), config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
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
        if (Avalanche._instances === undefined) {
            Avalanche._instances = {};
        }
        if (!(network in Avalanche._instances)) {
            Avalanche._instances[network] = new Avalanche(network);
        }
        return Avalanche._instances[network];
    }
    static getConnectedInstances() {
        return Avalanche._instances;
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
    getContract(tokenAddress, signerOrProvider) {
        return new ethers_1.Contract(tokenAddress, ethereum_abi_json_1.default.ERC20Abi, signerOrProvider);
    }
    getSpender(reqSpender) {
        let spender;
        if (reqSpender === 'pangolin') {
            spender = pangolin_config_1.PangolinConfig.config.routerAddress(this._chain);
        }
        else if (reqSpender === 'openocean') {
            spender = openocean_config_1.OpenoceanConfig.config.routerAddress(this._chain);
        }
        else if (reqSpender === 'traderjoe') {
            spender = traderjoe_config_1.TraderjoeConfig.config.routerAddress(this._chain);
        }
        else {
            spender = reqSpender;
        }
        return spender;
    }
    cancelTx(wallet, nonce) {
        const _super = Object.create(null, {
            cancelTxWithGasPrice: { get: () => super.cancelTxWithGasPrice }
        });
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Canceling any existing transaction(s) with nonce number ' + nonce + '.');
            return _super.cancelTxWithGasPrice.call(this, wallet, nonce, this._gasPrice * 2);
        });
    }
    updateGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._gasPriceRefreshInterval === null) {
                return;
            }
            const gasPrice = yield this.getGasPrice();
            if (gasPrice !== null) {
                this._gasPrice = gasPrice;
            }
            else {
                logger_1.logger.info('gasPrice is unexpectedly null.');
            }
            setTimeout(this.updateGasPrice.bind(this), this._gasPriceRefreshInterval * 1000);
        });
    }
    close() {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this);
            if (this._chain in Avalanche._instances) {
                delete Avalanche._instances[this._chain];
            }
        });
    }
}
exports.Avalanche = Avalanche;
//# sourceMappingURL=avalanche.js.map