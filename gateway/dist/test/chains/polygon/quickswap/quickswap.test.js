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
const quickswap_1 = require("../../../../src/connectors/quickswap/quickswap");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const quickswap_sdk_1 = require("quickswap-sdk");
const ethers_1 = require("ethers");
const polygon_1 = require("../../../../src/chains/polygon/polygon");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let polygon;
let quickswap;
const WMATIC = new quickswap_sdk_1.Token(80001, '0x9c3c9283d3e44854697cd22d3faa240cfb032889', 18, 'WMATIC');
const WETH = new quickswap_sdk_1.Token(80001, '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa', 18, 'WETH');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    polygon = polygon_1.Polygon.getInstance('mumbai');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(polygon.nonceManager);
    yield polygon.init();
    quickswap = quickswap_1.Quickswap.getInstance('polygon', 'mumbai');
    yield quickswap.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(polygon.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield polygon.close();
}));
const patchFetchPairData = () => {
    (0, patch_1.patch)(quickswap_sdk_1.Fetcher, 'fetchPairData', () => {
        return new quickswap_sdk_1.Pair(new quickswap_sdk_1.TokenAmount(WMATIC, '2000000000000000000'), new quickswap_sdk_1.TokenAmount(WETH, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(quickswap_sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WMATIC_WETH = new quickswap_sdk_1.Pair(new quickswap_sdk_1.TokenAmount(WMATIC, '2000000000000000000'), new quickswap_sdk_1.TokenAmount(WETH, '1000000000000000000'));
        const WETH_TO_WMATIC = new quickswap_sdk_1.Route([WMATIC_WETH], WETH, WMATIC);
        return [
            new quickswap_sdk_1.Trade(WETH_TO_WMATIC, new quickswap_sdk_1.TokenAmount(WETH, '1000000000000000'), quickswap_sdk_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify Quickswap estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield quickswap.estimateSellTrade(WMATIC, WETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield quickswap.estimateSellTrade(WMATIC, WETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify Quickswap estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield quickswap.estimateBuyTrade(WMATIC, WETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield quickswap.estimateBuyTrade(WMATIC, WETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('getAllowedSlippage', () => {
    it('return value of string when not null', () => {
        const allowedSlippage = quickswap.getAllowedSlippage('3/100');
        expect(allowedSlippage).toEqual(new quickswap_sdk_1.Percent('3', '100'));
    });
    it('return value from config when string is null', () => {
        const allowedSlippage = quickswap.getAllowedSlippage();
        expect(allowedSlippage).toEqual(new quickswap_sdk_1.Percent('1', '100'));
    });
    it('return value from config when string is malformed', () => {
        const allowedSlippage = quickswap.getAllowedSlippage('yo');
        expect(allowedSlippage).toEqual(new quickswap_sdk_1.Percent('1', '100'));
    });
});
//# sourceMappingURL=quickswap.test.js.map