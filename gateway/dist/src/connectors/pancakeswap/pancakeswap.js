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
exports.PancakeSwap = void 0;
const sdk_1 = require("@pancakeswap/sdk");
const ethers_1 = require("ethers");
const binance_smart_chain_1 = require("../../chains/binance-smart-chain/binance-smart-chain");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const error_handler_1 = require("../../services/error-handler");
const logger_1 = require("../../services/logger");
const validators_1 = require("../../services/validators");
const pancakeswap_config_1 = require("./pancakeswap.config");
const pancakeswap_router_abi_json_1 = __importDefault(require("./pancakeswap_router_abi.json"));
class PancakeSwap {
    constructor(chain, network) {
        this.tokenList = {};
        this._ready = false;
        const config = pancakeswap_config_1.PancakeSwapConfig.config;
        this.bsc = binance_smart_chain_1.BinanceSmartChain.getInstance(network);
        this.chainId = this.bsc.chainId;
        this._chain = chain;
        this._router = config.routerAddress(network);
        this._ttl = config.ttl;
        this._routerAbi = pancakeswap_router_abi_json_1.default.abi;
        this._gasLimitEstimate = config.gasLimitEstimate;
    }
    static getInstance(chain, network) {
        if (PancakeSwap._instances === undefined) {
            PancakeSwap._instances = {};
        }
        if (!(chain + network in PancakeSwap._instances)) {
            PancakeSwap._instances[chain + network] = new PancakeSwap(chain, network);
        }
        return PancakeSwap._instances[chain + network];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._chain == 'binance-smart-chain' && !this.bsc.ready())
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('BinanceSmartChain'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            for (const token of this.bsc.storedTokenList) {
                this.tokenList[token.address] = new sdk_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
            }
            this._ready = true;
        });
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
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
        const allowedSlippage = pancakeswap_config_1.PancakeSwapConfig.config.allowedSlippage;
        const matches = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (matches)
            return new sdk_1.Percent(matches[1], matches[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            const pair = yield sdk_1.Fetcher.fetchPairData(quoteToken, baseToken, this.bsc.provider);
            const trades = sdk_1.Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ` +
                `${trades[0].executionPrice.invert().toFixed(6)} ` +
                `${baseToken.name}.`);
            const expectedAmount = trades[0].maximumAmountIn(this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield sdk_1.Fetcher.fetchPairData(baseToken, quoteToken, this.bsc.provider);
            const trades = sdk_1.Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, { maxHops: 1 });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            logger_1.logger.info(`Best trade for ${baseToken.address}-${quoteToken.address}: ` +
                `${trades[0].executionPrice.toFixed(6)}` +
                `${baseToken.name}.`);
            const expectedAmount = trades[0].minimumAmountOut(this.getAllowedSlippage(allowedSlippage));
            return { trade: trades[0], expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, pancakeswapRouter, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = sdk_1.Router.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getAllowedSlippage(allowedSlippage),
            });
            const contract = new ethers_1.Contract(pancakeswapRouter, abi, wallet);
            if (nonce === undefined) {
                nonce = yield this.bsc.nonceManager.getNextNonce(wallet.address);
            }
            let tx;
            if (maxFeePerGas || maxPriorityFeePerGas) {
                tx = yield contract[result.methodName](...result.args, {
                    gasLimit: gasLimit,
                    value: result.value,
                    nonce: nonce,
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                });
            }
            else {
                tx = yield contract[result.methodName](...result.args, {
                    gasPrice: (gasPrice * 1e9).toFixed(0),
                    gasLimit: gasLimit.toFixed(0),
                    value: result.value,
                    nonce: nonce,
                });
            }
            logger_1.logger.info(`Transaction Details: ${JSON.stringify(tx)}`);
            yield this.bsc.nonceManager.commitNonce(wallet.address, nonce);
            return tx;
        });
    }
}
exports.PancakeSwap = PancakeSwap;
//# sourceMappingURL=pancakeswap.js.map