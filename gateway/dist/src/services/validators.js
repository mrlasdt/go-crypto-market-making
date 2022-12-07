"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTxHash = exports.validateAmount = exports.validateToken = exports.isBase58 = exports.validateTokenSymbols = exports.mkRequestValidator = exports.mkValidator = exports.mkSelectingValidator = exports.mkBranchingValidator = exports.missingParameter = exports.throwIfErrorsExist = exports.isFractionString = exports.isFloatString = exports.isIntegerString = exports.isNaturalNumberString = exports.invalidTokenSymbolsError = exports.invalidTxHashError = exports.invalidTokenError = exports.invalidAmountError = void 0;
const error_handler_1 = require("./error-handler");
exports.invalidAmountError = 'If amount is included it must be a string of a non-negative integer.';
exports.invalidTokenError = 'The token param should be a string.';
exports.invalidTxHashError = 'The txHash param must be a string.';
exports.invalidTokenSymbolsError = 'The tokenSymbols param should be an array of strings.';
const isNaturalNumberString = (str) => {
    return /^[0-9]+$/.test(str);
};
exports.isNaturalNumberString = isNaturalNumberString;
const isIntegerString = (str) => {
    return /^[+-]?[0-9]+$/.test(str);
};
exports.isIntegerString = isIntegerString;
const isFloatString = (str) => {
    if ((0, exports.isIntegerString)(str)) {
        return true;
    }
    const decimalSplit = str.split('.');
    if (decimalSplit.length === 2) {
        return ((0, exports.isIntegerString)(decimalSplit[0]) && (0, exports.isNaturalNumberString)(decimalSplit[1]));
    }
    return false;
};
exports.isFloatString = isFloatString;
const isFractionString = (str) => {
    const fractionSplit = str.split('/');
    if (fractionSplit.length == 2) {
        return ((0, exports.isIntegerString)(fractionSplit[0]) && (0, exports.isIntegerString)(fractionSplit[1]));
    }
    return false;
};
exports.isFractionString = isFractionString;
const throwIfErrorsExist = (errors) => {
    if (errors.length > 0) {
        throw new error_handler_1.HttpException(404, errors.join(', '));
    }
};
exports.throwIfErrorsExist = throwIfErrorsExist;
const missingParameter = (key) => {
    return `The request is missing the key: ${key}`;
};
exports.missingParameter = missingParameter;
const mkBranchingValidator = (branchingKey, branchingCondition, validator1, validator2) => {
    return (req) => {
        let errors = [];
        if (req[branchingKey]) {
            if (branchingCondition(req, branchingKey)) {
                errors = errors.concat(validator1(req));
            }
            else {
                errors = errors.concat(validator2(req));
            }
        }
        else {
            errors.push((0, exports.missingParameter)(branchingKey));
        }
        return errors;
    };
};
exports.mkBranchingValidator = mkBranchingValidator;
const mkSelectingValidator = (branchingKey, branchingCondition, validators) => {
    return (req) => {
        let errors = [];
        if (req[branchingKey]) {
            if (Object.keys(validators).includes(branchingCondition(req, branchingKey))) {
                errors = errors.concat(validators[branchingCondition(req, branchingKey)](req));
            }
            else {
                errors.push(`No validator exists for ${branchingCondition(req, branchingKey)}.`);
            }
        }
        else {
            errors.push((0, exports.missingParameter)(branchingKey));
        }
        return errors;
    };
};
exports.mkSelectingValidator = mkSelectingValidator;
const mkValidator = (key, errorMsg, condition, optional = false) => {
    return (req) => {
        const errors = [];
        if (req[key]) {
            if (!condition(req[key])) {
                errors.push(errorMsg);
            }
        }
        else {
            if (!optional) {
                errors.push((0, exports.missingParameter)(key));
            }
        }
        return errors;
    };
};
exports.mkValidator = mkValidator;
const mkRequestValidator = (validators) => {
    return (req) => {
        let errors = [];
        validators.forEach((validator) => (errors = errors.concat(validator(req))));
        (0, exports.throwIfErrorsExist)(errors);
    };
};
exports.mkRequestValidator = mkRequestValidator;
const validateTokenSymbols = (req) => {
    const errors = [];
    if (req.tokenSymbols) {
        if (Array.isArray(req.tokenSymbols)) {
            req.tokenSymbols.forEach((symbol) => {
                if (typeof symbol !== 'string') {
                    errors.push(exports.invalidTokenSymbolsError);
                }
            });
        }
        else {
            errors.push(exports.invalidTokenSymbolsError);
        }
    }
    else {
        errors.push((0, exports.missingParameter)('tokenSymbols'));
    }
    return errors;
};
exports.validateTokenSymbols = validateTokenSymbols;
const isBase58 = (value) => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);
exports.isBase58 = isBase58;
exports.validateToken = (0, exports.mkValidator)('token', exports.invalidTokenError, (val) => typeof val === 'string');
exports.validateAmount = (0, exports.mkValidator)('amount', exports.invalidAmountError, (val) => typeof val === 'string' && (0, exports.isNaturalNumberString)(val), true);
exports.validateTxHash = (0, exports.mkValidator)('txHash', exports.invalidTxHashError, (val) => typeof val === 'string');
//# sourceMappingURL=validators.js.map