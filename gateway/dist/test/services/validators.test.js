"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txHash = exports.tokenSymbols = void 0;
const validators_1 = require("../../src/services/validators");
require("jest-extended");
exports.tokenSymbols = ['DAI', 'WETH'];
exports.txHash = '0x6d068067a5e5a0f08c6395b31938893d1cdad81f54a54456221ecd8c1941294d';
describe('isNaturalNumberString', () => {
    it('pass against a well formed natural number in a string', () => {
        expect((0, validators_1.isNaturalNumberString)('12345')).toEqual(true);
    });
    it('fail against a negative number in a string', () => {
        expect((0, validators_1.isNaturalNumberString)('-12')).toEqual(false);
    });
    it('fail against a non number string', () => {
        expect((0, validators_1.isNaturalNumberString)('Hello world')).toEqual(false);
    });
});
describe('isIntegerString', () => {
    it('pass against a positive number in a string', () => {
        expect((0, validators_1.isIntegerString)('12345')).toEqual(true);
    });
    it('pass against a negative number in a string', () => {
        expect((0, validators_1.isIntegerString)('-12')).toEqual(true);
    });
    it('fail against a non number string', () => {
        expect((0, validators_1.isIntegerString)('Hello world')).toEqual(false);
    });
});
describe('isFloatString', () => {
    it('pass against a positive number in a string', () => {
        expect((0, validators_1.isFloatString)('12345')).toEqual(true);
        expect((0, validators_1.isFloatString)('12.345')).toEqual(true);
        expect((0, validators_1.isFloatString)('0.45')).toEqual(true);
        expect((0, validators_1.isFloatString)('0')).toEqual(true);
        expect((0, validators_1.isFloatString)('0.00001')).toEqual(true);
    });
    it('pass against a negative number in a string', () => {
        expect((0, validators_1.isFloatString)('-12')).toEqual(true);
        expect((0, validators_1.isFloatString)('-12.3123')).toEqual(true);
        expect((0, validators_1.isFloatString)('-0.123')).toEqual(true);
    });
    it('fail against a non number string', () => {
        expect((0, validators_1.isFloatString)('Hello world')).toEqual(false);
    });
});
describe('validateTokenSymbols', () => {
    it('valid when req.tokenSymbols is an array of strings', () => {
        expect((0, validators_1.validateTokenSymbols)({
            tokenSymbols: exports.tokenSymbols,
        })).toEqual([]);
    });
    it('return error when req.tokenSymbols does not exist', () => {
        expect((0, validators_1.validateTokenSymbols)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('tokenSymbols')]);
    });
    it('return error when req.tokenSymbols is invalid', () => {
        expect((0, validators_1.validateTokenSymbols)({
            tokenSymbols: exports.tokenSymbols[0],
        })).toEqual([validators_1.invalidTokenSymbolsError]);
    });
});
describe('isBase58', () => {
    it('pass against a well formed Base58', () => {
        expect((0, validators_1.isBase58)('HAE1oNnc3XBmPudphRcHhyCvGShtgDYtZVzx2MocKEr1')).toEqual(true);
    });
    it('fail against a string that has non-Base58 characters', () => {
        expect((0, validators_1.isBase58)('HAE1oNnc3XBmPudphRcHhyCvGShtgDYtZVzx2MocKErI')).toEqual(false);
    });
});
describe('validateToken', () => {
    it('valid when req.token is a string', () => {
        expect((0, validators_1.validateToken)({
            token: 'DAI',
        })).toEqual([]);
        expect((0, validators_1.validateToken)({
            token: 'WETH',
        })).toEqual([]);
    });
    it('return error when req.token does not exist', () => {
        expect((0, validators_1.validateToken)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('token')]);
    });
    it('return error when req.token is invalid', () => {
        expect((0, validators_1.validateToken)({
            token: 123,
        })).toEqual([validators_1.invalidTokenError]);
    });
});
describe('validateAmount', () => {
    it('valid when req.amount is a string of an integer', () => {
        expect((0, validators_1.validateAmount)({
            amount: '0',
        })).toEqual([]);
        expect((0, validators_1.validateAmount)({
            amount: '9999999999999999999999',
        })).toEqual([]);
    });
    it('valid when req.amount does not exist', () => {
        expect((0, validators_1.validateAmount)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.amount is invalid', () => {
        expect((0, validators_1.validateAmount)({
            amount: 'WETH',
        })).toEqual([validators_1.invalidAmountError]);
    });
});
describe('validateTxHash', () => {
    it('valid when req.txHash is a string', () => {
        expect((0, validators_1.validateTxHash)({ txHash: exports.txHash })).toEqual([]);
    });
    it('invalid when req.txHash does not exist', () => {
        expect((0, validators_1.validateTxHash)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('txHash')]);
    });
    it('return error when req.txHash is invalid', () => {
        expect((0, validators_1.validateTxHash)({
            txHash: 123,
        })).toEqual([validators_1.invalidTxHashError]);
    });
});
//# sourceMappingURL=validators.test.js.map