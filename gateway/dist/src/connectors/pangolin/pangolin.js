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
exports.Pangolin = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
const error_handler_1 = require("../../services/error-handler");
const ethers_1 = require("ethers");
const validators_1 = require("../../services/validators");
const pangolin_config_1 = require("./pangolin.config");
const IPangolinRouter_json_1 = __importDefault(require("./IPangolinRouter.json"));
const sdk_1 = require("@pangolindex/sdk");
const logger_1 = require("../../services/logger");
const avalanche_1 = require("../../chains/avalanche/avalanche");
class Pangolin {
    constructor(network) {
        this.tokenList = {};
        this._ready = false;
        const config = pangolin_config_1.PangolinConfig.config;
        this.avalanche = avalanche_1.Avalanche.getInstance(network);
        this.chainId = this.avalanche.chainId;
        this._router = config.routerAddress(network);
        this._ttl = config.ttl;
        this._routerAbi = IPangolinRouter_json_1.default.abi;
        this._gasLimitEstimate = config.gasLimitEstimate;
    }
    static getInstance(chain, network) {
        if (Pangolin._instances === undefined) {
            Pangolin._instances = {};
        }
        if (!(chain + network in Pangolin._instances)) {
            Pangolin._instances[chain + network] = new Pangolin(network);
        }
        return Pangolin._instances[chain + network];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.avalanche.ready()) {
                yield this.avalanche.init();
            }
            for (const token of this.avalanche.storedTokenList) {
                this.tokenList[token.address] = new sdk_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
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
            return new sdk_1.Percent(fractionSplit[0], fractionSplit[1]);
        }
        const allowedSlippage = pangolin_config_1.PangolinConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new sdk_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield sdk_1.Fetcher.fetchPairData(baseToken, quoteToken, this.avalanche.provider);
            const trades = sdk_1.Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, { maxHops: 1 });
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
            const nativeTokenAmount = new sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            const pair = yield sdk_1.Fetcher.fetchPairData(quoteToken, baseToken, this.avalanche.provider);
            const trades = sdk_1.Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ${trades[0]}`);
            const expectedAmount = trades[0].maximumAmountIn(this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, pangolinRouter, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = sdk_1.Router.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getAllowedSlippage(allowedSlippage),
            });
            const contract = new ethers_1.Contract(pangolinRouter, abi, wallet);
            return this.avalanche.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
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
                logger_1.logger.info(JSON.stringify(tx));
                return tx;
            }));
        });
    }
}
exports.Pangolin = Pangolin;
//# sourceMappingURL=pangolin.js.map