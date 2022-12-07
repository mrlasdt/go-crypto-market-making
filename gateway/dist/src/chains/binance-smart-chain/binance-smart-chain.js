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
exports.BinanceSmartChain = void 0;
const ethereum_abi_json_1 = __importDefault(require("../../services/ethereum.abi.json"));
const logger_1 = require("../../services/logger");
const ethers_1 = require("ethers");
const ethereum_base_1 = require("../../services/ethereum-base");
const ethereum_config_1 = require("../ethereum/ethereum.config");
const pancakeswap_config_1 = require("../../connectors/pancakeswap/pancakeswap.config");
const sushiswap_config_1 = require("../../connectors/sushiswap/sushiswap.config");
const config_manager_v2_1 = require("../../services/config-manager-v2");
class BinanceSmartChain extends ethereum_base_1.EthereumBase {
    constructor(network) {
        const config = (0, ethereum_config_1.getEthereumConfig)('binance-smart-chain', network);
        super('binance-smart-chain', config.network.chainID, config.network.nodeURL, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath'), config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
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
        if (BinanceSmartChain._instances === undefined) {
            BinanceSmartChain._instances = {};
        }
        if (!(network in BinanceSmartChain._instances)) {
            BinanceSmartChain._instances[network] = new BinanceSmartChain(network);
        }
        return BinanceSmartChain._instances[network];
    }
    static getConnectedInstances() {
        return BinanceSmartChain._instances;
    }
    updateGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._gasPriceRefreshInterval === null) {
                return;
            }
            const gasPrice = (yield this.provider.getGasPrice()).toNumber();
            this._gasPrice = gasPrice * 1e-9;
            setTimeout(this.updateGasPrice.bind(this), this._gasPriceRefreshInterval * 1000);
        });
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
        if (reqSpender === 'pancakeswap') {
            spender = pancakeswap_config_1.PancakeSwapConfig.config.routerAddress(this._chain);
        }
        else if (reqSpender === 'sushiswap') {
            spender = sushiswap_config_1.SushiswapConfig.config.sushiswapRouterAddress(this.chainName, this._chain);
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
}
exports.BinanceSmartChain = BinanceSmartChain;
//# sourceMappingURL=binance-smart-chain.js.map