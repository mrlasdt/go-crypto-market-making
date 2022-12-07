"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenoceanConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var OpenoceanConfig;
(function (OpenoceanConfig) {
    OpenoceanConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('openocean.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`pangolin.gasLimitEstimate`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('openocean.ttl'),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('openocean.contractAddresses.' + network + '.routerAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [{ chain: 'avalanche', networks: ['avalanche'] }],
    };
})(OpenoceanConfig = exports.OpenoceanConfig || (exports.OpenoceanConfig = {}));
//# sourceMappingURL=openocean.config.js.map