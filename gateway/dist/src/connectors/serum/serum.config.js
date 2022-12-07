"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerumConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var SerumConfig;
(function (SerumConfig) {
    SerumConfig.config = {
        tradingTypes: ['SOL_CLOB'],
        markets: {
            url: config_manager_v2_1.ConfigManagerV2.getInstance().get(`serum.markets.url`),
            blacklist: config_manager_v2_1.ConfigManagerV2.getInstance().get(`serum.markets.blacklist`),
            whiteList: config_manager_v2_1.ConfigManagerV2.getInstance().get(`serum.markets.whitelist`),
        },
        tickers: {
            source: config_manager_v2_1.ConfigManagerV2.getInstance().get(`serum.tickers.source`),
            url: config_manager_v2_1.ConfigManagerV2.getInstance().get(`serum.tickers.url`),
        },
        availableNetworks: [
            {
                chain: 'solana',
                networks: ['mainnet-beta'],
            },
        ],
    };
})(SerumConfig = exports.SerumConfig || (exports.SerumConfig = {}));
//# sourceMappingURL=serum.config.js.map