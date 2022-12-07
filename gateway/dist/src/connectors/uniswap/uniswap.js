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
exports.Uniswap = void 0;
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const uniswap_config_1 = require("./uniswap.config");
const uniswap_v2_router_abi_json_1 = __importDefault(require("./uniswap_v2_router_abi.json"));
const smart_order_router_1 = require("@uniswap/smart-order-router");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const logger_1 = require("../../services/logger");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const ethereum_1 = require("../../chains/ethereum/ethereum");
const polygon_1 = require("../../chains/polygon/polygon");
class Uniswap {
    constructor(chain, network) {
        this.tokenList = {};
        this._ready = false;
        const config = uniswap_config_1.UniswapConfig.config;
        if (chain === 'ethereum') {
            this.chain = ethereum_1.Ethereum.getInstance(network);
        }
        else {
            this.chain = polygon_1.Polygon.getInstance(network);
        }
        this.chainId = this.chain.chainId;
        this._ttl = uniswap_config_1.UniswapConfig.config.ttl;
        this._maximumHops = uniswap_config_1.UniswapConfig.config.maximumHops;
        this._alphaRouter = new smart_order_router_1.AlphaRouter({
            chainId: this.chainId,
            provider: this.chain.provider,
        });
        this._routerAbi = uniswap_v2_router_abi_json_1.default.abi;
        this._gasLimitEstimate = uniswap_config_1.UniswapConfig.config.gasLimitEstimate;
        this._router = config.uniswapV3SmartOrderRouterAddress(network);
    }
    static getInstance(chain, network) {
        if (Uniswap._instances === undefined) {
            Uniswap._instances = {};
        }
        if (!(chain + network in Uniswap._instances)) {
            Uniswap._instances[chain + network] = new Uniswap(chain, network);
        }
        return Uniswap._instances[chain + network];
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
                this.tokenList[token.address] = new sdk_core_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
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
    get alphaRouter() {
        return this._alphaRouter;
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
    get maximumHops() {
        return this._maximumHops;
    }
    getAllowedSlippage(allowedSlippageStr) {
        if (allowedSlippageStr != null && (0, validators_1.isFractionString)(allowedSlippageStr)) {
            const fractionSplit = allowedSlippageStr.split('/');
            return new sdk_core_1.Percent(fractionSplit[0], fractionSplit[1]);
        }
        const allowedSlippage = uniswap_config_1.UniswapConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new sdk_core_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    estimateSellTrade(baseToken, quoteToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = sdk_core_1.CurrencyAmount.fromRawAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching trade data for ${baseToken.address}-${quoteToken.address}.`);
            const route = yield this._alphaRouter.route(nativeTokenAmount, quoteToken, sdk_core_1.TradeType.EXACT_INPUT, undefined, {
                maxSwapsPerPath: this.maximumHops,
            });
            if (!route) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`);
            }
            logger_1.logger.info(`Best trade for ${baseToken.address}-${quoteToken.address}: ` +
                `${route.trade.executionPrice.toFixed(6)}` +
                `${baseToken.symbol}.`);
            const expectedAmount = route.trade.minimumAmountOut(this.getAllowedSlippage(allowedSlippage));
            return { trade: route.trade, expectedAmount };
        });
    }
    estimateBuyTrade(quoteToken, baseToken, amount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeTokenAmount = sdk_core_1.CurrencyAmount.fromRawAmount(baseToken, amount.toString());
            logger_1.logger.info(`Fetching pair data for ${quoteToken.address}-${baseToken.address}.`);
            const route = yield this._alphaRouter.route(nativeTokenAmount, quoteToken, sdk_core_1.TradeType.EXACT_OUTPUT, undefined, {
                maxSwapsPerPath: this.maximumHops,
            });
            if (!route) {
                throw new error_handler_1.UniswapishPriceError(`priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`);
            }
            logger_1.logger.info(`Best trade for ${quoteToken.address}-${baseToken.address}: ` +
                `${route.trade.executionPrice.invert().toFixed(6)} ` +
                `${baseToken.symbol}.`);
            const expectedAmount = route.trade.maximumAmountIn(this.getAllowedSlippage(allowedSlippage));
            return { trade: route.trade, expectedAmount };
        });
    }
    executeTrade(wallet, trade, gasPrice, uniswapRouter, ttl, _abi, gasLimit, nonce, maxFeePerGas, maxPriorityFeePerGas, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            const methodParameters = router_sdk_1.SwapRouter.swapCallParameters(trade, {
                deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + ttl),
                recipient: wallet.address,
                slippageTolerance: this.getAllowedSlippage(allowedSlippage),
            });
            return this.chain.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                let tx;
                if (maxFeePerGas !== undefined || maxPriorityFeePerGas !== undefined) {
                    tx = yield wallet.sendTransaction({
                        data: methodParameters.calldata,
                        to: uniswapRouter,
                        gasLimit: gasLimit.toFixed(0),
                        value: methodParameters.value,
                        nonce: nextNonce,
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    });
                }
                else {
                    tx = yield wallet.sendTransaction({
                        data: methodParameters.calldata,
                        to: this.router,
                        gasPrice: (gasPrice * 1e9).toFixed(0),
                        gasLimit: gasLimit.toFixed(0),
                        value: methodParameters.value,
                        nonce: nextNonce,
                    });
                }
                logger_1.logger.info(JSON.stringify(tx));
                return tx;
            }));
        });
    }
}
exports.Uniswap = Uniswap;
//# sourceMappingURL=uniswap.js.map