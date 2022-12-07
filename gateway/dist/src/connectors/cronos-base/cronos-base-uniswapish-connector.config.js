"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronosBaseUniswapishConnectorConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var CronosBaseUniswapishConnectorConfig;
(function (CronosBaseUniswapishConnectorConfig) {
    function buildConfig(connector, tradingTypes) {
        const contractAddresses = config_manager_v2_1.ConfigManagerV2.getInstance().get(`${connector}.contractAddresses`);
        const networks = Object.keys(contractAddresses);
        return {
            allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get(`${connector}.allowedSlippage`),
            gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`${connector}.gasLimitEstimate`),
            ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get(`${connector}.ttl`),
            routerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`${connector}.contractAddresses.` + network + '.routerAddress'),
            tradingTypes: tradingTypes,
            availableNetworks: [{ chain: 'cronos', networks: networks }],
        };
    }
    CronosBaseUniswapishConnectorConfig.buildConfig = buildConfig;
})(CronosBaseUniswapishConnectorConfig = exports.CronosBaseUniswapishConnectorConfig || (exports.CronosBaseUniswapishConnectorConfig = {}));
//# sourceMappingURL=cronos-base-uniswapish-connector.config.js.map