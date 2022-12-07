"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var RefConfig;
(function (RefConfig) {
    RefConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get(`ref.allowedSlippage`),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`ref.gasLimitEstimate`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get(`ref.ttl`),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`ref.contractAddresses.${network}.routerAddress`),
        tradingTypes: ['NEAR_AMM'],
        availableNetworks: [
            {
                chain: 'near',
                networks: Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('ref.contractAddresses')).filter((network) => Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('near.networks')).includes(network)),
            },
        ],
    };
})(RefConfig = exports.RefConfig || (exports.RefConfig = {}));
//# sourceMappingURL=ref.config.js.map