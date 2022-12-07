"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickswapConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var QuickswapConfig;
(function (QuickswapConfig) {
    QuickswapConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('quickswap.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get('quickswap.gasLimitEstimate'),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('quickswap.ttl'),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('quickswap.contractAddresses.' + network + '.routerAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [{ chain: 'polygon', networks: ['mainnet', 'mumbai'] }],
    };
})(QuickswapConfig = exports.QuickswapConfig || (exports.QuickswapConfig = {}));
//# sourceMappingURL=quickswap.config.js.map