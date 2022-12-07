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
exports.Defikingdoms = void 0;
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const defikingdoms_config_1 = require("./defikingdoms.config");
const defikingdoms_router_abi_json_1 = __importDefault(require("./defikingdoms_router_abi.json"));
const contracts_1 = require("@ethersproject/contracts");
const defikingdoms_sdk_1 = require("@switchboard-xyz/defikingdoms-sdk");
const logger_1 = require("../../services/logger");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const harmony_1 = require("../../chains/harmony/harmony");
class Defikingdoms {
    constructor(network) {
        this.tokenList = {};
        this._ready = false;
        const config = defikingdoms_config_1.DefikingdomsConfig.config;
        this.harmony = harmony_1.Harmony.getInstance(network);
        this.chainId = this.harmony.chainId;
        this._ttl = defikingdoms_config_1.DefikingdomsConfig.config.ttl;
        this._routerAbi = defikingdoms_router_abi_json_1.default.abi;
        this._gasLimitEstimate = defikingdoms_config_1.DefikingdomsConfig.config.gasLimit;
        this._router = config.routerAddress(network);
    }
    static getInstance(chain, network) {
        if (Defikingdoms._instances === undefined) {
            Defikingdoms._instances = {};
        }
        if (!(chain + network in Defikingdoms._instances)) {
            Defikingdoms._instances[chain + network] = new Defikingdoms(network);
        }
        return Defikingdoms._instances[chain + network];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.harmony.ready()) {
                yield this.harmony.init();
            }
            for (const token of this.harmony.storedTokenList) {
                this.tokenList[token.address] = new defikingdoms_sdk_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
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
            return new defikingdoms_sdk_1.Percent(fractionSplit[0], fractionSplit[1]);
        }
        const allowedSlippage = defikingdoms_config_1.DefikingdomsConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new defikingdoms_sdk_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new defikingdoms_sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield this.fetchPairData(baseToken, quoteToken);
            const trades = defikingdoms_sdk_1.Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, { maxHops: 1 });
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
    estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = new defikingdoms_sdk_1.TokenAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            logger_1.logger.info(JSON.stringify({ quoteToken, baseToken, provider: this.harmony.provider }));
            const pair = yield this.fetchPairData(quoteToken, baseToken);
            const trades = defikingdoms_sdk_1.Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, { maxHops: 1 });
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
    executeTrade(wallet, trade, gasPrice, defikingdomsRouter, ttl, abi, gasLimit, nonce, _1, _2, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = defikingdoms_sdk_1.Router.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getAllowedSlippage(allowedSlippage),
            });
            const contract = new contracts_1.Contract(defikingdomsRouter, abi, wallet);
            return this.harmony.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                const tx = yield contract[result.methodName](...result.args, {
                    gasPrice: (gasPrice * 1e9).toFixed(0),
                    gasLimit: gasLimit.toFixed(0),
                    value: result.value,
                    nonce: nextNonce,
                });
                logger_1.logger.info(JSON.stringify(tx));
                return tx;
            }));
        });
    }
    fetchPairData(tokenA, tokenB) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield defikingdoms_sdk_1.Fetcher.fetchPairData(tokenA, tokenB, this.harmony.provider);
        });
    }
}
exports.Defikingdoms = Defikingdoms;
//# sourceMappingURL=defikingdoms.js.map