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
exports.Sushiswap = void 0;
const error_handler_1 = require("../../services/error-handler");
const sushiswap_config_1 = require("./sushiswap.config");
const sushiswap_router_json_1 = __importDefault(require("./sushiswap_router.json"));
const sdk_1 = require("@sushiswap/sdk");
const IUniswapV2Pair_json_1 = __importDefault(require("@uniswap/v2-core/build/IUniswapV2Pair.json"));
const ethereum_1 = require("../../chains/ethereum/ethereum");
const binance_smart_chain_1 = require("../../chains/binance-smart-chain/binance-smart-chain");
const ethers_1 = require("ethers");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const logger_1 = require("../../services/logger");
class Sushiswap {
    constructor(chain, network) {
        this.tokenList = {};
        this._ready = false;
        const config = sushiswap_config_1.SushiswapConfig.config;
        if (chain === 'ethereum') {
            this.chain = ethereum_1.Ethereum.getInstance(network);
        }
        else if (chain === 'binance-smart-chain') {
            this.chain = binance_smart_chain_1.BinanceSmartChain.getInstance(network);
        }
        else {
            throw new Error('unsupported chain');
        }
        this.chainId = this.chain.chainId;
        this._ttl = config.ttl;
        this._routerAbi = sushiswap_router_json_1.default.abi;
        this._gasLimitEstimate = config.gasLimitEstimate;
        this._router = config.sushiswapRouterAddress(chain, network);
    }
    static getInstance(chain, network) {
        if (Sushiswap._instances === undefined) {
            Sushiswap._instances = {};
        }
        if (!(chain + network in Sushiswap._instances)) {
            Sushiswap._instances[chain + network] = new Sushiswap(chain, network);
        }
        return Sushiswap._instances[chain + network];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chain.ready()) {
                yield this.chain.init();
            }
            for (const token of this.chain.storedTokenList) {
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
        return this._routerAbi;
    }
    get gasLimitEstimate() {
        return this._gasLimitEstimate;
    }
    get ttl() {
        return this._ttl;
    }
    getSlippagePercentage() {
        const allowedSlippage = sushiswap_config_1.SushiswapConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new sdk_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    fetchData(baseToken, quoteToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const pairAddress = sdk_1.Pair.getAddress(baseToken, quoteToken);
            const contract = new ethers_1.Contract(pairAddress, IUniswapV2Pair_json_1.default.abi, this.chain.provider);
            const [reserves0, reserves1] = yield contract.getReserves();
            const balances = baseToken.sortsBefore(quoteToken)
                ? [reserves0, reserves1]
                : [reserves1, reserves0];
            const pair = new sdk_1.Pair(sdk_1.CurrencyAmount.fromRawAmount(baseToken, balances[0]), sdk_1.CurrencyAmount.fromRawAmount(quoteToken, balances[1]));
            return pair;
        });
    }
    estimateSellTrade(baseToken, quoteToken, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = sdk_1.CurrencyAmount.fromRawAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${baseToken.address}-${quoteToken.address}.`);
            const pair = yield this.fetchData(baseToken, quoteToken);
            const trades = sdk_1.Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, {
                maxHops: 1,
            });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            logger_1.logger.info(`Best trade for ${baseToken.address}-${quoteToken.address}: ` +
                `${trades[0].executionPrice.toFixed(6)}` +
                `${baseToken.name}.`);
            const expectedAmount = trades[0].minimumAmountOut(this.getSlippagePercentage());
            return { trade: trades[0], expectedAmount };
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = sdk_1.CurrencyAmount.fromRawAmount(baseToken, amount.toString());
            const pair = yield this.fetchData(quoteToken, baseToken);
            const trades = sdk_1.Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, {
                maxHops: 1,
            });
            if (!trades || trades.length === 0) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ` +
                `${trades[0].executionPrice.invert().toFixed(6)} ` +
                `${baseToken.name}.`);
            const expectedAmount = trades[0].maximumAmountIn(this.getSlippagePercentage());
            return { trade: trades[0], expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, sushswapRouter, ttl, abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = sdk_1.Router.swapCallParameters(trade, {
                ttl,
                recipient: wallet.address,
                allowedSlippage: this.getSlippagePercentage(),
            });
            const contract = new ethers_1.Contract(sushswapRouter, abi, wallet);
            return this.chain.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                let tx;
                if (maxFeePerGas !== undefined || maxPriorityFeePerGas !== undefined) {
                    tx = yield contract[result.methodName](...result.args, {
                        gasLimit: gasLimit.toFixed(0),
                        value: result.value,
                        nonce: nextNonce,
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    });
                }
                else {
                    tx = yield contract[result.methodName](...result.args, {
                        gasPrice: (gasPrice * 1e9).toFixed(0),
                        gasLimit: gasLimit.toFixed(0),
                        value: result.value,
                        nonce: nextNonce,
                    });
                }
                logger_1.logger.info(JSON.stringify(tx));
                return tx;
            }));
        });
    }
}
exports.Sushiswap = Sushiswap;
//# sourceMappingURL=sushiswap.js.map