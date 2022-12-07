"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const base_1 = require("../../src/services/base");
require("jest-extended");
test('countDecimals', () => {
    const rangeError = 'countDecimals() is only valid for values between (0, 1).';
    expect(() => (0, base_1.countDecimals)(0)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(1)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(-1)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(100)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(1.0000123)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(100.0000123)).toThrow(rangeError);
    expect(() => (0, base_1.countDecimals)(1e9)).toThrow(rangeError);
    expect((0, base_1.countDecimals)(0.0000123)).toEqual(5);
    expect((0, base_1.countDecimals)(1e-9)).toEqual(9);
});
test('bigNumberWithDecimalToStr', () => {
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from(10), 1)).toEqual('1.0');
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from(1), 1)).toEqual('0.1');
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from(12345), 8)).toEqual('0.00012345');
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from('8447700000000000000'), 18)).toEqual('8.447700000000000000');
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from('1200304050607080001'), 18)).toEqual('1.200304050607080001');
    expect((0, base_1.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from('1345000000000000000000'), 18)).toEqual('1345.000000000000000000');
});
test('gasCostInEthString', () => {
    expect((0, base_1.gasCostInEthString)(200, 21000)).toEqual('0.004200000000000000');
});
test('fromFractionString', () => {
    expect((0, base_1.fromFractionString)('1/1')).toEqual(1);
    expect((0, base_1.fromFractionString)('1/2')).toEqual(0.5);
    expect((0, base_1.fromFractionString)('3/4')).toEqual(0.75);
    expect((0, base_1.fromFractionString)('1/100')).toEqual(0.01);
    expect((0, base_1.fromFractionString)('hello')).toEqual(null);
});
test('toFractionString', () => {
    expect((0, base_1.toFractionString)(1)).toEqual('1/1');
    expect((0, base_1.toFractionString)(0.2)).toEqual('1/5');
    expect((0, base_1.toFractionString)(0.1)).toEqual('1/10');
    expect((0, base_1.toFractionString)(0.3)).toEqual('3/10');
    expect((0, base_1.toFractionString)(0.01)).toEqual('1/100');
    expect((0, base_1.toFractionString)('1/100')).toEqual('1/100');
    expect((0, base_1.toFractionString)('2/100')).toEqual('1/50');
    expect((0, base_1.toFractionString)('3/100')).toEqual('3/100');
    expect((0, base_1.toFractionString)('0.2')).toEqual('1/5');
    expect((0, base_1.toFractionString)('hello')).toEqual(null);
    expect((0, base_1.toFractionString)('0abc')).toEqual(null);
});
//# sourceMappingURL=base.test.js.map