"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.useFakeTimers();
const mad_meerkat_1 = require("../../../../src/connectors/mad_meerkat/mad_meerkat");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const sdk_1 = require("@crocswap/sdk");
const ethers_1 = require("ethers");
const cronos_1 = require("../../../../src/chains/cronos/cronos");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let cronos;
let madMeerkat;
const WETH = new sdk_1.Token(sdk_1.ChainId.MAINNET, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH');
const WAVAX = new sdk_1.Token(sdk_1.ChainId.MAINNET, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    cronos = cronos_1.Cronos.getInstance('mainnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(cronos.nonceManager);
    yield cronos.init();
    madMeerkat = mad_meerkat_1.MadMeerkat.getInstance('cronos', 'mainnet');
    yield madMeerkat.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(cronos.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield cronos.close();
}));
const patchFetchPairData = () => {
    (0, patch_1.patch)(sdk_1.Fetcher, 'fetchPairData', () => {
        return new sdk_1.Pair(new sdk_1.TokenAmount(WETH, '2000000000000000000'), new sdk_1.TokenAmount(WAVAX, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WETH_WAVAX = new sdk_1.Pair(new sdk_1.TokenAmount(WETH, '2000000000000000000'), new sdk_1.TokenAmount(WAVAX, '1000000000000000000'));
        const WAVAX_TO_WETH = new sdk_1.Route([WETH_WAVAX], WAVAX);
        return [
            new sdk_1.Trade(WAVAX_TO_WETH, new sdk_1.TokenAmount(WAVAX, '1000000000000000'), sdk_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify MadMeerkat estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield madMeerkat.estimateSellTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield madMeerkat.estimateSellTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify MadMeerkat estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield madMeerkat.estimateBuyTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield madMeerkat.estimateBuyTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('getAllowedSlippage', () => {
    it('return value of string when not null', () => {
        const allowedSlippage = madMeerkat.getAllowedSlippage('3/100');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('3', '100'));
    });
    it('return value from config when string is null', () => {
        const allowedSlippage = madMeerkat.getAllowedSlippage();
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
    it('return value from config when string is malformed', () => {
        const allowedSlippage = madMeerkat.getAllowedSlippage('yo');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
});
//# sourceMappingURL=mad-meerkat.test.js.map