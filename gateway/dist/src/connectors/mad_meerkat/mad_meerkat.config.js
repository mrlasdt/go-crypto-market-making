"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadMeerkatConfig = void 0;
const cronos_base_uniswapish_connector_config_1 = require("../cronos-base/cronos-base-uniswapish-connector.config");
var MadMeerkatConfig;
(function (MadMeerkatConfig) {
    const tradingTypes = ['EVM_AMM'];
    MadMeerkatConfig.config = cronos_base_uniswapish_connector_config_1.CronosBaseUniswapishConnectorConfig.buildConfig('mad_meerkat', tradingTypes);
})(MadMeerkatConfig = exports.MadMeerkatConfig || (exports.MadMeerkatConfig = {}));
//# sourceMappingURL=mad_meerkat.config.js.map