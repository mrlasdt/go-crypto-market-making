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
exports.Openocean = exports.newFakeTrade = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
const ethers_1 = require("ethers");
const openocean_config_1 = require("./openocean.config");
const sdk_1 = require("@uniswap/sdk");
const decimal_js_light_1 = __importDefault(require("decimal.js-light"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../services/logger");
const avalanche_1 = require("../../chains/avalanche/avalanche");
const error_handler_1 = require("../../services/error-handler");
function newFakeTrade(tokenIn, tokenOut, tokenInAmount, tokenOutAmount) {
    const baseAmount = new sdk_1.TokenAmount(tokenIn, tokenInAmount.toString());
    const quoteAmount = new sdk_1.TokenAmount(tokenOut, tokenOutAmount.toString());
    const pair = new sdk_1.Pair(baseAmount, quoteAmount);
    const route = new sdk_1.Route([pair], tokenIn, tokenOut);
    const trade = new sdk_1.Trade(route, baseAmount, sdk_1.TradeType.EXACT_INPUT);
    trade.executionPrice = new sdk_1.Price(tokenIn, tokenOut, tokenInAmount.toBigInt(), tokenOutAmount.toBigInt());
    return trade;
}
exports.newFakeTrade = newFakeTrade;
class Openocean {
    constructor(chain, network) {
        this.tokenList = {};
        this._ready = false;
        this._chain = chain;
        const config = openocean_config_1.OpenoceanConfig.config;
        this.avalanche = avalanche_1.Avalanche.getInstance(network);
        this.chainId = this.avalanche.chainId;
        this._router = config.routerAddress(network);
        this._ttl = config.ttl;
        this._gasLimitEstimate = config.gasLimitEstimate;
    }
    static getInstance(chain, network) {
        if (Openocean._instances === undefined) {
            Openocean._instances = {};
        }
        if (!(chain + network in Openocean._instances)) {
            Openocean._instances[chain + network] = new Openocean(chain, network);
        }
        return Openocean._instances[chain + network];
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
        return '';
    }
    get gasLimitEstimate() {
        return this._gasLimitEstimate;
    }
    get ttl() {
        return this._ttl;
    }
    get chainName() {
        return this._chain === 'avalanche' ? 'avax' : this._chain;
    }
    getSlippageNumberage() {
        const allowedSlippage = openocean_config_1.OpenoceanConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return Number(nd[1]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateSellTrade(baseToken, quoteToken, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`estimateSellTrade getting amounts out ${baseToken.address}-${quoteToken.address}.`);
            const reqAmount = new decimal_js_light_1.default(amount.toString())
                .div(new decimal_js_light_1.default((Math.pow(10, baseToken.decimals)).toString()))
                .toNumber();
            logger_1.logger.info(`reqAmount:${reqAmount}`);
            const gasPrice = this.avalanche.gasPrice;
            let quoteRes;
            try {
                quoteRes = yield axios_1.default.get(`https://open-api.openocean.finance/v3/${this.chainName}/quote`, {
                    params: {
                        inTokenAddress: baseToken.address,
                        outTokenAddress: quoteToken.address,
                        amount: reqAmount,
                        gasPrice: gasPrice,
                    },
                });
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
            if (quoteRes.status == 200) {
                if (quoteRes.data.code == 200 &&
                    Number(quoteRes.data.data.outAmount) > 0) {
                    const quoteData = quoteRes.data.data;
                    const amounts = [quoteData.inAmount, quoteData.outAmount];
                    const maximumOutput = new sdk_1.TokenAmount(quoteToken, amounts[1].toString());
                    const trade = newFakeTrade(baseToken, quoteToken, ethers_1.BigNumber.from(amounts[0]), ethers_1.BigNumber.from(amounts[1]));
                    return { trade: trade, expectedAmount: maximumOutput };
                }
                else {
                    throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken.address} to ${quoteToken.address}.`);
                }
            }
            throw new error_handler_1.HttpException(quoteRes.status, `Could not get trade info. ${quoteRes.statusText}`, error_handler_1.TRADE_FAILED_ERROR_CODE);
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`estimateBuyTrade getting amounts in ${quoteToken.address}-${baseToken.address}.`);
            const reqAmount = new decimal_js_light_1.default(amount.toString())
                .div(new decimal_js_light_1.default((Math.pow(10, baseToken.decimals)).toString()))
                .toNumber();
            logger_1.logger.info(`reqAmount:${reqAmount}`);
            const gasPrice = this.avalanche.gasPrice;
            let quoteRes;
            try {
                quoteRes = yield axios_1.default.get(`https://open-api.openocean.finance/v3/${this.chainName}/reverseQuote`, {
                    params: {
                        inTokenAddress: baseToken.address,
                        outTokenAddress: quoteToken.address,
                        amount: reqAmount,
                        gasPrice: gasPrice,
                    },
                });
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
            if (quoteRes.status == 200) {
                if (quoteRes.data.code == 200 &&
                    Number(quoteRes.data.data.reverseAmount) > 0) {
                    const quoteData = quoteRes.data.data;
                    const amounts = [quoteData.reverseAmount, quoteData.inAmount];
                    const minimumInput = new sdk_1.TokenAmount(quoteToken, amounts[0].toString());
                    const trade = newFakeTrade(quoteToken, baseToken, ethers_1.BigNumber.from(amounts[0]), ethers_1.BigNumber.from(amounts[1]));
                    return { trade: trade, expectedAmount: minimumInput };
                }
                else {
                    throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
                }
            }
            throw new error_handler_1.HttpException(quoteRes.status, `Could not get trade info. ${quoteRes.statusText}`, error_handler_1.TRADE_FAILED_ERROR_CODE);
        });
    }
    executeTrade(wallet, trade, gasPrice, openoceanRouter, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(`executeTrade ${openoceanRouter}-${ttl}-${abi}-${gasPrice}-${gasLimit}-${nonce}-${maxFeePerGas}-${maxPriorityFeePerGas}.`);
            const inToken = trade.route.input;
            const outToken = trade.route.output;
            let swapRes;
            try {
                swapRes = yield axios_1.default.get(`https://open-api.openocean.finance/v3/${this.chainName}/swap_quote`, {
                    params: {
                        inTokenAddress: inToken.address,
                        outTokenAddress: outToken.address,
                        amount: trade.inputAmount.toExact(),
                        slippage: this.getSlippageNumberage(),
                        account: wallet.address,
                        gasPrice: gasPrice.toString(),
                    },
                });
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
            if (swapRes.status == 200 && swapRes.data.code == 200) {
                const swapData = swapRes.data.data;
                return this.avalanche.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                    const gas = Math.ceil(Number(swapData.estimatedGas) * 1.15);
                    const trans = {
                        nonce: nextNonce,
                        from: swapData.from,
                        to: swapData.to,
                        gasLimit: ethers_1.BigNumber.from(gas.toString()),
                        data: swapData.data,
                        value: ethers_1.BigNumber.from(swapData.value),
                        chainId: this.chainId,
                    };
                    const tx = yield wallet.sendTransaction(trans);
                    logger_1.logger.info(JSON.stringify(tx));
                    return tx;
                }));
            }
            throw new error_handler_1.HttpException(swapRes.status, `Could not get trade info. ${swapRes.statusText}`, error_handler_1.TRADE_FAILED_ERROR_CODE);
        });
    }
}
exports.Openocean = Openocean;
//# sourceMappingURL=openocean.js.map