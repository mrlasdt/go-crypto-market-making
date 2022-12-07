"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const polygon_validators_1 = require("../../../src/chains/polygon/polygon.validators");
const validators_1 = require("../../../src/services/validators");
require("jest-extended");
describe('validateSpender', () => {
    it('valid when req.spender is a publicKey', () => {
        expect((0, polygon_validators_1.validateSpender)({
            spender: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        })).toEqual([]);
    });
    it("valid when req.spender is a 'uniswap'", () => {
        expect((0, polygon_validators_1.validateSpender)({
            spender: 'uniswap',
        })).toEqual([]);
    });
    it('return error when req.spender does not exist', () => {
        expect((0, polygon_validators_1.validateSpender)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('spender')]);
    });
    it('return error when req.spender is invalid', () => {
        expect((0, polygon_validators_1.validateSpender)({
            spender: 'world',
        })).toEqual([polygon_validators_1.invalidSpenderError]);
    });
});
describe('validatePolygonApproveRequest', () => {
    it('valid when req.spender is a publicKey', () => {
        expect((0, polygon_validators_1.validatePolygonApproveRequest)({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            spender: 'uniswap',
            token: 'DAI',
            amount: '1000000',
            nonce: 0,
        })).toEqual(undefined);
    });
});
//# sourceMappingURL=polygon.validators.test.js.map