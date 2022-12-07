"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthereumConfig = exports.EthereumConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var EthereumConfig;
(function (EthereumConfig) {
    EthereumConfig.ethGasStationConfig = {
        enabled: config_manager_v2_1.ConfigManagerV2.getInstance().get('ethereumGasStation.enabled'),
        gasStationURL: config_manager_v2_1.ConfigManagerV2.getInstance().get('ethereumGasStation.gasStationURL'),
        APIKey: config_manager_v2_1.ConfigManagerV2.getInstance().get('ethereumGasStation.APIKey'),
        gasLevel: config_manager_v2_1.ConfigManagerV2.getInstance().get('ethereumGasStation.gasLevel'),
    };
})(EthereumConfig = exports.EthereumConfig || (exports.EthereumConfig = {}));
function getEthereumConfig(chainName, networkName) {
    const network = networkName;
    return {
        network: {
            name: network,
            chainID: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.chainID'),
            nodeURL: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.nodeURL'),
            tokenListType: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.tokenListType'),
            tokenListSource: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.tokenListSource'),
            gasPriceRefreshInterval: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.gasPriceRefreshInterval'),
        },
        nativeCurrencySymbol: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.networks.' + network + '.nativeCurrencySymbol'),
        manualGasPrice: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.manualGasPrice'),
        gasLimitTransaction: config_manager_v2_1.ConfigManagerV2.getInstance().get(chainName + '.gasLimitTransaction'),
    };
}
exports.getEthereumConfig = getEthereumConfig;
//# sourceMappingURL=ethereum.config.js.map