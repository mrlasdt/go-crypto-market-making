"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_util_1 = require("./config.util");
module.exports = (_globalConfig, _projectConfig) => {
    config_util_1.DBPathOverride.init();
    config_util_1.DBPathOverride.updateConfigs();
};
//# sourceMappingURL=setup.js.map