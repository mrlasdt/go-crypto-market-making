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
exports.cancel = exports.poll = exports.balances = exports.getTokenSymbolsToTokens = void 0;
const near_api_js_1 = require("near-api-js");
const ethers_1 = require("ethers");
const base_1 = require("../../services/base");
const error_handler_1 = require("../../services/error-handler");
const logger_1 = require("../../services/logger");
const getTokenSymbolsToTokens = (near, tokenSymbols) => {
    const tokens = {};
    for (let i = 0; i < tokenSymbols.length; i++) {
        const symbol = tokenSymbols[i];
        const token = near.getTokenBySymbol(symbol);
        if (token)
            tokens[symbol] = token;
    }
    return tokens;
};
exports.getTokenSymbolsToTokens = getTokenSymbolsToTokens;
function balances(nearish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        let account;
        try {
            account = yield nearish.getWallet(req.address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const tokens = (0, exports.getTokenSymbolsToTokens)(nearish, req.tokenSymbols);
        const balances = {};
        if (req.tokenSymbols.includes(nearish.nativeTokenSymbol)) {
            balances[nearish.nativeTokenSymbol] = near_api_js_1.utils.format.formatNearAmount(yield nearish.getNativeBalance(account));
        }
        yield Promise.all(Object.keys(tokens).map((symbol) => __awaiter(this, void 0, void 0, function* () {
            if (tokens[symbol] !== undefined &&
                symbol !== nearish.nativeTokenSymbol) {
                const address = tokens[symbol].address;
                const decimals = tokens[symbol].decimals;
                const contract = nearish.getContract(address, account);
                const balance = yield nearish.getFungibleTokenBalance(contract);
                balances[symbol] = ethers_1.utils
                    .formatUnits(ethers_1.BigNumber.from(balance), decimals)
                    .toString();
            }
        })));
        if (!Object.keys(balances).length) {
            throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
        }
        return {
            network: nearish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            balances: balances,
        };
    });
}
exports.balances = balances;
function poll(nearish, address, txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const currentBlock = yield nearish.getCurrentBlockNumber();
        const txReceipt = yield nearish.getTransaction(txHash, address);
        let txStatus = -1;
        if (typeof txReceipt.status === 'object' &&
            'SuccessValue' in txReceipt.status) {
            txStatus = 1;
        }
        if (txReceipt.transaction_outcome.outcome.gas_burnt /
            nearish.gasLimitTransaction >
            0.9) {
            throw new error_handler_1.HttpException(503, error_handler_1.OUT_OF_GAS_ERROR_MESSAGE, error_handler_1.OUT_OF_GAS_ERROR_CODE);
        }
        logger_1.logger.info(`Poll ${nearish.chain}, txHash ${txHash}, status ${txStatus}.`);
        return {
            network: nearish.chain,
            currentBlock,
            timestamp: initTime,
            txHash: txHash,
            txStatus,
            txReceipt,
        };
    });
}
exports.poll = poll;
function cancel(nearish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        let account;
        try {
            account = yield nearish.getWallet(req.address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const cancelTx = yield nearish.cancelTx(account, req.nonce);
        logger_1.logger.info(`Cancelled transaction at nonce ${req.nonce}, cancel txHash ${cancelTx}.`);
        return {
            network: nearish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            txHash: cancelTx,
        };
    });
}
exports.cancel = cancel;
//# sourceMappingURL=near.controllers.js.map