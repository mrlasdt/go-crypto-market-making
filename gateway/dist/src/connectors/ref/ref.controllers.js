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
exports.estimateGas = exports.getFullTokenFromSymbol = exports.trade = exports.price = exports.getTradeInfo = void 0;
const decimal_js_light_1 = __importDefault(require("decimal.js-light"));
const error_handler_1 = require("../../services/error-handler");
const base_1 = require("../../services/base");
const logger_1 = require("../../services/logger");
function getTradeInfo(nearish, refAMMish, baseAsset, quoteAsset, amount, tradeSide, allowedSlippage) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseToken = getFullTokenFromSymbol(nearish, refAMMish, baseAsset);
        const quoteToken = getFullTokenFromSymbol(nearish, refAMMish, quoteAsset);
        let expectedTrade;
        if (tradeSide === 'BUY') {
            expectedTrade = yield refAMMish.estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage);
        }
        else {
            expectedTrade = yield refAMMish.estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage);
        }
        return {
            baseToken,
            quoteToken,
            requestAmount: amount,
            expectedTrade: expectedTrade.trade,
        };
    });
}
exports.getTradeInfo = getTradeInfo;
function price(nearish, refAMMish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        let tradeInfo;
        try {
            tradeInfo = yield getTradeInfo(nearish, refAMMish, req.base, req.quote, req.amount, req.side, req.allowedSlippage);
        }
        catch (e) {
            if (e instanceof Error) {
                throw new error_handler_1.HttpException(500, error_handler_1.PRICE_FAILED_ERROR_MESSAGE + e.message, error_handler_1.PRICE_FAILED_ERROR_CODE);
            }
            else {
                throw new error_handler_1.HttpException(500, error_handler_1.UNKNOWN_ERROR_MESSAGE, error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
            }
        }
        const { estimatedPrice, expectedAmount } = refAMMish.parseTrade(tradeInfo.expectedTrade, req.side);
        const gasLimitTransaction = nearish.gasLimitTransaction;
        const gasPrice = nearish.gasPrice;
        const gasLimitEstimate = refAMMish.gasLimitEstimate;
        return {
            network: nearish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            base: tradeInfo.baseToken.id,
            quote: tradeInfo.quoteToken.id,
            amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
            rawAmount: tradeInfo.requestAmount.toString(),
            expectedAmount: expectedAmount,
            price: estimatedPrice,
            gasPrice: gasPrice,
            gasPriceToken: nearish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: String((gasPrice * gasLimitEstimate) / 1e24),
        };
    });
}
exports.price = price;
function trade(nearish, refAMMish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const limitPrice = req.limitPrice;
        const account = yield nearish.getWallet(req.address);
        let tradeInfo;
        try {
            tradeInfo = yield getTradeInfo(nearish, refAMMish, req.base, req.quote, req.amount, req.side);
        }
        catch (e) {
            if (e instanceof Error) {
                logger_1.logger.error(`Could not get trade info. ${e.message}`);
                throw new error_handler_1.HttpException(500, error_handler_1.TRADE_FAILED_ERROR_MESSAGE + e.message, error_handler_1.TRADE_FAILED_ERROR_CODE);
            }
            else {
                logger_1.logger.error('Unknown error trying to get trade info.');
                throw new error_handler_1.HttpException(500, error_handler_1.UNKNOWN_ERROR_MESSAGE, error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
            }
        }
        const gasPrice = nearish.gasPrice;
        const gasLimitTransaction = nearish.gasLimitTransaction;
        const gasLimitEstimate = refAMMish.gasLimitEstimate;
        const { estimatedPrice, expectedAmount } = refAMMish.parseTrade(tradeInfo.expectedTrade, req.side);
        logger_1.logger.info(`Expected execution price is ${estimatedPrice}, ` +
            `limit price is ${limitPrice}.`);
        if (req.side === 'BUY') {
            if (limitPrice && new decimal_js_light_1.default(estimatedPrice).gt(new decimal_js_light_1.default(limitPrice))) {
                logger_1.logger.error('Swap price exceeded limit price.');
                throw new error_handler_1.HttpException(500, (0, error_handler_1.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE)(estimatedPrice, limitPrice), error_handler_1.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE);
            }
            const amountIn = new decimal_js_light_1.default(req.amount)
                .mul(new decimal_js_light_1.default(estimatedPrice))
                .toString();
            const tx = yield refAMMish.executeTrade(account, tradeInfo.expectedTrade, amountIn, tradeInfo.quoteToken, tradeInfo.baseToken, req.allowedSlippage);
            logger_1.logger.info(`Buy Ref swap has been executed.`);
            return {
                network: nearish.chain,
                timestamp: startTimestamp,
                latency: (0, base_1.latency)(startTimestamp, Date.now()),
                base: tradeInfo.baseToken.id,
                quote: tradeInfo.quoteToken.id,
                amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
                rawAmount: tradeInfo.requestAmount.toString(),
                expectedIn: expectedAmount,
                price: estimatedPrice,
                gasPrice: gasPrice,
                gasPriceToken: nearish.nativeTokenSymbol,
                gasLimit: gasLimitTransaction,
                gasCost: String((gasPrice * gasLimitEstimate) / 1e24),
                txHash: tx,
            };
        }
        else {
            if (limitPrice && new decimal_js_light_1.default(estimatedPrice).lt(new decimal_js_light_1.default(limitPrice))) {
                logger_1.logger.error('Swap price lower than limit price.');
                throw new error_handler_1.HttpException(500, (0, error_handler_1.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE)(estimatedPrice, limitPrice), error_handler_1.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_CODE);
            }
            const tx = yield refAMMish.executeTrade(account, tradeInfo.expectedTrade, req.amount, tradeInfo.baseToken, tradeInfo.quoteToken, req.allowedSlippage);
            logger_1.logger.info(`Sell Ref swap has been executed.`);
            return {
                network: nearish.chain,
                timestamp: startTimestamp,
                latency: (0, base_1.latency)(startTimestamp, Date.now()),
                base: tradeInfo.baseToken.id,
                quote: tradeInfo.quoteToken.id,
                amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
                rawAmount: tradeInfo.requestAmount.toString(),
                expectedOut: expectedAmount,
                price: estimatedPrice,
                gasPrice: gasPrice,
                gasPriceToken: nearish.nativeTokenSymbol,
                gasLimit: gasLimitTransaction,
                gasCost: String((gasPrice * gasLimitEstimate) / 1e24),
                txHash: tx,
            };
        }
    });
}
exports.trade = trade;
function getFullTokenFromSymbol(nearish, refAMMish, tokenSymbol) {
    const tokenInfo = nearish.getTokenBySymbol(tokenSymbol);
    let fullToken;
    if (tokenInfo) {
        fullToken = refAMMish.getTokenByAddress(tokenInfo.address);
    }
    if (!fullToken)
        throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + tokenSymbol, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
    return fullToken;
}
exports.getFullTokenFromSymbol = getFullTokenFromSymbol;
function estimateGas(nearish, refAMMish) {
    return __awaiter(this, void 0, void 0, function* () {
        const gasPrice = nearish.gasPrice;
        const gasLimitTransaction = nearish.gasLimitTransaction;
        const gasLimitEstimate = refAMMish.gasLimitEstimate;
        return {
            network: nearish.chain,
            timestamp: Date.now(),
            gasPrice,
            gasPriceToken: nearish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: String((gasPrice * gasLimitEstimate) / 1e24),
        };
    });
}
exports.estimateGas = estimateGas;
//# sourceMappingURL=ref.controllers.js.map