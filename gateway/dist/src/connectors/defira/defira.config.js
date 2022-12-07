"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefiraConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var DefiraConfig;
(function (DefiraConfig) {
    DefiraConfig.config = {
        allowedSlippage: () => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defira.allowedSlippage`),
        gasLimitEstimate: () => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defira.gasLimitEstimate`),
        ttl: () => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defira.ttl`),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defira.contractAddresses.${network}.routerAddress`),
        initCodeHash: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defira.contractAddresses.${network}.initCodeHash`),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            {
                chain: 'harmony',
                networks: ['mainnet', 'testnet'],
            },
        ],
    };
})(DefiraConfig = exports.DefiraConfig || (exports.DefiraConfig = {}));
//# sourceMappingURL=defira.config.js.map