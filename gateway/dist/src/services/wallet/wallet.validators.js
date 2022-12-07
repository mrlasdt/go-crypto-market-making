"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRemoveWalletRequest = exports.validateAddWalletRequest = exports.validateAddress = exports.validateNetwork = exports.validateChain = exports.invalidAddressError = exports.invalidNetworkError = exports.invalidChainError = exports.validatePrivateKey = exports.isNearPrivateKey = exports.isSolPrivateKey = exports.isEthPrivateKey = exports.invalidNearPrivateKeyError = exports.invalidSolPrivateKeyError = exports.invalidEthPrivateKeyError = void 0;
const validators_1 = require("../validators");
const bs58_1 = __importDefault(require("bs58"));
exports.invalidEthPrivateKeyError = 'The privateKey param is not a valid Ethereum private key (64 hexadecimal characters).';
exports.invalidSolPrivateKeyError = 'The privateKey param is not a valid Solana private key (64 bytes, base 58 encoded).';
exports.invalidNearPrivateKeyError = 'The privateKey param is not a valid Near private key.';
const isEthPrivateKey = (str) => {
    return /^(0x)?[a-fA-F0-9]{64}$/.test(str);
};
exports.isEthPrivateKey = isEthPrivateKey;
const isSolPrivateKey = (str) => {
    return (0, validators_1.isBase58)(str) && bs58_1.default.decode(str).length == 64;
};
exports.isSolPrivateKey = isSolPrivateKey;
const isNearPrivateKey = (str) => {
    const parts = str.split(':');
    return parts.length === 2;
};
exports.isNearPrivateKey = isNearPrivateKey;
exports.validatePrivateKey = (0, validators_1.mkSelectingValidator)('chain', (req, key) => req[key], {
    solana: (0, validators_1.mkValidator)('privateKey', exports.invalidSolPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isSolPrivateKey)(val)),
    ethereum: (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
    cronos: (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
    avalanche: (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
    harmony: (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
    near: (0, validators_1.mkValidator)('privateKey', exports.invalidNearPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isNearPrivateKey)(val)),
    polygon: (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
    'binance-smart-chain': (0, validators_1.mkValidator)('privateKey', exports.invalidEthPrivateKeyError, (val) => typeof val === 'string' && (0, exports.isEthPrivateKey)(val)),
});
exports.invalidChainError = 'chain must be "ethereum", "solana", "avalanche", "near", "harmony" or "binance-smart-chain"';
exports.invalidNetworkError = 'expected a string for the network key';
exports.invalidAddressError = 'address must be a string';
exports.validateChain = (0, validators_1.mkValidator)('chain', exports.invalidChainError, (val) => typeof val === 'string' &&
    (val === 'ethereum' ||
        val === 'avalanche' ||
        val === 'polygon' ||
        val === 'solana' ||
        val == 'near' ||
        val === 'harmony' ||
        val === 'cronos' ||
        val === 'binance-smart-chain'));
exports.validateNetwork = (0, validators_1.mkValidator)('network', exports.invalidNetworkError, (val) => typeof val === 'string');
exports.validateAddress = (0, validators_1.mkValidator)('address', exports.invalidAddressError, (val) => typeof val === 'string');
exports.validateAddWalletRequest = (0, validators_1.mkRequestValidator)([
    exports.validatePrivateKey,
    exports.validateChain,
    exports.validateNetwork,
]);
exports.validateRemoveWalletRequest = (0, validators_1.mkRequestValidator)([exports.validateAddress, exports.validateChain]);
//# sourceMappingURL=wallet.validators.js.map