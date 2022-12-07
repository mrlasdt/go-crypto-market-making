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
exports.getAccountValue = exports.estimateGas = exports.getFullTokenFromSymbol = exports.createTakerOrder = exports.getPosition = exports.checkMarketStatus = exports.getAvailablePairs = exports.getPriceData = void 0;
const error_handler_1 = require("../../services/error-handler");
const base_1 = require("../../services/base");
const logger_1 = require("../../services/logger");
function getPriceData(ethereumish, perpish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        let prices;
        try {
            prices = yield perpish.prices(`${req.base}${req.quote}`);
        }
        catch (e) {
            throw new error_handler_1.HttpException(500, error_handler_1.UNKNOWN_ERROR_MESSAGE, error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
        }
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            base: req.base,
            quote: req.quote,
            markPrice: prices.markPrice.toString(),
            indexPrice: prices.indexPrice.toString(),
            indexTwapPrice: prices.indexTwapPrice.toString(),
        };
    });
}
exports.getPriceData = getPriceData;
function getAvailablePairs(ethereumish, perpish) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            pairs: perpish.availablePairs(),
        };
    });
}
exports.getAvailablePairs = getAvailablePairs;
function checkMarketStatus(ethereumish, perpish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const status = yield perpish.isMarketActive(`${req.base}${req.quote}`);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            base: req.base,
            quote: req.quote,
            isActive: status,
        };
    });
}
exports.checkMarketStatus = checkMarketStatus;
function getPosition(ethereumish, perpish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const position = yield perpish.getPositions(`${req.base}${req.quote}`);
        return Object.assign({ network: ethereumish.chain, timestamp: startTimestamp, latency: (0, base_1.latency)(startTimestamp, Date.now()), base: req.base, quote: req.quote }, position);
    });
}
exports.getPosition = getPosition;
function createTakerOrder(ethereumish, perpish, req, isOpen) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        const gasPrice = ethereumish.gasPrice;
        let tx;
        if (isOpen) {
            if (!req.amount && !req.side) {
                throw new error_handler_1.HttpException(500, error_handler_1.INCOMPLETE_REQUEST_PARAM, error_handler_1.INCOMPLETE_REQUEST_PARAM_CODE);
            }
            tx = yield perpish.openPosition(req.side === 'LONG' ? true : false, `${req.base}${req.quote}`, req.amount, req.allowedSlippage);
        }
        else {
            tx = yield perpish.closePosition(`${req.base}${req.quote}`, req.allowedSlippage);
        }
        yield ethereumish.txStorage.saveTx(ethereumish.chain, ethereumish.chainId, tx.hash, new Date(), ethereumish.gasPrice);
        logger_1.logger.info(`Order has been sent, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`);
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            base: req.base,
            quote: req.quote,
            amount: req.amount ? req.amount : '0',
            gasPrice: gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit: perpish.gasLimit,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, perpish.gasLimit),
            nonce: tx.nonce,
            txHash: tx.hash,
        };
    });
}
exports.createTakerOrder = createTakerOrder;
function getFullTokenFromSymbol(ethereumish, perpish, tokenSymbol) {
    const tokenInfo = ethereumish.getTokenBySymbol(tokenSymbol);
    let fullToken;
    if (tokenInfo) {
        fullToken = perpish.getTokenByAddress(tokenInfo.address);
    }
    if (!fullToken)
        throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + tokenSymbol, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
    return fullToken;
}
exports.getFullTokenFromSymbol = getFullTokenFromSymbol;
function estimateGas(ethereumish, perpish) {
    return __awaiter(this, void 0, void 0, function* () {
        const gasPrice = ethereumish.gasPrice;
        const gasLimit = perpish.gasLimit;
        return {
            network: ethereumish.chain,
            timestamp: Date.now(),
            gasPrice,
            gasPriceToken: ethereumish.nativeTokenSymbol,
            gasLimit,
            gasCost: (0, base_1.gasCostInEthString)(gasPrice, gasLimit),
        };
    });
}
exports.estimateGas = estimateGas;
function getAccountValue(ethereumish, perpish) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        let value;
        try {
            value = yield perpish.getAccountValue();
        }
        catch (e) {
            throw new error_handler_1.HttpException(500, error_handler_1.UNKNOWN_ERROR_MESSAGE, error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
        }
        return {
            network: ethereumish.chain,
            timestamp: startTimestamp,
            latency: (0, base_1.latency)(startTimestamp, Date.now()),
            balance: value.toString(),
        };
    });
}
exports.getAccountValue = getAccountValue;
//# sourceMappingURL=perp.controllers.js.map