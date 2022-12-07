"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const harmony_validators_1 = require("../../../src/chains/harmony/harmony.validators");
const validators_1 = require("../../../src/services/validators");
require("jest-extended");
describe('validateAddress', () => {
    it('valid when req.address is a address', () => {
        expect((0, harmony_validators_1.validateAddress)({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        })).toEqual([]);
    });
    it('valid when req.address is a bech32 address', () => {
        expect((0, harmony_validators_1.validateAddress)({
            address: 'one1l2sjl5gzl6rz8jffn3etq0j9zpljwu44u9889l',
        })).toEqual([]);
    });
    it('return error when req.address does not exist', () => {
        expect((0, harmony_validators_1.validateAddress)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('address')]);
    });
    it('return error when req.address is invalid', () => {
        expect((0, harmony_validators_1.validateAddress)({
            address: 'world',
        })).toEqual([harmony_validators_1.invalidAddressError]);
    });
});
describe('validateSpender', () => {
    it('valid when req.spender is a publicKey', () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        })).toEqual([]);
    });
    it("valid when req.spender is a 'sushiswap'", () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: 'sushiswap',
        })).toEqual([]);
    });
    it("valid when req.spender is 'viperswap'", () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: 'viperswap',
        })).toEqual([]);
    });
    it("valid when req.spender is 'defikingdoms'", () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: 'defikingdoms',
        })).toEqual([]);
    });
    it("valid when req.spender is 'defira'", () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: 'defira',
        })).toEqual([]);
    });
    it('return error when req.spender does not exist', () => {
        expect((0, harmony_validators_1.validateSpender)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('spender')]);
    });
    it('return error when req.spender is invalid', () => {
        expect((0, harmony_validators_1.validateSpender)({
            spender: 'world',
        })).toEqual([harmony_validators_1.invalidSpenderError]);
    });
});
describe('validateNonce', () => {
    it('valid when req.nonce is a number', () => {
        expect((0, harmony_validators_1.validateNonce)({
            nonce: 0,
        })).toEqual([]);
        expect((0, harmony_validators_1.validateNonce)({
            nonce: 999,
        })).toEqual([]);
    });
    it('valid when req.nonce does not exist', () => {
        expect((0, harmony_validators_1.validateNonce)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.nonce is invalid', () => {
        expect((0, harmony_validators_1.validateNonce)({
            nonce: '123',
        })).toEqual([harmony_validators_1.invalidNonceError]);
    });
});
describe('validateMaxFeePerGas', () => {
    it('valid when req.quote is a string', () => {
        expect((0, harmony_validators_1.validateMaxFeePerGas)({
            maxFeePerGas: '5000000000',
        })).toEqual([]);
        expect((0, harmony_validators_1.validateMaxFeePerGas)({
            maxFeePerGas: '1',
        })).toEqual([]);
    });
    it('return no error when req.maxFeePerGas does not exist', () => {
        expect((0, harmony_validators_1.validateMaxFeePerGas)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.maxFeePerGas is invalid', () => {
        expect((0, harmony_validators_1.validateMaxFeePerGas)({
            maxFeePerGas: 123,
        })).toEqual([harmony_validators_1.invalidMaxFeePerGasError]);
    });
});
describe('validateMaxPriorityFeePerGas', () => {
    it('valid when req.quote is a string', () => {
        expect((0, harmony_validators_1.validateMaxPriorityFeePerGas)({
            maxPriorityFeePerGasError: '5000000000',
        })).toEqual([]);
        expect((0, harmony_validators_1.validateMaxPriorityFeePerGas)({
            maxPriorityFeePerGasError: '1',
        })).toEqual([]);
    });
    it('return no error when req.maxPriorityFeePerGas does not exist', () => {
        expect((0, harmony_validators_1.validateMaxPriorityFeePerGas)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.maxPriorityFeePerGas is invalid', () => {
        expect((0, harmony_validators_1.validateMaxPriorityFeePerGas)({
            maxPriorityFeePerGas: 123,
        })).toEqual([harmony_validators_1.invalidMaxPriorityFeePerGasError]);
    });
});
//# sourceMappingURL=harmony.validators.test.js.map