"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCancelRequest = exports.validateApproveRequest = exports.validateBalanceRequest = exports.validateAllowancesRequest = exports.validateNonceRequest = exports.validateNetwork = exports.validateChain = exports.validateMaxPriorityFeePerGas = exports.validateMaxFeePerGas = exports.validateNonce = exports.validateSpender = exports.validateAddress = exports.isAddress = exports.invalidNetworkError = exports.invalidChainError = exports.invalidMaxPriorityFeePerGasError = exports.invalidMaxFeePerGasError = exports.invalidNonceError = exports.invalidSpenderError = exports.invalidAddressError = void 0;
const validators_1 = require("../../services/validators");
exports.invalidAddressError = 'The address param is not a valid Ethereum private key (64 hexidecimal characters).';
exports.invalidSpenderError = 'The spender param is not a valid Ethereum address (0x followed by 40 hexidecimal characters).';
exports.invalidNonceError = 'If nonce is included it must be a non-negative integer.';
exports.invalidMaxFeePerGasError = 'If maxFeePerGas is included it must be a string of a non-negative integer.';
exports.invalidMaxPriorityFeePerGasError = 'If maxPriorityFeePerGas is included it must be a string of a non-negative integer.';
exports.invalidChainError = 'The chain param is not a string.';
exports.invalidNetworkError = 'The network param is not a string.';
const isAddress = (str) => {
    return /^0x[a-fA-F0-9]{40}$/.test(str);
};
exports.isAddress = isAddress;
exports.validateAddress = (0, validators_1.mkValidator)('address', exports.invalidAddressError, (val) => typeof val === 'string' && (0, exports.isAddress)(val));
exports.validateSpender = (0, validators_1.mkValidator)('spender', exports.invalidSpenderError, (val) => typeof val === 'string' &&
    (val === 'uniswap' ||
        val === 'perp' ||
        val === 'uniswapLP' ||
        val === 'pangolin' ||
        val === 'traderjoe' ||
        val === 'sushiswap' ||
        val === 'viperswap' ||
        val === 'openocean' ||
        val === 'quickswap' ||
        val === 'defikingdoms' ||
        val === 'defira' ||
        val === 'mad_meerkat' ||
        val === 'vvs' ||
        val === 'pancakeswap' ||
        (0, exports.isAddress)(val)));
exports.validateNonce = (0, validators_1.mkValidator)('nonce', exports.invalidNonceError, (val) => typeof val === 'undefined' ||
    (typeof val === 'number' && val >= 0 && Number.isInteger(val)), true);
exports.validateMaxFeePerGas = (0, validators_1.mkValidator)('maxFeePerGas', exports.invalidMaxFeePerGasError, (val) => typeof val === 'string' && (0, validators_1.isNaturalNumberString)(val), true);
exports.validateMaxPriorityFeePerGas = (0, validators_1.mkValidator)('maxPriorityFeePerGas', exports.invalidMaxPriorityFeePerGasError, (val) => typeof val === 'string' && (0, validators_1.isNaturalNumberString)(val), true);
exports.validateChain = (0, validators_1.mkValidator)('chain', exports.invalidChainError, (val) => typeof val === 'string');
exports.validateNetwork = (0, validators_1.mkValidator)('network', exports.invalidNetworkError, (val) => typeof val === 'string');
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
exports.validateCancelRequest = (0, validators_1.mkRequestValidator)([
    exports.validateNonce,
    exports.validateAddress,
]);
//# sourceMappingURL=ethereum.validators.js.map