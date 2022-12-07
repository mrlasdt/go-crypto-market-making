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
exports.estimateGas = exports.getFullTokenFromSymbol = exports.poolPrice = exports.positionInfo = exports.collectEarnedFees = exports.removeLiquidity = exports.addLiquidity = exports.trade = exports.price = exports.getTradeInfo = exports.txWriteData = void 0;
const decimal_js_light_1 = __importDefault(require("decimal.js-light"));
const ethers_1 = require("ethers");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const error_handler_1 = require("../../services/error-handler");
const base_1 = require("../../services/base");
const logger_1 = require("../../services/logger");
function txWriteData(ethereumish, address, maxFeePerGas, maxPriorityFeePerGas) {
    return __awaiter(this, void 0, void 0, function* () {
        let maxFeePerGasBigNumber;
        if (maxFeePerGas) {
            maxFeePerGasBigNumber = ethers_1.BigNumber.from(maxFeePerGas);
        }
        let maxPriorityFeePerGasBigNumber;
        if (maxPriorityFeePerGas) {
            maxPriorityFeePerGasBigNumber = ethers_1.BigNumber.from(maxPriorityFeePerGas);
        }
        let wallet;
        try {
            wallet = yield ethereumish.getWallet(address);
        }
        catch (err) {
            logger_1.logger.error(`Wallet ${address} not available.`);
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        return { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber };
    });
}
exports.txWriteData = txWriteData;
function getTradeInfo(ethereumish, uniswapish, baseAsset, quoteAsset, baseAmount, tradeSide, allowedSlippage) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseToken = getFullTokenFromSymbol(ethereumish, uniswapish, baseAsset);
        const quoteToken = getFullTokenFromSymbol(ethereumish, uniswapish, quoteAsset);
        const requestAmount = ethers_1.BigNumber.from(baseAmount.toFixed(baseToken.decimals).replace('.', ''));
        let expectedTrade;
        if (tradeSide === 'BUY') {
            expectedTrade = yield uniswapish.estimateBuyTrade(quoteToken, baseToken, requestAmount, allowedSlippage);
        }
        else {
            expectedTrade = yield uniswapish.estimateSellTrade(baseToken, quoteToken, requestAmount, allowedSlippage);
        }
        return {
            baseToken,
            quoteToken,
            requestAmount,
            expectedTrade,
        };
    });
}
exports.getTradeInfo = getTradeInfo;
function price(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        let tradeInfo;
        try {
            tradeInfo = yield getTradeInfo(ethereumish, uniswapish, req.base, req.quote, new decimal_js_light_1.default(req.amount), req.side, req.allowedSlippage);
        }
        catch (e) {
            if (e instanceof Error) {
                throw new error_handler_1.HttpException(500, error_handler_1.PRICE_FAILED_ERROR_MESSAGE + e.message, error_handler_1.PRICE_FAILED_ERROR_CODE);
            }
            else {
                throw new error_handler_1.HttpException(500, error_handler_1.UNKNOWN_ERROR_MESSAGE, error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
            }
        }
        const trade = tradeInfo.expectedTrade.trade;
        const expectedAmount = tradeInfo.expectedTrade.expectedAmount;
        const tradePrice = req.side === 'BUY' ? trade.executionPrice.invert() : trade.executionPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasPrice = ethereumish.gasPrice;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            base: tradeInfo.baseToken.address,
            quote: tradeInfo.quoteToken.address,
            amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
            rawAmount: tradeInfo.requestAmount.toString(),
            expectedAmount: expectedAmount.toSignificant(8),
            price: tradePrice.toSignificant(8),
            gasPrice: gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
        };
    });
}
exports.price = price;
function trade(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const limitPrice = req.limitPrice;
        const { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber } = yield txWriteData(ethereumish, req.address, req.maxFeePerGas, req.maxPriorityFeePerGas);
        let tradeInfo;
        try {
            tradeInfo = yield getTradeInfo(ethereumish, uniswapish, req.base, req.quote, new decimal_js_light_1.default(req.amount), req.side);
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
        const gasPrice = ethereumish.gasPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        if (req.side === 'BUY') {
            const price = tradeInfo.expectedTrade.trade.executionPrice.invert();
            if (limitPrice &&
                new decimal_js_light_1.default(price.toFixed(8)).gt(new decimal_js_light_1.default(limitPrice))) {
                logger_1.logger.error('Swap price exceeded limit price.');
                throw new error_handler_1.HttpException(500, (0, error_handler_1.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE)(price.toFixed(8), limitPrice), error_handler_1.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE);
            }
            const tx = yield uniswapish.executeTrade(wallet, tradeInfo.expectedTrade.trade, gasPrice, uniswapish.router, uniswapish.ttl, uniswapish.routerAbi, gasLimitTransaction, req.nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber, req.allowedSlippage);
            if (tx.hash) {
                yield ethereumish.txStorage.saveTx(ethereumish.chain, ethereumish.chainId, tx.hash, new Date(), ethereumish.gasPrice);
            }
            logger_1.logger.info(`Trade has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
            return {
                network: ethereumish.chain,
                timestamp: startTimestamp,
                latency: (0, base_1.latency)(startTimestamp, Date.now()),
                base: tradeInfo.baseToken.address,
                quote: tradeInfo.quoteToken.address,
                amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
                rawAmount: tradeInfo.requestAmount.toString(),
                expectedIn: tradeInfo.expectedTrade.expectedAmount.toSignificant(8),
                price: price.toSignificant(8),
                gasPrice: gasPrice,
                gasPriceToken: ethereumish.nativeTokenSymbol,
                gasLimit: gasLimitTransaction,
                gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
                nonce: tx.nonce,
                txHash: tx.hash,
            };
        }
        else {
            const price = tradeInfo.expectedTrade.trade.executionPrice;
            logger_1.logger.info(`Expected execution price is ${price.toFixed(6)}, ` +
                `limit price is ${limitPrice}.`);
            if (limitPrice &&
                new decimal_js_light_1.default(price.toFixed(8)).lt(new decimal_js_light_1.default(limitPrice))) {
                logger_1.logger.error('Swap price lower than limit price.');
                throw new error_handler_1.HttpException(500, (0, error_handler_1.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE)(price.toFixed(8), limitPrice), error_handler_1.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_CODE);
            }
            const tx = yield uniswapish.executeTrade(wallet, tradeInfo.expectedTrade.trade, gasPrice, uniswapish.router, uniswapish.ttl, uniswapish.routerAbi, gasLimitTransaction, req.nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber);
            logger_1.logger.info(`Trade has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
            return {
                network: ethereumish.chain,
                timestamp: startTimestamp,
                latency: (0, base_1.latency)(startTimestamp, Date.now()),
                base: tradeInfo.baseToken.address,
                quote: tradeInfo.quoteToken.address,
                amount: new decimal_js_light_1.default(req.amount).toFixed(tradeInfo.baseToken.decimals),
                rawAmount: tradeInfo.requestAmount.toString(),
                expectedOut: tradeInfo.expectedTrade.expectedAmount.toSignificant(8),
                price: price.toSignificant(8),
                gasPrice: gasPrice,
                gasPriceToken: ethereumish.nativeTokenSymbol,
                gasLimit: gasLimitTransaction,
                gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
                nonce: tx.nonce,
                txHash: tx.hash,
            };
        }
    });
}
exports.trade = trade;
function addLiquidity(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber } = yield txWriteData(ethereumish, req.address, req.maxFeePerGas, req.maxPriorityFeePerGas);
        const fee = v3_sdk_1.FeeAmount[req.fee.toUpperCase()];
        const token0 = getFullTokenFromSymbol(ethereumish, uniswapish, req.token0);
        const token1 = getFullTokenFromSymbol(ethereumish, uniswapish, req.token1);
        const gasPrice = ethereumish.gasPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        const tx = yield uniswapish.addPosition(wallet, token0, token1, req.amount0, req.amount1, fee, Number(req.lowerPrice), Number(req.upperPrice), req.tokenId ? req.tokenId : 0, gasLimitTransaction, gasPrice, req.nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber);
        logger_1.logger.info(`Liquidity added, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            token0: token0.address,
            token1: token1.address,
            fee: req.fee,
            tokenId: req.tokenId ? req.tokenId : 0,
            gasPrice: gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
            nonce: tx.nonce,
            txHash: tx.hash,
        };
    });
}
exports.addLiquidity = addLiquidity;
function removeLiquidity(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber } = yield txWriteData(ethereumish, req.address, req.maxFeePerGas, req.maxPriorityFeePerGas);
        const gasPrice = ethereumish.gasPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        const tx = yield uniswapish.reducePosition(wallet, req.tokenId, req.decreasePercent ? req.decreasePercent : 100, gasLimitTransaction, gasPrice, req.nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber);
        logger_1.logger.info(`Liquidity removed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            tokenId: req.tokenId,
            gasPrice: gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
            nonce: tx.nonce,
            txHash: tx.hash,
        };
    });
}
exports.removeLiquidity = removeLiquidity;
function collectEarnedFees(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber } = yield txWriteData(ethereumish, req.address, req.maxFeePerGas, req.maxPriorityFeePerGas);
        const gasPrice = ethereumish.gasPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        const tx = (yield uniswapish.collectFees(wallet, req.tokenId, gasLimitTransaction, gasPrice, req.nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber));
        logger_1.logger.info(`Fees collected, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            tokenId: req.tokenId,
            gasPrice: gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
            nonce: tx.nonce,
            txHash: tx.hash,
        };
    });
}
exports.collectEarnedFees = collectEarnedFees;
function positionInfo(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const posInfo = yield uniswapish.getPosition(req.tokenId);
        logger_1.logger.info(`Position info for position ${req.tokenId} retrieved.`);
        return Object.assign({ network: ethereumish.chain, timestamp: startTimestamp, latency: (0, base_1.latency)(startTimestamp, Date.now()) }, posInfo);
    });
}
exports.positionInfo = positionInfo;
function poolPrice(ethereumish, uniswapish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const token0 = getFullTokenFromSymbol(ethereumish, uniswapish, req.token0);
        const token1 = getFullTokenFromSymbol(ethereumish, uniswapish, req.token1);
        const fee = v3_sdk_1.FeeAmount[req.fee.toUpperCase()];
        const prices = yield uniswapish.poolPrice(token0, token1, fee, req.period, req.interval);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            token0: token0.address,
            token1: token1.address,
            fee: req.fee,
            period: req.period,
            interval: req.interval,
            prices: prices,
        };
    });
}
exports.poolPrice = poolPrice;
function getFullTokenFromSymbol(ethereumish, uniswapish, tokenSymbol) {
    const tokenInfo = ethereumish.getTokenBySymbol(tokenSymbol);
    let fullToken;
    if (tokenInfo) {
        fullToken = uniswapish.getTokenByAddress(tokenInfo.address);
    }
    if (!fullToken)
        throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + tokenSymbol, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
    return fullToken;
}
exports.getFullTokenFromSymbol = getFullTokenFromSymbol;
function estimateGas(ethereumish, uniswapish) {
    return __awaiter(this, void 0, void 0, function* () {
        const gasPrice = ethereumish.gasPrice;
        const gasLimitTransaction = ethereumish.gasLimitTransaction;
        const gasLimitEstimate = uniswapish.gasLimitEstimate;
        return {
            network: ethereumish.chain,
            timestamp: Date.now(),
            gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: gasLimitTransaction,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimitEstimate),
        };
    });
}
exports.estimateGas = estimateGas;
//# sourceMappingURL=uniswap.controllers.js.map