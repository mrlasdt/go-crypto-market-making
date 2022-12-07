"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var SushiswapConfig;
(function (SushiswapConfig) {
    SushiswapConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('sushiswap.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get('sushiswap.gasLimitEstimate'),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('sushiswap.ttl'),
        sushiswapRouterAddress: (chain, network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('sushiswap.contractAddresses.' +
            chain +
            '.' +
            network +
            '.sushiswapRouterAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            {
                chain: 'ethereum',
                networks: ['mainnet', 'kovan', 'goerli', 'ropsten'],
            },
            { chain: 'binance-smart-chain', networks: ['mainnet', 'testnet'] },
        ],
    };
})(SushiswapConfig = exports.SushiswapConfig || (exports.SushiswapConfig = {}));
//# sourceMappingURL=sushiswap.config.js.map