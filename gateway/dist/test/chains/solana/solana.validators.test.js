"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKey = exports.publicKey = void 0;
require("jest-extended");
const solana_validators_1 = require("../../../src/chains/solana/solana.validators");
const validators_1 = require("../../../src/services/validators");
exports.publicKey = '3xgEFpNpz1hPU7iHN9P3WPgLTWfZXu6wSUuGw8kigNQr';
exports.privateKey = '5K23ZvkHuNoakyMKGNoaCvky6a2Yu5yfeoRz2wQLKYAczMKzACN5ZZb9ixu6QcsQvrvh91CNfqu8U1LqC1nvnyfp';
describe('isPublicKey', () => {
    it('pass against a well formed public key', () => {
        expect((0, solana_validators_1.isPublicKey)(exports.publicKey)).toEqual(true);
    });
    it('fail against a string that is too short', () => {
        expect((0, solana_validators_1.isPublicKey)(exports.publicKey.substring(2))).toEqual(false);
    });
    it('fail against a string that is too long', () => {
        expect((0, solana_validators_1.isPublicKey)(exports.publicKey + 1)).toEqual(false);
    });
});
describe('validatePublicKey', () => {
    it('valid when req.publicKey is a publicKey', () => {
        expect((0, solana_validators_1.validatePublicKey)({
            address: exports.publicKey,
        })).toEqual([]);
    });
    it('return error when req.publicKey does not exist', () => {
        expect((0, solana_validators_1.validatePublicKey)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('address')]);
    });
    it('return error when req.publicKey is invalid', () => {
        expect((0, solana_validators_1.validatePublicKey)({
            address: 'world',
        })).toEqual([solana_validators_1.invalidPublicKeyError]);
    });
});
//# sourceMappingURL=solana.validators.test.js.map