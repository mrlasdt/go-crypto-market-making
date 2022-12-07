"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCancelRequest = exports.validatePollRequest = exports.validateApproveRequest = exports.validateBalanceRequest = exports.validateAllowancesRequest = exports.validateNonceRequest = exports.validateMaxPriorityFeePerGas = exports.validateMaxFeePerGas = exports.validateNonce = exports.validateSpender = exports.validateAddress = exports.invalidMaxPriorityFeePerGasError = exports.invalidMaxFeePerGasError = exports.invalidNonceError = exports.invalidSpenderError = exports.invalidAddressError = void 0;
const validators_1 = require("../../services/validators");
const utils_1 = require("@harmony-js/utils");
exports.invalidAddressError = 'The address param is not a valid Ethereum private key (64 hexidecimal characters).';
exports.invalidSpenderError = 'The spender param is not a valid Ethereum public key (0x followed by 40 hexidecimal characters).';
exports.invalidNonceError = 'If nonce is included it must be a non-negative integer.';
exports.invalidMaxFeePerGasError = 'If maxFeePerGas is included it must be a string of a non-negative integer.';
exports.invalidMaxPriorityFeePerGasError = 'If maxPriorityFeePerGas is included it must be a string of a non-negative integer.';
exports.validateAddress = (0, validators_1.mkValidator)('address', exports.invalidAddressError, (val) => typeof val === 'string' && (0, utils_1.isValidAddress)(val));
exports.validateSpender = (0, validators_1.mkValidator)('spender', exports.invalidSpenderError, (val) => typeof val === 'string' &&
    (val === 'sushiswap' ||
        val === 'viperswap' ||
        val === 'defikingdoms' ||
        val === 'defira' ||
        (0, utils_1.isValidAddress)(val)));
exports.validateNonce = (0, validators_1.mkValidator)('nonce', exports.invalidNonceError, (val) => typeof val === 'number' && val >= 0 && Number.isInteger(val), true);
exports.validateMaxFeePerGas = (0, validators_1.mkValidator)('maxFeePerGas', exports.invalidMaxFeePerGasError, (val) => typeof val === 'string' && (0, validators_1.isNaturalNumberString)(val), true);
exports.validateMaxPriorityFeePerGas = (0, validators_1.mkValidator)('maxPriorityFeePerGas', exports.invalidMaxPriorityFeePerGasError, (val) => typeof val === 'string' && (0, validators_1.isNaturalNumberString)(val), true);
exports.validateNonceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateAddress,
]);
exports.validateAllowancesRequest = (0, validators_1.mkRequestValidator)([
    exports.validateAddress,
    exports.validateSpender,
    validators_1.validateTokenSymbols,
]);
exports.validateBalanceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateAddress,
    validators_1.validateTokenSymbols,
]);
exports.validateApproveRequest = (0, validators_1.mkRequestValidator)([
    exports.validateAddress,
    exports.validateSpender,
    validators_1.validateToken,
    validators_1.validateAmount,
    exports.validateNonce,
    exports.validateMaxFeePerGas,
    exports.validateMaxPriorityFeePerGas,
]);
exports.validatePollRequest = (0, validators_1.mkRequestValidator)([
    validators_1.validateTxHash,
]);
exports.validateCancelRequest = (0, validators_1.mkRequestValidator)([
    exports.validateNonce,
    exports.validateAddress,
]);
//# sourceMappingURL=harmony.validators.js.map