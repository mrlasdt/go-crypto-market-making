"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefikingdomsConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var DefikingdomsConfig;
(function (DefikingdomsConfig) {
    DefikingdomsConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get(`defikingdoms.allowedSlippage`),
        gasLimit: config_manager_v2_1.ConfigManagerV2.getInstance().get(`defikingdoms.gasLimit`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get(`defikingdoms.ttl`),
        routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`defikingdoms.contractAddresses.${network}.routerAddress`),
        tradingTypes: ['EVM_AMM'],
        availableNetworks: [
            {
                chain: 'harmony',
                networks: ['mainnet'],
            },
        ],
    };
})(DefikingdomsConfig = exports.DefikingdomsConfig || (exports.DefikingdomsConfig = {}));
//# sourceMappingURL=defikingdoms.config.js.map