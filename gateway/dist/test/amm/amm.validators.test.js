"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amm_validators_1 = require("../../src/amm/amm.validators");
const validators_1 = require("../../src/services/validators");
require("jest-extended");
describe('validateQuote', () => {
    it('valid when req.quote is a string', () => {
        expect((0, amm_validators_1.validateQuote)({
            quote: 'DAI',
        })).toEqual([]);
        expect((0, amm_validators_1.validateQuote)({
            quote: 'WETH',
        })).toEqual([]);
    });
    it('return error when req.quote does not exist', () => {
        expect((0, amm_validators_1.validateQuote)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('quote')]);
    });
    it('return error when req.quote is invalid', () => {
        expect((0, amm_validators_1.validateQuote)({
            quote: 123,
        })).toEqual([amm_validators_1.invalidQuoteError]);
    });
});
describe('validateBase', () => {
    it('valid when req.base is a string', () => {
        expect((0, amm_validators_1.validateBase)({
            base: 'DAI',
        })).toEqual([]);
        expect((0, amm_validators_1.validateBase)({
            base: 'WETH',
        })).toEqual([]);
    });
    it('return error when req.base does not exist', () => {
        expect((0, amm_validators_1.validateBase)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('base')]);
    });
    it('return error when req.base is invalid', () => {
        expect((0, amm_validators_1.validateBase)({
            base: 123,
        })).toEqual([amm_validators_1.invalidBaseError]);
    });
});
describe('validateSide', () => {
    it('valid when req.side is a string', () => {
        expect((0, amm_validators_1.validateSide)({
            side: 'BUY',
        })).toEqual([]);
        expect((0, amm_validators_1.validateSide)({
            side: 'SELL',
        })).toEqual([]);
    });
    it('return error when req.side does not exist', () => {
        expect((0, amm_validators_1.validateSide)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('side')]);
    });
    it('return error when req.side is invalid', () => {
        expect((0, amm_validators_1.validateSide)({
            side: 'comprar',
        })).toEqual([amm_validators_1.invalidSideError]);
    });
});
describe('validateLimitPrice', () => {
    it('valid when req.limitPrice is a string', () => {
        expect((0, amm_validators_1.validateLimitPrice)({
            limitPrice: '12000.123',
        })).toEqual([]);
        expect((0, amm_validators_1.validateLimitPrice)({
            limitPrice: '89425894',
        })).toEqual([]);
    });
    it('pass when req.limitPrice does not exist', () => {
        expect((0, amm_validators_1.validateLimitPrice)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.limitPrice is invalid', () => {
        expect((0, amm_validators_1.validateLimitPrice)({
            limitPrice: 'comprar',
        })).toEqual([amm_validators_1.invalidLimitPriceError]);
    });
});
describe('validateAllowedSlippage', () => {
    it('valid when req.allowedSlippage is a fraction string', () => {
        expect((0, amm_validators_1.validateAllowedSlippage)({
            allowedSlippage: '1/100',
        })).toEqual([]);
        expect((0, amm_validators_1.validateAllowedSlippage)({
            allowedSlippage: '0/1',
        })).toEqual([]);
    });
    it('pass when req.allowedSlippage does not exist', () => {
        expect((0, amm_validators_1.validateAllowedSlippage)({
            hello: 'world',
        })).toEqual([]);
    });
    it('return error when req.allowedSlippage is a number', () => {
        expect((0, amm_validators_1.validateAllowedSlippage)({
            allowedSlippage: 100,
        })).toEqual([amm_validators_1.invalidAllowedSlippageError]);
    });
    it('return error when req.allowedSlippage is a non-fraction string', () => {
        expect((0, amm_validators_1.validateAllowedSlippage)({
            allowedSlippage: 'hello',
        })).toEqual([amm_validators_1.invalidAllowedSlippageError]);
    });
    it('return error when req.allowedSlippage is a non-fraction number string', () => {
        expect((0, amm_validators_1.validateAllowedSlippage)({
            allowedSlippage: '100',
        })).toEqual([amm_validators_1.invalidAllowedSlippageError]);
    });
});
//# sourceMappingURL=amm.validators.test.js.map