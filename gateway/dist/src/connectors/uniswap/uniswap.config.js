"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
var UniswapConfig;
(function (UniswapConfig) {
    UniswapConfig.config = {
        allowedSlippage: config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.allowedSlippage`),
        gasLimitEstimate: config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.gasLimitEstimate`),
        ttl: config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.ttl`),
        maximumHops: config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.maximumHops`),
        uniswapV3SmartOrderRouterAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.contractAddresses.${network}.uniswapV3SmartOrderRouterAddress`),
        uniswapV3NftManagerAddress: (network) => config_manager_v2_1.ConfigManagerV2.getInstance().get(`uniswap.contractAddresses.${network}.uniswapV3NftManagerAddress`),
        tradingTypes: (type) => {
            return type === 'swap' ? ['EVM_AMM'] : ['EVM_AMM_LP'];
        },
        availableNetworks: [
            {
                chain: 'ethereum',
                networks: Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('uniswap.contractAddresses')).filter((network) => Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('ethereum.networks')).includes(network)),
            },
            {
                chain: 'polygon',
                networks: Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('uniswap.contractAddresses')).filter((network) => Object.keys(config_manager_v2_1.ConfigManagerV2.getInstance().get('polygon.networks')).includes(network)),
            },
        ],
    };
})(UniswapConfig = exports.UniswapConfig || (exports.UniswapConfig = {}));
//# sourceMappingURL=uniswap.config.js.map