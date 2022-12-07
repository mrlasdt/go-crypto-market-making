"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFractionString = exports.fromFractionString = exports.walletPath = exports.latency = exports.safeJsonParse = exports.tokenValueToString = exports.gasCostInEthString = exports.bigNumberWithDecimalToStr = exports.countDecimals = void 0;
const ethers_1 = require("ethers");
const mathjs_1 = require("mathjs");
const validators_1 = require("./validators");
const stringInsert = (str, val, index) => {
    if (index > 0) {
        return str.substring(0, index) + val + str.substr(index);
    }
    return val + str;
};
const countDecimals = (value) => {
    if (value >= 1 || value <= 0) {
        throw new RangeError('countDecimals() is only valid for values between (0, 1).');
    }
    else {
        return Number(value.toExponential().split('-')[1]);
    }
};
exports.countDecimals = countDecimals;
const bigNumberWithDecimalToStr = (n, d) => {
    const n_ = n.toString();
    let zeros = '';
    if (n_.length <= d) {
        zeros = '0'.repeat(d - n_.length + 1);
    }
    return stringInsert(n_.split('').reverse().join('') + zeros, '.', d)
        .split('')
        .reverse()
        .join('');
};
exports.bigNumberWithDecimalToStr = bigNumberWithDecimalToStr;
const gasCostInEthString = (gasPrice, gasLimitTransaction) => {
    return (0, exports.bigNumberWithDecimalToStr)(ethers_1.BigNumber.from(Math.ceil(gasPrice * gasLimitTransaction)).mul(ethers_1.BigNumber.from(1e9)), 18);
};
exports.gasCostInEthString = gasCostInEthString;
const tokenValueToString = (t) => {
    return (0, exports.bigNumberWithDecimalToStr)(t.value, t.decimals);
};
exports.tokenValueToString = tokenValueToString;
const safeJsonParse = (guard) => (text) => {
    const parsed = JSON.parse(text);
    return guard(parsed) ? { parsed, hasError: false } : { hasError: true };
};
exports.safeJsonParse = safeJsonParse;
const latency = (startTime, endTime) => {
    return (endTime - startTime) / 1000;
};
exports.latency = latency;
exports.walletPath = './conf/wallets';
const fromFractionString = (value) => {
    if ((0, validators_1.isFractionString)(value)) {
        const num = (0, mathjs_1.number)((0, mathjs_1.fraction)(value));
        if (typeof num === 'number') {
            return num;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};
exports.fromFractionString = fromFractionString;
const toFractionString = (value) => {
    if (typeof value === 'number') {
        return (0, mathjs_1.format)((0, mathjs_1.fraction)(value), { fraction: 'ratio' });
    }
    else {
        if ((0, validators_1.isFractionString)(value) || (0, validators_1.isFloatString)(value)) {
            return (0, mathjs_1.format)((0, mathjs_1.fraction)(value), { fraction: 'ratio' });
        }
        else {
            return null;
        }
    }
    return null;
};
exports.toFractionString = toFractionString;
//# sourceMappingURL=base.js.map