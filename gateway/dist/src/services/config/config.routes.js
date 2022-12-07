"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../error-handler");
const config_validators_1 = require("./config.validators");
const config_manager_v2_1 = require("../config-manager-v2");
var ConfigRoutes;
(function (ConfigRoutes) {
    ConfigRoutes.router = (0, express_1.Router)();
    ConfigRoutes.router.post('/update', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, config_validators_1.validateConfigUpdateRequest)(req.body);
        const config = config_manager_v2_1.ConfigManagerV2.getInstance().get(req.body.configPath);
        if (typeof req.body.configValue == 'string')
            switch (typeof config) {
                case 'number':
                    req.body.configValue = Number(req.body.configValue);
                    break;
                case 'boolean':
                    req.body.configValue =
                        req.body.configValue.toLowerCase() === 'true';
                    break;
            }
        if (req.body.configPath.endsWith('allowedSlippage')) {
            (0, config_validators_1.updateAllowedSlippageToFraction)(req.body);
        }
        config_manager_v2_1.ConfigManagerV2.getInstance().set(req.body.configPath, req.body.configValue);
        res.status(200).json({ message: 'The config has been updated' });
    })));
})(ConfigRoutes = exports.ConfigRoutes || (exports.ConfigRoutes = {}));
//# sourceMappingURL=config.routes.js.map