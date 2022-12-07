"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerpConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var PerpConfig;
(function (PerpConfig) {
    PerpConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get(`perp.allowedSlippage`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get(`perp.versions.ttl`),
        tradingTypes: (type) => type === 'perp' ? ['EVM_Perpetual'] : ['EVM_AMM_LP'],
        availableNetworks: [{ chain: 'ethereum', networks: ['optimism'] }],
    };
})(PerpConfig = exports.PerpConfig || (exports.PerpConfig = {}));
//# sourceMappingURL=perp.config.js.map