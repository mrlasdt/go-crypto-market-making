"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAllowedSlippageToFraction = exports.validateConfigUpdateRequest = exports.validateAllowedSlippage = exports.mkConfigValidator = exports.isAllowedPercentage = exports.invalidAllowedSlippage = void 0;
const validators_1 = require("../validators");
const base_1 = require("../base");
exports.invalidAllowedSlippage = 'allowedSlippage should be a number between 0.0 and 1.0 or a string of a fraction.';
const isAllowedPercentage = (val) => {
    if (typeof val === 'string') {
        if ((0, validators_1.isFloatString)(val)) {
            const num = parseFloat(val);
            return num >= 0.0 && num < 1.0;
        }
        else {
            const num = (0, base_1.fromFractionString)(val);
            if (num !== null) {
                return num >= 0.0 && num < 1.0;
            }
            else {
                return false;
            }
        }
    }
    else {
        return val >= 0.0 && val < 1.0;
    }
};
exports.isAllowedPercentage = isAllowedPercentage;
const mkConfigValidator = (configPathEnding, errorMsg, condition) => {
    return (req) => {
        const errors = [];
        const configPath = req.configPath;
        if (configPath.endsWith(configPathEnding)) {
            const configValue = req.configValue;
            if (!condition(configValue)) {
                errors.push(errorMsg);
            }
        }
        return errors;
    };
};
exports.mkConfigValidator = mkConfigValidator;
exports.validateAllowedSlippage = (0, exports.mkConfigValidator)('allowedSlippage', exports.invalidAllowedSlippage, (val) => (typeof val === 'number' ||
    (typeof val === 'string' &&
        ((0, validators_1.isFractionString)(val) || (0, validators_1.isFloatString)(val)))) &&
    (0, exports.isAllowedPercentage)(val));
exports.validateConfigUpdateRequest = (0, validators_1.mkRequestValidator)([exports.validateAllowedSlippage]);
const updateAllowedSlippageToFraction = (body) => {
    if (body.configPath.endsWith('allowedSlippage')) {
        if (typeof body.configValue === 'number' ||
            (typeof body.configValue == 'string' &&
                !(0, validators_1.isFractionString)(body.configValue))) {
            body.configValue = (0, base_1.toFractionString)(body.configValue);
        }
    }
};
exports.updateAllowedSlippageToFraction = updateAllowedSlippageToFraction;
//# sourceMappingURL=config.validators.js.map