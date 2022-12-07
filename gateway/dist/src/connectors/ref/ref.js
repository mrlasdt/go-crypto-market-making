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
exports.Ref = void 0;
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const ref_config_1 = require("./ref.config");
const coinalpha_ref_sdk_1 = require("coinalpha-ref-sdk");
const logger_1 = require("../../services/logger");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const near_1 = require("../../chains/near/near");
const ref_helper_1 = require("./ref.helper");
class Ref {
    constructor(network) {
        this.tokenList = {};
        this._ready = false;
        this._cachedPools = [];
        const config = ref_config_1.RefConfig.config;
        this.near = near_1.Near.getInstance(network);
        this._ttl = ref_config_1.RefConfig.config.ttl;
        this._gasLimitEstimate = ref_config_1.RefConfig.config.gasLimitEstimate;
        this._router = config.routerAddress(network);
    }
    static getInstance(chain, network) {
        if (Ref._instances === undefined) {
            Ref._instances = {};
        }
        if (!(chain + network in Ref._instances)) {
            Ref._instances[chain + network] = new Ref(network);
        }
        return Ref._instances[chain + network];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.near.ready()) {
                yield this.near.init();
            }
            for (const token of this.near.storedTokenList) {
                this.tokenList[token.address] = {
                    id: token.address,
                    decimals: token.decimals,
                    symbol: token.symbol,
                    name: token.name,
                    icon: '',
                };
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
    get gasLimitEstimate() {
        return this._gasLimitEstimate;
    }
    get ttl() {
        return this._ttl;
    }
    getAllowedSlippage(allowedSlippageStr) {
        if (allowedSlippageStr != null && (0, validators_1.isFractionString)(allowedSlippageStr)) {
            const fractionSplit = allowedSlippageStr.split('/');
            return Number(fractionSplit[0]) / Number(fractionSplit[1]);
        }
        const allowedSlippage = ref_config_1.RefConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return Number(nd[1]) / Number(nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    parseTrade(trades, side) {
        var _a;
        const paths = {};
        for (const trade of trades) {
            if (trade.nodeRoute) {
                if (!paths[trade.nodeRoute.join()])
                    paths[trade.nodeRoute.join()] = {
                        inputAmount: '0',
                        outputAmount: '0',
                    };
                if (trade.inputToken === trade.nodeRoute[0]) {
                    const token = ((_a = trade.tokens) === null || _a === void 0 ? void 0 : _a.filter((t) => t.id === trade.inputToken));
                    paths[trade.nodeRoute.join()].inputAmount = (0, coinalpha_ref_sdk_1.toReadableNumber)(token[0].decimals, trade.pool.partialAmountIn);
                }
                else if (trade.outputToken === trade.nodeRoute[trade.nodeRoute.length - 1]) {
                    paths[trade.nodeRoute.join()].outputAmount = trade.estimate;
                }
            }
        }
        let expectedAmount = 0, amountIn = 0;
        Object.values(paths).forEach((entries) => {
            expectedAmount += Number(entries.outputAmount);
            amountIn += Number(entries.inputAmount);
        });
        return {
            estimatedPrice: side.toUpperCase() === 'BUY'
                ? String(amountIn / expectedAmount)
                : String(expectedAmount / amountIn),
            expectedAmount: String(expectedAmount),
        };
    }
    estimateSellTrade(baseToken, quoteToken, amount, _allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`Fetching pair data for ${baseToken.id}-${quoteToken.id}.`);
            const { simplePools } = yield (0, coinalpha_ref_sdk_1.fetchAllPools)();
            this._cachedPools = simplePools;
            const options = {
                enableSmartRouting: true,
            };
            const trades = yield (0, coinalpha_ref_sdk_1.estimateSwap)({
                tokenIn: baseToken,
                tokenOut: quoteToken,
                amountIn: amount,
                simplePools,
                options,
            });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            const { estimatedPrice, expectedAmount } = this.parseTrade(trades, 'SELL');
            logger_1.logger.info(`Best trade for ${baseToken.id}-${quoteToken.id}: ` +
                `${estimatedPrice}` +
                `${baseToken.name}.`);
            return { trade: trades, expectedAmount };
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount, _allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const buyEstimate = yield this.estimateSellTrade(baseToken, quoteToken, amount);
            const options = {
                enableSmartRouting: true,
            };
            const trades = yield (0, coinalpha_ref_sdk_1.estimateSwap)({
                tokenIn: quoteToken,
                tokenOut: baseToken,
                amountIn: buyEstimate.expectedAmount,
                simplePools: this._cachedPools,
                options,
            });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.id} to ${baseToken.id}.`);
            }
            const { estimatedPrice, expectedAmount } = this.parseTrade(trades, 'BUY');
            logger_1.logger.info(`Best trade for ${quoteToken.id}-${baseToken.id}: ` +
                `${estimatedPrice} ` +
                `${baseToken.name}.`);
            return { trade: trades, expectedAmount };
        });
    }
    executeTrade(account, trade, amountIn, tokenIn, tokenOut, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionsRef = yield (0, coinalpha_ref_sdk_1.instantSwap)({
                tokenIn,
                tokenOut,
                amountIn,
                slippageTolerance: this.getAllowedSlippage(allowedSlippage),
                swapTodos: trade,
                AccountId: account.accountId,
            });
            const signedTransactions = yield (0, ref_helper_1.getSignedTransactions)({ transactionsRef, account });
            const transaction = yield (0, ref_helper_1.sendTransactions)({
                signedTransactions,
                provider: account.connection.provider,
            });
            logger_1.logger.info(JSON.stringify(transaction));
            return transaction[0];
        });
    }
}
exports.Ref = Ref;
//# sourceMappingURL=ref.js.map