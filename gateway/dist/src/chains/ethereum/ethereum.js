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
exports.Ethereum = void 0;
const ethereum_abi_json_1 = __importDefault(require("../../services/ethereum.abi.json"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../services/logger");
const ethers_1 = require("ethers");
const ethereum_base_1 = require("../../services/ethereum-base");
const ethereum_config_1 = require("./ethereum.config");
const uniswap_config_1 = require("../../connectors/uniswap/uniswap.config");
const perp_1 = require("../../connectors/perp/perp");
const sushiswap_config_1 = require("../../connectors/sushiswap/sushiswap.config");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const MKR_ADDRESS = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';
class Ethereum extends ethereum_base_1.EthereumBase {
    constructor(network) {
        const config = (0, ethereum_config_1.getEthereumConfig)('ethereum', network);
        super('ethereum', config.network.chainID, config.network.nodeURL, config.network.tokenListSource, config.network.tokenListType, config.manualGasPrice, config.gasLimitTransaction, config_manager_v2_1.ConfigManagerV2.getInstance().get('database.nonceDbPath'), config_manager_v2_1.ConfigManagerV2.getInstance().get('database.transactionDbPath'));
        this._chain = network;
        this._nativeTokenSymbol = config.nativeCurrencySymbol;
        this._ethGasStationUrl =
            ethereum_config_1.EthereumConfig.ethGasStationConfig.gasStationURL +
                ethereum_config_1.EthereumConfig.ethGasStationConfig.APIKey;
        this._gasPrice = config.manualGasPrice;
        this._gasPriceRefreshInterval =
            config.network.gasPriceRefreshInterval !== undefined
                ? config.network.gasPriceRefreshInterval
                : null;
        this.updateGasPrice();
        this._requestCount = 0;
        this._metricsLogInterval = 300000;
        this.onDebugMessage(this.requestCounter.bind(this));
        setInterval(this.metricLogger.bind(this), this.metricsLogInterval);
    }
    static getInstance(network) {
        if (Ethereum._instances === undefined) {
            Ethereum._instances = {};
        }
        if (!(network in Ethereum._instances)) {
            Ethereum._instances[network] = new Ethereum(network);
        }
        return Ethereum._instances[network];
    }
    static getConnectedInstances() {
        return Ethereum._instances;
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
    get requestCount() {
        return this._requestCount;
    }
    get metricsLogInterval() {
        return this._metricsLogInterval;
    }
    updateGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._gasPriceRefreshInterval === null) {
                return;
            }
            if (ethereum_config_1.EthereumConfig.ethGasStationConfig.enabled &&
                this._chain === 'mainnet') {
                const { data } = yield axios_1.default.get(this._ethGasStationUrl);
                this._gasPrice = data[ethereum_config_1.EthereumConfig.ethGasStationConfig.gasLevel] / 10;
            }
            else {
                const gasPrice = yield this.getGasPriceFromEthereumNode();
                if (gasPrice !== null) {
                    this._gasPrice = gasPrice;
                }
                else {
                    logger_1.logger.info('gasPrice is unexpectedly null.');
                }
            }
            setTimeout(this.updateGasPrice.bind(this), this._gasPriceRefreshInterval * 1000);
        });
    }
    getGasPriceFromEthereumNode() {
        return __awaiter(this, void 0, void 0, function* () {
            const baseFee = yield this.provider.getGasPrice();
            let priorityFee = ethers_1.BigNumber.from('0');
            if (this._chain === 'mainnet') {
                priorityFee = ethers_1.BigNumber.from(yield this.provider.send('eth_maxPriorityFeePerGas', []));
            }
            return baseFee.add(priorityFee).toNumber() * 1e-9;
        });
    }
    getContract(tokenAddress, signerOrProvider) {
        return tokenAddress === MKR_ADDRESS
            ? new ethers_1.Contract(tokenAddress, ethereum_abi_json_1.default.MKRAbi, signerOrProvider)
            : new ethers_1.Contract(tokenAddress, ethereum_abi_json_1.default.ERC20Abi, signerOrProvider);
    }
    getSpender(reqSpender) {
        let spender;
        if (reqSpender === 'uniswap') {
            spender = uniswap_config_1.UniswapConfig.config.uniswapV3SmartOrderRouterAddress(this._chain);
        }
        else if (reqSpender === 'sushiswap') {
            spender = sushiswap_config_1.SushiswapConfig.config.sushiswapRouterAddress(this.chainName, this._chain);
        }
        else if (reqSpender === 'uniswapLP') {
            spender = uniswap_config_1.UniswapConfig.config.uniswapV3NftManagerAddress(this._chain);
        }
        else if (reqSpender === 'perp') {
            const perp = perp_1.Perp.getInstance(this._chain, 'optimism');
            if (!perp.ready()) {
                perp.init();
                throw Error('Perp curie not ready');
            }
            spender = perp.perp.contracts.vault.address;
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
            if (this._chain in Ethereum._instances) {
                delete Ethereum._instances[this._chain];
            }
        });
    }
}
exports.Ethereum = Ethereum;
//# sourceMappingURL=ethereum.js.map