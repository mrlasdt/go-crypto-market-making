"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadMeerkat = void 0;
const sdk_1 = require("@crocswap/sdk");
const cronos_base_uniswapish_connector_1 = require("../cronos-base/cronos-base-uniswapish-connector");
const abi_json_1 = __importDefault(require("./abi.json"));
const mad_meerkat_config_1 = require("./mad_meerkat.config");
class MadMeerkat extends cronos_base_uniswapish_connector_1.CronosBaseUniswapishConnector {
    constructor(chain, network) {
        const sdkProvider = new MadMeerkatSDKProvider();
        super(sdkProvider, abi_json_1.default, chain, network);
    }
    buildConfig() {
        return mad_meerkat_config_1.MadMeerkatConfig.config;
    }
}
exports.MadMeerkat = MadMeerkat;
class MadMeerkatSDKProvider {
    buildToken(chainId, address, decimals, symbol, name, projectLink) {
        return new sdk_1.Token(chainId, address, decimals, symbol, name, projectLink);
    }
    buildTokenAmount(token, amount) {
        return new sdk_1.TokenAmount(token, amount.toString());
    }
    fetchPairData(tokenA, tokenB, provider) {
        return sdk_1.Fetcher.fetchPairData(tokenA, tokenB, provider);
    }
    bestTradeExactIn(pairs, currencyAmountIn, currencyOut, bestTradeOptions, currentPairs, originalAmountIn, bestTrades) {
        return sdk_1.Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, bestTradeOptions, currentPairs, originalAmountIn, bestTrades);
    }
    bestTradeExactOut(pairs, currencyIn, currencyAmountOut, bestTradeOptions, currentPairs, originalAmountOut, bestTrades) {
        return sdk_1.Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, bestTradeOptions, currentPairs, originalAmountOut, bestTrades);
    }
    buildPercent(numerator, denominator) {
        return new sdk_1.Percent(numerator, denominator);
    }
    minimumAmountOut(trade, slippageTolerance) {
        return trade.minimumAmountOut(slippageTolerance);
    }
    maximumAmountIn(trade, slippageTolerance) {
        return trade.maximumAmountIn(slippageTolerance);
    }
    swapCallParameters(trade, tradeOptions) {
        return sdk_1.Router.swapCallParameters(trade, tradeOptions);
    }
}
//# sourceMappingURL=mad_meerkat.js.map