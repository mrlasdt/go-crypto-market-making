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
const sushiswap_1 = require("../../../../src/connectors/sushiswap/sushiswap");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const sdk_1 = require("@sushiswap/sdk");
const ethers_1 = require("ethers");
const ethereum_1 = require("../../../../src/chains/ethereum/ethereum");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let ethereum;
let sushiswap;
const WETH = new sdk_1.Token(3, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH');
const DAI = new sdk_1.Token(3, '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa', 18, 'DAI');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    ethereum = ethereum_1.Ethereum.getInstance('kovan');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    yield ethereum.init();
    sushiswap = sushiswap_1.Sushiswap.getInstance('ethereum', 'kovan');
    yield sushiswap.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield ethereum.close();
}));
const patchFetchData = () => {
    (0, patch_1.patch)(sushiswap, 'fetchData', () => {
        return new sdk_1.Pair(sdk_1.CurrencyAmount.fromRawAmount(WETH, '2000000000000000000'), sdk_1.CurrencyAmount.fromRawAmount(DAI, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WETH_DAI = new sdk_1.Pair(sdk_1.CurrencyAmount.fromRawAmount(WETH, '2000000000000000000'), sdk_1.CurrencyAmount.fromRawAmount(DAI, '1000000000000000000'));
        const DAI_TO_WETH = new sdk_1.Route([WETH_DAI], DAI, WETH);
        return [
            new sdk_1.Trade(DAI_TO_WETH, sdk_1.CurrencyAmount.fromRawAmount(DAI, '1000000000000000'), sdk_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify Sushiswap estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield sushiswap.estimateSellTrade(WETH, DAI, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield sushiswap.estimateSellTrade(WETH, DAI, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify sushiswap estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield sushiswap.estimateBuyTrade(WETH, DAI, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield sushiswap.estimateBuyTrade(WETH, DAI, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify sushiswap Token List', () => {
    it('Should return a token by address', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = sushiswap.getTokenByAddress('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa');
        expect(token).toBeInstanceOf(sdk_1.Token);
    }));
});
//# sourceMappingURL=sushiswap.test.js.map