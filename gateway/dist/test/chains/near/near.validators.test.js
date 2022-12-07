"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKey = exports.publicKey = void 0;
require("jest-extended");
const near_validators_1 = require("../../../src/chains/near/near.validators");
const validators_1 = require("../../../src/services/validators");
exports.publicKey = 'test.near';
exports.privateKey = '5K23ZvkHuNoakyMKGNoaCvky6a2Yu5yfeoRz2wQLKYAczMKzACN5ZZb9ixu6QcsQvrvh91CNfqu8U1LqC1nvnyfp';
describe('validatePublicKey', () => {
    it('valid when req.publicKey is a publicKey', () => {
        expect((0, near_validators_1.validateAddress)({
            address: exports.publicKey,
        })).toEqual([]);
    });
    it('return error when req.publicKey does not exist', () => {
        expect((0, near_validators_1.validateAddress)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('address')]);
    });
    it('return error when req.publicKey is invalid', () => {
        expect((0, near_validators_1.validateAddress)({
            address: 1,
        })).toEqual([near_validators_1.invalidAddressError]);
    });
});
describe('validateSpender', () => {
    it('valid when req.spender is a publicKey', () => {
        expect((0, near_validators_1.validateSpender)({
            spender: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        })).toEqual([]);
    });
    it("valid when req.spender is a 'uniswap'", () => {
        expect((0, near_validators_1.validateSpender)({
            spender: 'uniswap',
        })).toEqual([]);
    });
    it('return error when req.spender is invalid', () => {
        expect((0, near_validators_1.validateSpender)({
            spender: 123,
        })).toEqual([near_validators_1.invalidSpenderError]);
    });
});
describe('validateNonce', () => {
    it('valid when req.nonce is a number', () => {
        expect((0, near_validators_1.validateNonce)({
            nonce: 0,
        })).toEqual([]);
        expect((0, near_validators_1.validateNonce)({
            nonce: 999,
        })).toEqual([]);
    });
    it('valid when req.nonce does not exist', () => {
        expect((0, near_validators_1.validateNonce)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.nonce is invalid', () => {
        expect((0, near_validators_1.validateNonce)({
            nonce: '123',
        })).toEqual([near_validators_1.invalidNonceError]);
    });
});
describe('validateChain', () => {
    it('invalid when req.chain is a number', () => {
        expect((0, near_validators_1.validateChain)({
            chain: 2,
        })).toEqual([near_validators_1.invalidChainError]);
        expect((0, near_validators_1.validateChain)({
            chain: 999,
        })).toEqual([near_validators_1.invalidChainError]);
    });
    it('valid when req.chain is a string', () => {
        expect((0, near_validators_1.validateChain)({
            chain: 'world',
        })).toEqual([]);
    });
});
describe('validateNetwork', () => {
    it('invalid when req.network is a number', () => {
        expect((0, near_validators_1.validateNetwork)({
            network: 2,
        })).toEqual([near_validators_1.invalidNetworkError]);
        expect((0, near_validators_1.validateNetwork)({
            network: 999,
        })).toEqual([near_validators_1.invalidNetworkError]);
    });
    it('valid when req.network is a string', () => {
        expect((0, near_validators_1.validateNetwork)({
            network: 'world',
        })).toEqual([]);
    });
});
describe('validateBalanceRequest', () => {
    it('valid when requests are correct', () => {
        expect((0, near_validators_1.validateBalanceRequest)({
            address: 'world',
            tokenSymbols: ['token'],
        })).toEqual(undefined);
    });
});
//# sourceMappingURL=near.validators.test.js.map