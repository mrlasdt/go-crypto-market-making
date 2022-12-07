"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSolanaPostTokenRequest = exports.validateSolanaGetTokenRequest = exports.validateSolanaPollRequest = exports.validateSolanaBalanceRequest = exports.validatePublicKey = exports.isPublicKey = exports.invalidPublicKeyError = exports.invalidPrivateKeyError = void 0;
const validators_1 = require("../../services/validators");
const bs58_1 = __importDefault(require("bs58"));
exports.invalidPrivateKeyError = 'The privateKey param is not a valid Solana private key (base58 string worth 64 bytes).';
exports.invalidPublicKeyError = 'The spender param is not a valid Solana address (base58 string worth 32 bytes).';
const isPublicKey = (str) => {
    return (0, validators_1.isBase58)(str) && bs58_1.default.decode(str).length == 32;
};
exports.isPublicKey = isPublicKey;
exports.validatePublicKey = (0, validators_1.mkValidator)('address', exports.invalidPublicKeyError, (val) => typeof val === 'string' && (0, exports.isPublicKey)(val));
exports.validateSolanaBalanceRequest = (0, validators_1.mkRequestValidator)([exports.validatePublicKey, validators_1.validateTokenSymbols]);
exports.validateSolanaPollRequest = (0, validators_1.mkRequestValidator)([
    validators_1.validateTxHash,
]);
exports.validateSolanaGetTokenRequest = (0, validators_1.mkRequestValidator)([validators_1.validateToken, exports.validatePublicKey]);
exports.validateSolanaPostTokenRequest = (0, validators_1.mkRequestValidator)([validators_1.validateToken, exports.validatePublicKey]);
//# sourceMappingURL=solana.validators.js.map