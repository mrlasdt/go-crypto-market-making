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
exports.Quickswap = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
const error_handler_1 = require("../../services/error-handler");
const ethers_1 = require("ethers");
const validators_1 = require("../../services/validators");
const quickswap_config_1 = require("./quickswap.config");
const IJoeRouter02_json_1 = __importDefault(require("../traderjoe/IJoeRouter02.json"));
const quickswap_sdk_1 = require("quickswap-sdk");
const logger_1 = require("../../services/logger");
const polygon_1 = require("../../chains/polygon/polygon");
class Quickswap {
    constructor(network) {
        this.tokenList = {};
        this._ready = false;
        const config = quickswap_config_1.QuickswapConfig.config;
        this.polygon = polygon_1.Polygon.getInstance(network);
        this.chainId = this.polygon.chainId;
        this._router = config.routerAddress(network);
        this._ttl = config.ttl;
        this._routerAbi = IJoeRouter02_json_1.default.abi;
        this._gasLimitEstimate = config.gasLimitEstimate;
    }
    static getInstance(chain, network) {
        if (Quickswap._instances === undefined) {
            Quickswap._instances = {};
        }
        if (!(chain + network in Quickswap._instances)) {
            Quickswap._instances[chain + network] = new Quickswap(network);
        }
        return Quickswap._instances[chain + network];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.polygon.ready()) {
                yield this.polygon.init();
            }
            for (const token of this.polygon.storedTokenList) {
                this.tokenList[token.address] = new quickswap_sdk_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
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
    getAllowedSlippage(allowedSlippageStr) {
        if (allowedSlippageStr != null && (0, validators_1.isFractionString)(allowedSlippageStr)) {
            const fractionSplit = allowedSlippageStr.split('/');
            return new quickswap_sdk_1.Percent(fractionSplit[0], fractionSplit[1]);
        }
        const allowedSlippage = quickswap_config_1.QuickswapConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new quickswap_sdk_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new quickswap_sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield quickswap_sdk_1.Fetcher.fetchPairData(baseToken, quoteToken, this.polygon.provider);
            const trades = quickswap_sdk_1.Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            logger_1.logger.info(`Best trade for ${baseToken.address}-${quoteToken.address}: ${trades[0]}`);
            const expectedAmount = trades[0].minimumAmountOut(this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new quickswap_sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            const pair = yield quickswap_sdk_1.Fetcher.fetchPairData(quoteToken, baseToken, this.polygon.provider);
            const trades = quickswap_sdk_1.Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ${trades[0]}`);
            const expectedAmount = trades[0].maximumAmountIn(this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, quickswapRouter, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = quickswap_sdk_1.Router.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getAllowedSlippage(allowedSlippage),
            });
            const contract = new ethers_1.Contract(quickswapRouter, abi, wallet);
            return this.polygon.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                let tx;
                if (maxFeePerGas || maxPriorityFeePerGas) {
                    tx = yield contract[result.methodName](...result.args, {
                        gasLimit: gasLimit.toFixed(0),
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
                logger_1.logger.info(JSON.stringify(tx));
                return tx;
            }));
        });
    }
}
exports.Quickswap = Quickswap;
//# sourceMappingURL=quickswap.js.map