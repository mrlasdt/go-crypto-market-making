"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VVSConfig = void 0;
const cronos_base_uniswapish_connector_config_1 = require("../cronos-base/cronos-base-uniswapish-connector.config");
var VVSConfig;
(function (VVSConfig) {
    const tradingTypes = ['EVM_AMM'];
    VVSConfig.config = cronos_base_uniswapish_connector_config_1.CronosBaseUniswapishConnectorConfig.buildConfig('vvs', tradingTypes);
})(VVSConfig = exports.VVSConfig || (exports.VVSConfig = {}));
//# sourceMappingURL=vvs.config.js.map