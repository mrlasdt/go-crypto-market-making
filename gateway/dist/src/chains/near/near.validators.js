"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBalanceRequest = exports.validateNetwork = exports.validateChain = exports.validateNonce = exports.validateSpender = exports.validateAddress = exports.invalidNetworkError = exports.invalidChainError = exports.invalidNonceError = exports.invalidSpenderError = exports.invalidAddressError = void 0;
const validators_1 = require("../../services/validators");
exports.invalidAddressError = 'The address param is not a valid Near private key.';
exports.invalidSpenderError = 'The spender param is not a valid Near address.';
exports.invalidNonceError = 'If nonce is included it must be a non-negative integer.';
exports.invalidChainError = 'The chain param is not a string.';
exports.invalidNetworkError = 'The network param is not a string.';
exports.validateAddress = (0, validators_1.mkValidator)('address', exports.invalidAddressError, (val) => typeof val === 'string');
exports.validateSpender = (0, validators_1.mkValidator)('spender', exports.invalidSpenderError, (val) => typeof val === 'string');
exports.validateNonce = (0, validators_1.mkValidator)('nonce', exports.invalidNonceError, (val) => typeof val === 'undefined' ||
    (typeof val === 'number' && val >= 0 && Number.isInteger(val)), true);
exports.validateChain = (0, validators_1.mkValidator)('chain', exports.invalidChainError, (val) => typeof val === 'string');
exports.validateNetwork = (0, validators_1.mkValidator)('network', exports.invalidNetworkError, (val) => typeof val === 'string');
exports.validateBalanceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateAddress,
    validators_1.validateTokenSymbols,
]);
//# sourceMappingURL=near.validators.js.map