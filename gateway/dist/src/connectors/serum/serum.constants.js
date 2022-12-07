"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
const config_manager_v2_1 = require("../../services/config-manager-v2");
const configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
exports.constants = {
    cache: {
        markets: configManager.get('serum.cache.markets') || 3600,
    },
};
exports.default = exports.constants;
//# sourceMappingURL=serum.constants.js.map