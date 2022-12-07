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
exports.getOrCreateTokenAccount = exports.token = exports.poll = exports.balances = void 0;
const web3_js_1 = require("@solana/web3.js");
const serum_helpers_1 = require("../../connectors/serum/serum.helpers");
const base_1 = require("../../services/base");
const error_handler_1 = require("../../services/error-handler");
function balances(solanaish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        let wallet;
        try {
            wallet = yield solanaish.getKeypair(req.address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const balances = yield solanaish.getBalances(wallet);
        const filteredBalances = toSolanaBalances(balances, req.tokenSymbols);
        return {
            network: solanaish.network,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            balances: filteredBalances,
        };
    });
}
exports.balances = balances;
const toSolanaBalances = (balances, tokenSymbols) => {
    let filteredBalancesKeys = Object.keys(balances);
    if (tokenSymbols.length) {
        filteredBalancesKeys = filteredBalancesKeys.filter((symbol) => tokenSymbols.includes(symbol));
    }
    const solanaBalances = {};
    filteredBalancesKeys.forEach((symbol) => {
        if (balances[symbol] !== undefined)
            solanaBalances[symbol] = (0, base_1.tokenValueToString)(balances[symbol]);
        else
            solanaBalances[symbol] = '-1';
    });
    return solanaBalances;
};
function poll(solanaish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const currentBlock = yield solanaish.getCurrentBlockNumber();
        const txData = (0, serum_helpers_1.getNotNullOrThrowError)(yield solanaish.getTransaction(req.txHash));
        const txStatus = yield solanaish.getTransactionStatusCode(txData);
        return {
            network: solanaish.network,
            timestamp: initTime,
            currentBlock: currentBlock,
            txHash: req.txHash,
            txStatus: txStatus,
            txBlock: txData.slot,
            txData: (0, serum_helpers_1.getNotNullOrThrowError)(txData),
            txReceipt: null,
        };
    });
}
exports.poll = poll;
function token(solanaish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const tokenInfo = solanaish.getTokenForSymbol(req.token);
        if (!tokenInfo) {
            throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + req.token, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
        }
        const walletAddress = new web3_js_1.PublicKey(req.address);
        const mintAddress = new web3_js_1.PublicKey(tokenInfo.address);
        const account = yield solanaish.getTokenAccount(walletAddress, mintAddress);
        let amount;
        try {
            amount = (0, base_1.tokenValueToString)(yield solanaish.getSplBalance(walletAddress, mintAddress));
        }
        catch (err) {
            amount = null;
        }
        return {
            network: solanaish.network,
            timestamp: initTime,
            token: req.token,
            mintAddress: mintAddress.toBase58(),
            accountAddress: account === null || account === void 0 ? void 0 : account.pubkey.toBase58(),
            amount,
        };
    });
}
exports.token = token;
function getOrCreateTokenAccount(solanaish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const tokenInfo = solanaish.getTokenForSymbol(req.token);
        if (!tokenInfo) {
            throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + req.token, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
        }
        const wallet = yield solanaish.getKeypair(req.address);
        const mintAddress = new web3_js_1.PublicKey(tokenInfo.address);
        const account = yield solanaish.getOrCreateAssociatedTokenAccount(wallet, mintAddress);
        let amount;
        try {
            const a = yield solanaish.getSplBalance(wallet.publicKey, mintAddress);
            amount = (0, base_1.tokenValueToString)(a);
        }
        catch (err) {
            amount = null;
        }
        return {
            network: solanaish.network,
            timestamp: initTime,
            token: req.token,
            mintAddress: mintAddress.toBase58(),
            accountAddress: account === null || account === void 0 ? void 0 : account.address.toBase58(),
            amount,
        };
    });
}
exports.getOrCreateTokenAccount = getOrCreateTokenAccount;
//# sourceMappingURL=solana.controllers.js.map