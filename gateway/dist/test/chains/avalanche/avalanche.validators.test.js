"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const avalanche_validators_1 = require("../../../src/chains/avalanche/avalanche.validators");
const validators_1 = require("../../../src/services/validators");
require("jest-extended");
describe('validateSpender', () => {
    it('valid when req.spender is a publicKey', () => {
        expect((0, avalanche_validators_1.validateSpender)({
            spender: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        })).toEqual([]);
    });
    it("valid when req.spender is a 'uniswap'", () => {
        expect((0, avalanche_validators_1.validateSpender)({
            spender: 'pangolin',
        })).toEqual([]);
    });
    it('return error when req.spender does not exist', () => {
        expect((0, avalanche_validators_1.validateSpender)({
            hello: 'world',
        })).toEqual([(0, validators_1.missingParameter)('spender')]);
    });
    it('return error when req.spender is invalid', () => {
        expect((0, avalanche_validators_1.validateSpender)({
            spender: 'world',
        })).toEqual([avalanche_validators_1.invalidSpenderError]);
    });
});
//# sourceMappingURL=avalanche.validators.test.js.map