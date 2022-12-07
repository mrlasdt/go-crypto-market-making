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
exports.cancel = exports.poll = exports.willTxSucceed = exports.approve = exports.balances = exports.allowances = exports.getTokenSymbolsToTokens = exports.nextNonce = exports.nonce = void 0;
const ethers_1 = require("ethers");
const base_1 = require("../../services/base");
const error_handler_1 = require("../../services/error-handler");
const base_2 = require("../../services/base");
const connection_manager_1 = require("../../services/connection-manager");
const logger_1 = require("../../services/logger");
function nonce(ethereum, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield ethereum.getWallet(req.address);
        const nonce = yield ethereum.nonceManager.getNonce(wallet.address);
        return { nonce };
    });
}
exports.nonce = nonce;
function nextNonce(ethereum, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield ethereum.getWallet(req.address);
        const nonce = yield ethereum.nonceManager.getNextNonce(wallet.address);
        return { nonce };
    });
}
exports.nextNonce = nextNonce;
const getTokenSymbolsToTokens = (ethereum, tokenSymbols) => {
    const tokens = {};
    for (let i = 0; i < tokenSymbols.length; i++) {
        const symbol = tokenSymbols[i];
        const token = ethereum.getTokenBySymbol(symbol);
        if (token)
            tokens[symbol] = token;
    }
    return tokens;
};
exports.getTokenSymbolsToTokens = getTokenSymbolsToTokens;
function allowances(ethereumish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const wallet = yield ethereumish.getWallet(req.address);
        const tokens = (0, exports.getTokenSymbolsToTokens)(ethereumish, req.tokenSymbols);
        const spender = ethereumish.getSpender(req.spender);
        const approvals = {};
        yield Promise.all(Object.keys(tokens).map((symbol) => __awaiter(this, void 0, void 0, function* () {
            const contract = ethereumish.getContract(tokens[symbol].address, ethereumish.provider);
            approvals[symbol] = (0, base_2.tokenValueToString)(yield ethereumish.getERC20Allowance(contract, wallet, spender, tokens[symbol].decimals));
        })));
        return {
            network: ethereumish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            spender: spender,
            approvals: approvals,
        };
    });
}
exports.allowances = allowances;
function balances(ethereumish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        let wallet;
        try {
            wallet = yield ethereumish.getWallet(req.address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const tokens = (0, exports.getTokenSymbolsToTokens)(ethereumish, req.tokenSymbols);
        const balances = {};
        if (req.tokenSymbols.includes(ethereumish.nativeTokenSymbol)) {
            balances[ethereumish.nativeTokenSymbol] = (0, base_2.tokenValueToString)(yield ethereumish.getNativeBalance(wallet));
        }
        yield Promise.all(Object.keys(tokens).map((symbol) => __awaiter(this, void 0, void 0, function* () {
            if (tokens[symbol] !== undefined) {
                const address = tokens[symbol].address;
                const decimals = tokens[symbol].decimals;
                const contract = ethereumish.getContract(address, ethereumish.provider);
                const balance = yield ethereumish.getERC20Balance(contract, wallet, decimals);
                balances[symbol] = (0, base_2.tokenValueToString)(balance);
            }
        })));
        if (!Object.keys(balances).length) {
            throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
        }
        return {
            network: ethereumish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            balances: balances,
        };
    });
}
exports.balances = balances;
const toEthereumTransaction = (transaction) => {
    let maxFeePerGas = null;
    if (transaction.maxFeePerGas) {
        maxFeePerGas = transaction.maxFeePerGas.toString();
    }
    let maxPriorityFeePerGas = null;
    if (transaction.maxPriorityFeePerGas) {
        maxPriorityFeePerGas = transaction.maxPriorityFeePerGas.toString();
    }
    let gasLimit = null;
    if (transaction.gasLimit) {
        gasLimit = transaction.gasLimit.toString();
    }
    return Object.assign(Object.assign({}, transaction), { maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit, value: transaction.value.toString() });
};
function approve(ethereumish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const { amount, nonce, address, token, maxFeePerGas, maxPriorityFeePerGas } = req;
        const spender = ethereumish.getSpender(req.spender);
        const initTime = Date.now();
        let wallet;
        try {
            wallet = yield ethereumish.getWallet(address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const fullToken = ethereumish.getTokenBySymbol(token);
        if (!fullToken) {
            throw new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + token, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE);
        }
        const amountBigNumber = amount
            ? ethers_1.utils.parseUnits(amount, fullToken.decimals)
            : ethers_1.constants.MaxUint256;
        let maxFeePerGasBigNumber;
        if (maxFeePerGas) {
            maxFeePerGasBigNumber = ethers_1.BigNumber.from(maxFeePerGas);
        }
        let maxPriorityFeePerGasBigNumber;
        if (maxPriorityFeePerGas) {
            maxPriorityFeePerGasBigNumber = ethers_1.BigNumber.from(maxPriorityFeePerGas);
        }
        const contract = ethereumish.getContract(fullToken.address, wallet);
        const approval = yield ethereumish.approveERC20(contract, wallet, spender, amountBigNumber, nonce, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber, ethereumish.gasPrice);
        if (approval.hash) {
            yield ethereumish.txStorage.saveTx(ethereumish.chain, ethereumish.chainId, approval.hash, new Date(), ethereumish.gasPrice);
        }
        return {
            network: ethereumish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            tokenAddress: fullToken.address,
            spender: spender,
            amount: (0, base_1.bigNumberWithDecimalToStr)(amountBigNumber, fullToken.decimals),
            nonce: approval.nonce,
            approval: toEthereumTransaction(approval),
        };
    });
}
exports.approve = approve;
const toEthereumTransactionReceipt = (receipt) => {
    if (receipt) {
        let effectiveGasPrice = null;
        if (receipt.effectiveGasPrice) {
            effectiveGasPrice = receipt.effectiveGasPrice.toString();
        }
        return Object.assign(Object.assign({}, receipt), { gasUsed: receipt.gasUsed.toString(), cumulativeGasUsed: receipt.cumulativeGasUsed.toString(), effectiveGasPrice });
    }
    return null;
};
const toEthereumTransactionResponse = (response) => {
    if (response) {
        let gasPrice = null;
        if (response.gasPrice) {
            gasPrice = response.gasPrice.toString();
        }
        return Object.assign(Object.assign({}, response), { gasPrice, gasLimit: response.gasLimit.toString(), value: response.value.toString() });
    }
    return null;
};
function willTxSucceed(txDuration, txDurationLimit, txGasPrice, currentGasPrice) {
    if (txDuration > txDurationLimit && currentGasPrice > txGasPrice) {
        return false;
    }
    return true;
}
exports.willTxSucceed = willTxSucceed;
function poll(ethereumish, req) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        const currentBlock = yield ethereumish.getCurrentBlockNumber();
        const txData = yield ethereumish.getTransaction(req.txHash);
        let txBlock, txReceipt, txStatus;
        if (!txData) {
            txBlock = -1;
            txReceipt = null;
            txStatus = -1;
        }
        else {
            txReceipt = yield ethereumish.getTransactionReceipt(req.txHash);
            if (txReceipt === null) {
                txBlock = -1;
                txReceipt = null;
                txStatus = 0;
                const transactions = yield ethereumish.txStorage.getTxs(ethereumish.chain, ethereumish.chainId);
                if (transactions[txData.hash]) {
                    const data = transactions[txData.hash];
                    const now = new Date();
                    const txDuration = Math.abs(now.getTime() - data[0].getTime());
                    if (willTxSucceed(txDuration, 60000 * 3, data[1], ethereumish.gasPrice)) {
                        txStatus = 2;
                    }
                    else {
                        txStatus = 3;
                    }
                }
            }
            else {
                txBlock = txReceipt.blockNumber;
                txStatus = typeof txReceipt.status === 'number' ? 1 : -1;
                if (txReceipt.status === 0) {
                    const gasUsed = ethers_1.BigNumber.from(txReceipt.gasUsed).toNumber();
                    const gasLimit = ethers_1.BigNumber.from(txData.gasLimit).toNumber();
                    if (gasUsed / gasLimit > 0.9) {
                        throw new error_handler_1.HttpException(503, error_handler_1.OUT_OF_GAS_ERROR_MESSAGE, error_handler_1.OUT_OF_GAS_ERROR_CODE);
                    }
                }
                if (req.connector) {
                    try {
                        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
                        txReceipt.logs = (_a = connector.abiDecoder) === null || _a === void 0 ? void 0 : _a.decodeLogs(txReceipt.logs);
                    }
                    catch (e) {
                        logger_1.logger.error(e);
                    }
                }
            }
        }
        logger_1.logger.info(`Poll ${ethereumish.chain}, txHash ${req.txHash}, status ${txStatus}.`);
        return {
            network: ethereumish.chain,
            currentBlock,
            timestamp: initTime,
            txHash: req.txHash,
            txBlock,
            txStatus,
            txData: toEthereumTransactionResponse(txData),
            txReceipt: toEthereumTransactionReceipt(txReceipt),
        };
    });
}
exports.poll = poll;
function cancel(ethereumish, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const initTime = Date.now();
        let wallet;
        try {
            wallet = yield ethereumish.getWallet(req.address);
        }
        catch (err) {
            throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
        }
        const cancelTx = yield ethereumish.cancelTx(wallet, req.nonce);
        logger_1.logger.info(`Cancelled transaction at nonce ${req.nonce}, cancel txHash ${cancelTx.hash}.`);
        return {
            network: ethereumish.chain,
            timestamp: initTime,
            latency: (0, base_1.latency)(initTime, Date.now()),
            txHash: cancelTx.hash,
        };
    });
}
exports.cancel = cancel;
//# sourceMappingURL=ethereum.controllers.js.map