"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolanaConfig = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
function getSolanaConfig(chainName, networkName) {
    const configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
    return {
        network: {
            name: networkName,
            nodeUrl: configManager.get(chainName + '.networks.' + networkName + '.nodeURL'),
        },
        nativeCurrencySymbol: configManager.get(chainName + '.networks.' + networkName + '.nativeCurrencySymbol'),
        tokenProgram: configManager.get(chainName + '.tokenProgram'),
        transactionLamports: configManager.get(chainName + '.transactionLamports'),
        lamportsToSol: configManager.get(chainName + '.lamportsToSol'),
        timeToLive: configManager.get(chainName + '.timeToLive'),
        customNodeUrl: configManager.get(chainName + '.customNodeUrl'),
    };
}
exports.getSolanaConfig = getSolanaConfig;
//# sourceMappingURL=solana.config.js.map