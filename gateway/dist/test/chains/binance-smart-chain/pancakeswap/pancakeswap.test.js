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
const sdk_1 = require("@pancakeswap/sdk");
const ethers_1 = require("ethers");
const binance_smart_chain_1 = require("../../../../src/chains/binance-smart-chain/binance-smart-chain");
const pancakeswap_1 = require("../../../../src/connectors/pancakeswap/pancakeswap");
const error_handler_1 = require("../../../../src/services/error-handler");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
const patch_1 = require("../../../services/patch");
let bsc;
let pancakeswap;
const WBNB = new sdk_1.Token(97, '0xae13d989dac2f0debff460ac112a837c89baa7cd', 18, 'WBNB');
const DAI = new sdk_1.Token(97, '0x8a9424745056Eb399FD19a0EC26A14316684e274', 18, 'DAI');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    bsc = binance_smart_chain_1.BinanceSmartChain.getInstance('testnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(bsc.nonceManager);
    yield bsc.init();
    pancakeswap = pancakeswap_1.PancakeSwap.getInstance('binance-smart-chain', 'testnet');
    yield pancakeswap.init();
}));
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield bsc.close();
}));
const patchFetchPairData = () => {
    (0, patch_1.patch)(sdk_1.Fetcher, 'fetchPairData', () => {
        return new sdk_1.Pair(new sdk_1.TokenAmount(WBNB, '2000000000000000000'), new sdk_1.TokenAmount(DAI, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WBNB_DAI = new sdk_1.Pair(new sdk_1.TokenAmount(WBNB, '2000000000000000000'), new sdk_1.TokenAmount(DAI, '1000000000000000000'));
        const DAI_TO_WBNB = new sdk_1.Route([WBNB_DAI], DAI);
        return [
            new sdk_1.Trade(DAI_TO_WBNB, new sdk_1.TokenAmount(DAI, '1000000000000000'), sdk_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify PancakeSwap estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield pancakeswap.estimateSellTrade(WBNB, DAI, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield pancakeswap.estimateSellTrade(WBNB, DAI, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify PancakeSwap estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield pancakeswap.estimateBuyTrade(WBNB, DAI, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield pancakeswap.estimateBuyTrade(WBNB, DAI, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('getAllowedSlippage', () => {
    it('return value of string when not null', () => {
        const allowedSlippage = pancakeswap.getAllowedSlippage('3/100');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('3', '100'));
    });
    it('return value from config when string is null', () => {
        const allowedSlippage = pancakeswap.getAllowedSlippage();
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
    it('return value from config when string is malformed', () => {
        const allowedSlippage = pancakeswap.getAllowedSlippage('yo');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
});
//# sourceMappingURL=pancakeswap.test.js.map