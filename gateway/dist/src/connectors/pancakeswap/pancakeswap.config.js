"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PancakeSwapConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var PancakeSwapConfig;
(function (PancakeSwapConfig) {
    PancakeSwapConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('pancakeswap.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`pancakeswap.gasLimitEstimate`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('pancakeswap.ttl'),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('pancakeswap.contractAddresses.' + network + '.routerAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            { chain: 'binance-smart-chain', networks: ['mainnet', 'testnet'] },
        ],
    };
})(PancakeSwapConfig = exports.PancakeSwapConfig || (exports.PancakeSwapConfig = {}));
//# sourceMappingURL=pancakeswap.config.js.map