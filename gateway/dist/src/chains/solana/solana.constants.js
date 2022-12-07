"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
const configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
exports.constants = {
    retry: {
        all: {
            maxNumberOfRetries: configManager.get('solana.retry.all.maxNumberOfRetries') || 0,
            delayBetweenRetries: configManager.get('solana.retry.all.delayBetweenRetries') || 0,
        },
    },
    timeout: {
        all: configManager.get('solana.timeout.all') || 0,
    },
    parallel: {
        all: {
            batchSize: configManager.get('solana.parallel.all.batchSize') || 0,
            delayBetweenBatches: configManager.get('solana.parallel.all.delayBetweenBatches') || 0,
        },
    },
};
exports.default = exports.constants;
//# sourceMappingURL=solana.constants.js.map