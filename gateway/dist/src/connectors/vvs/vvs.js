"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VVSConnector = void 0;
const vvs_sdk_1 = require("vvs-sdk");
const cronos_base_uniswapish_connector_1 = require("../cronos-base/cronos-base-uniswapish-connector");
const abi_json_1 = __importDefault(require("./abi.json"));
const vvs_config_1 = require("./vvs.config");
class VVSConnector extends cronos_base_uniswapish_connector_1.CronosBaseUniswapishConnector {
    constructor(chain, network) {
        const sdkProvider = new VVSSDKProvider();
        super(sdkProvider, abi_json_1.default, chain, network);
    }
    buildConfig() {
        return vvs_config_1.VVSConfig.config;
    }
}
exports.VVSConnector = VVSConnector;
class VVSSDKProvider {
    buildToken(chainId, address, decimals, symbol, name, projectLink) {
        return new vvs_sdk_1.Token(chainId, address, decimals, symbol, name, projectLink);
    }
    buildTokenAmount(token, amount) {
        return new vvs_sdk_1.TokenAmount(token, amount.toString());
    }
    fetchPairData(tokenA, tokenB, provider) {
        return vvs_sdk_1.Fetcher.fetchPairData(tokenA, tokenB, provider);
    }
    bestTradeExactIn(pairs, currencyAmountIn, currencyOut, bestTradeOptions, currentPairs, originalAmountIn, bestTrades) {
        return vvs_sdk_1.Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, bestTradeOptions, currentPairs, originalAmountIn, bestTrades);
    }
    bestTradeExactOut(pairs, currencyIn, currencyAmountOut, bestTradeOptions, currentPairs, originalAmountOut, bestTrades) {
        return vvs_sdk_1.Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, bestTradeOptions, currentPairs, originalAmountOut, bestTrades);
    }
    buildPercent(numerator, denominator) {
        return new vvs_sdk_1.Percent(numerator, denominator);
    }
    minimumAmountOut(trade, slippageTolerance) {
        return trade.minimumAmountOut(slippageTolerance);
    }
    maximumAmountIn(trade, slippageTolerance) {
        return trade.maximumAmountIn(slippageTolerance);
    }
    swapCallParameters(trade, tradeOptions) {
        return vvs_sdk_1.Router.swapCallParameters(trade, tradeOptions);
    }
}
//# sourceMappingURL=vvs.js.map