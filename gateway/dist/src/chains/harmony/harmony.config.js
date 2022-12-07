"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHarmonyConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
function getHarmonyConfig(chainName, networkName) {
    const network = networkName;
    return {
        network: {
            name: network,
            chainID: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.chainID'),
            nodeURL: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.nodeURL'),
            tokenListType: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.tokenListType'),
            tokenListSource: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.tokenListSource'),
        },
        nativeCurrencySymbol: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.nativeCurrencySymbol'),
        autoGasPrice: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.autoGasPrice'),
        manualGasPrice: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.manualGasPrice'),
        gasPricerefreshTime: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.gasPricerefreshTime'),
        gasLimitTransaction: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.gasLimitTransaction'),
    };
}
exports.getHarmonyConfig = getHarmonyConfig;
//# sourceMappingURL=harmony.config.js.map