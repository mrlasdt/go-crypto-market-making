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
exports.CronosBaseUniswapishConnector = void 0;
const ethers_1 = require("ethers");
const cronos_1 = require("../../chains/cronos/cronos");
const logger_1 = require("../../services/logger");
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const config_manager_v2_1 = require("../../services/config-manager-v2");
class CronosBaseUniswapishConnector {
    constructor(_sdkProvider, _routerAbi, chain, network) {
        this._sdkProvider = _sdkProvider;
        this._routerAbi = _routerAbi;
        this._tokenList = {};
        this._ready = false;
        this._config = this.buildConfig();
        this._cronos = cronos_1.Cronos.getInstance(network);
        this._chainId = this._cronos.chainId;
        this._chain = chain;
        this._router = this._config.routerAddress(network);
        this._ttl = this._config.ttl;
        this._gasLimitEstimate = this._config.gasLimitEstimate;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._chain == 'cronos' && !this._cronos.ready())
                throw new Error('Cronos is not available');
            for (const token of this._cronos.storedTokenList) {
                this._tokenList[token.address] = this._sdkProvider.buildToken(this._chainId, token.address, token.decimals, token.symbol, token.name);
            }
            this._ready = true;
        });
    }
    ready() {
        return this._ready;
    }
    get router() {
        return this._router;
    }
    get routerAbi() {
        return this._routerAbi;
    }
    get gasLimitEstimate() {
        return this._gasLimitEstimate;
    }
    get ttl() {
        return this._ttl;
    }
    getTokenByAddress(address) {
        return this._tokenList[address];
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = this._sdkProvider.buildTokenAmount(baseToken, amount);
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield this._sdkProvider.fetchPairData(baseToken, quoteToken, this._cronos.provider);
            const trades = this._sdkProvider.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            logger_1.logger.info(`Best trade for ${baseToken.address}-${quoteToken.address}: ${trades[0]}`);
            const expectedAmount = this._sdkProvider.minimumAmountOut(trades[0], this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = this._sdkProvider.buildTokenAmount(baseToken, amount);
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            const pair = yield this._sdkProvider.fetchPairData(quoteToken, baseToken, this._cronos.provider);
            const trades = this._sdkProvider.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ${trades[0]}`);
            const expectedAmount = this._sdkProvider.maximumAmountIn(trades[0], this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, CronosBaseUniswapishConnectorRoute, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this._sdkProvider.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getAllowedSlippage(allowedSlippage),
            });
            const contract = new ethers_1.Contract(CronosBaseUniswapishConnectorRoute, abi, wallet);
            return this._cronos.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                let tx;
                if (maxFeePerGas || maxPriorityFeePerGas) {
                    tx = yield contract[result.methodName](...result.args, {
                        gasLimit: gasLimit,
                        value: result.value,
                        nonce: nextNonce,
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    });
                }
                else {
                    tx = yield contract[result.methodName](...result.args, {
                        gasPrice: (gasPrice * 1e9).toFixed(0),
                        gasLimit: gasLimit.toFixed(0),
                        value: result.value,
                        nonce: nextNonce,
                    });
                }
                logger_1.logger.info(`Transaction Details: ${JSON.stringify(tx)}`);
                return tx;
            }));
        });
    }
    getAllowedSlippage(allowedSlippageStr) {
        if (allowedSlippageStr != null && (0, validators_1.isFractionString)(allowedSlippageStr)) {
            const fractionSplit = allowedSlippageStr.split('/');
            return this._sdkProvider.buildPercent(fractionSplit[0], fractionSplit[1]);
        }
        const allowedSlippage = this._config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return this._sdkProvider.buildPercent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    static getInstance(chain, network) {
        if (CronosBaseUniswapishConnector._instances == undefined) {
            CronosBaseUniswapishConnector._instances = {};
        }
        const instanceName = chain + network + this.name;
        if (!(instanceName in CronosBaseUniswapishConnector._instances)) {
            CronosBaseUniswapishConnector._instances[instanceName] = new this(chain, network);
        }
        return CronosBaseUniswapishConnector._instances[instanceName];
    }
}
exports.CronosBaseUniswapishConnector = CronosBaseUniswapishConnector;
//# sourceMappingURL=cronos-base-uniswapish-connector.js.map