"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PangolinConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var PangolinConfig;
(function (PangolinConfig) {
    PangolinConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('pangolin.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`pangolin.gasLimitEstimate`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('pangolin.ttl'),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('pangolin.contractAddresses.' + network + '.routerAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            { chain: 'avalanche', networks: ['avalanche', 'fuji'] },
        ],
    };
})(PangolinConfig = exports.PangolinConfig || (exports.PangolinConfig = {}));
//# sourceMappingURL=pangolin.config.js.map