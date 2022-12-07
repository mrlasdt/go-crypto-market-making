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
exports.Polygon = void 0;
const ethereum_abi_json_1 = __importDefault(require("../../services/ethereum.abi.json"));
const logger_1 = require("../../services/logger");
const ethers_1 = require("ethers");
const ethereum_base_1 = require("../../services/ethereum-base");
const ethereum_config_1 = require("../ethereum/ethereum.config");
const quickswap_config_1 = require("../../connectors/quickswap/quickswap.config");
const uniswap_config_1 = require("../../connectors/uniswap/uniswap.config");
const config_manager_v2_1 = require("../../services/config-manager-v2");
class Polygon extends ethereum_base_1.EthereumBase {
    constructor(network) {
        const config = (0, ethereum_config_1.getEthereumConfig)('polygon', network);
        super('polygon', config.network.chainID, config.network.nodeURL, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath'), config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
        this._chain = config.network.name;
        this._nativeTokenSymbol = config.nativeCurrencySymbol;
        this._gasPrice = config.manualGasPrice;
    }
    static getInstance(network) {
        if (Polygon._instances === undefined) {
            Polygon._instances = {};
        }
        if (!(network in Polygon._instances)) {
            Polygon._instances[network] = new Polygon(network);
        }
        return Polygon._instances[network];
    }
    static getConnectedInstances() {
        return Polygon._instances;
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
        if (reqSpender === 'uniswap') {
            spender = uniswap_config_1.UniswapConfig.config.uniswapV3SmartOrderRouterAddress(this._chain);
        }
        else if (reqSpender === 'uniswapLP') {
            spender = uniswap_config_1.UniswapConfig.config.uniswapV3NftManagerAddress(this._chain);
        }
        else if (reqSpender === 'quickswap') {
            spender = quickswap_config_1.QuickswapConfig.config.routerAddress(this._chain);
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
exports.Polygon = Polygon;
//# sourceMappingURL=polygon.js.map