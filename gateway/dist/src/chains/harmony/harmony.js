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
exports.Harmony = void 0;
const ethereum_abi_json_1 = __importDefault(require("../../services/ethereum.abi.json"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../services/logger");
const ethers_1 = require("ethers");
const ethereum_base_1 = require("../../services/ethereum-base");
const harmony_config_1 = require("./harmony.config");
const config_manager_v2_1 = require("../../services/config-manager-v2");
class Harmony extends ethereum_base_1.EthereumBase {
    constructor(network) {
        const config = (0, harmony_config_1.getHarmonyConfig)('harmony', network);
        super('harmony', config.network.chainID, config.network.nodeURL, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath'), config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
        this._chain = network;
        this._nativeTokenSymbol = config.nativeCurrencySymbol;
        this._gasPrice = config.manualGasPrice;
        this._gasPriceLastUpdated = null;
        this.updateGasPrice();
        this._requestCount = 0;
        this._metricsLogInterval = 300000;
        this.onDebugMessage(this.requestCounter.bind(this));
        setInterval(this.metricLogger.bind(this), this.metricsLogInterval);
    }
    static getInstance(network) {
        if (Harmony._instances === undefined) {
            Harmony._instances = {};
        }
        if (!(network in Harmony._instances)) {
            Harmony._instances[network] = new Harmony(network);
        }
        return Harmony._instances[network];
    }
    static getConnectedInstances() {
        return Harmony._instances;
    }
    requestCounter(msg) {
        if (msg.action === 'request')
            this._requestCount += 1;
    }
    metricLogger() {
        logger_1.logger.info(this.requestCount +
            ' request(s) sent in last ' +
            this.metricsLogInterval / 1000 +
            ' seconds.');
        this._requestCount = 0;
    }
    get gasPrice() {
        return this._gasPrice;
    }
    get chain() {
        return this._chain;
    }
    get nativeTokenSymbol() {
        return this._nativeTokenSymbol;
    }
    get gasPriceLastDated() {
        return this._gasPriceLastUpdated;
    }
    get requestCount() {
        return this._requestCount;
    }
    get metricsLogInterval() {
        return this._metricsLogInterval;
    }
    updateGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const harmonyConfig = (0, harmony_config_1.getHarmonyConfig)('harmony', this._chain);
            if (harmonyConfig.autoGasPrice) {
                const jsonData = JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'hmyv2_gasPrice',
                    params: [],
                });
                const config = {
                    method: 'post',
                    url: harmonyConfig.network.nodeURL,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: jsonData,
                };
                const { data } = yield (0, axios_1.default)(config);
                this._gasPrice = data['result'] / 1e9;
                this._gasPriceLastUpdated = new Date();
                setTimeout(this.updateGasPrice.bind(this), harmonyConfig.gasPricerefreshTime * 1000);
            }
        });
    }
    getContract(tokenAddress, signerOrProvider) {
        return new ethers_1.Contract(tokenAddress, ethereum_abi_json_1.default.ERC20Abi, signerOrProvider);
    }
    getSpender(reqSpender) {
        let spender;
        if (reqSpender === 'sushiswap') {
            spender = '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506';
        }
        else if (reqSpender === 'viperswap') {
            spender = '0xf012702a5f0e54015362cbca26a26fc90aa832a3';
        }
        else if (reqSpender === 'defikingdoms') {
            spender = '0x24ad62502d1C652Cc7684081169D04896aC20f30';
        }
        else if (reqSpender === 'defira') {
            spender = '0x3C8BF7e25EbfAaFb863256A4380A8a93490d8065';
        }
        else {
            spender = reqSpender;
        }
        return spender;
    }
    cancelTx(wallet, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Canceling any existing transaction(s) with nonce number ' + nonce + '.');
            return this.cancelTxWithGasPrice(wallet, nonce, this._gasPrice * 2);
        });
    }
    close() {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this);
            if (this._chain in Harmony._instances) {
                delete Harmony._instances[this._chain];
            }
        });
    }
}
exports.Harmony = Harmony;
//# sourceMappingURL=harmony.js.map