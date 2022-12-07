"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderjoeConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var TraderjoeConfig;
(function (TraderjoeConfig) {
    TraderjoeConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get('traderjoe.allowedSlippage'),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get('traderjoe.gasLimitEstimate'),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get('traderjoe.ttl'),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get('traderjoe.contractAddresses.' + network + '.routerAddress'),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            { chain: 'avalanche', networks: ['avalanche', 'fuji'] },
        ],
    };
})(TraderjoeConfig = exports.TraderjoeConfig || (exports.TraderjoeConfig = {}));
//# sourceMappingURL=traderjoe.config.js.map