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
const traderjoe_1 = require("../../../../src/connectors/traderjoe/traderjoe");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const sdk_1 = require("@traderjoe-xyz/sdk");
const ethers_1 = require("ethers");
const avalanche_1 = require("../../../../src/chains/avalanche/avalanche");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let avalanche;
let traderjoe;
const WETH = new sdk_1.Token(43114, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH');
const WAVAX = new sdk_1.Token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    avalanche = avalanche_1.Avalanche.getInstance('fuji');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    yield avalanche.init();
    traderjoe = traderjoe_1.Traderjoe.getInstance('avalanche', 'fuji');
    yield traderjoe.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield avalanche.close();
}));
const patchFetchPairData = () => {
    (0, patch_1.patch)(sdk_1.Fetcher, 'fetchPairData', () => {
        return new sdk_1.Pair(new sdk_1.TokenAmount(WETH, '2000000000000000000'), new sdk_1.TokenAmount(WAVAX, '1000000000000000000'), 43114);
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WETH_WAVAX = new sdk_1.Pair(new sdk_1.TokenAmount(WETH, '2000000000000000000'), new sdk_1.TokenAmount(WAVAX, '1000000000000000000'), 43114);
        const WAVAX_TO_WETH = new sdk_1.Route([WETH_WAVAX], WAVAX);
        return [
            new sdk_1.Trade(WAVAX_TO_WETH, new sdk_1.TokenAmount(WAVAX, '1000000000000000'), sdk_1.TradeType.EXACT_INPUT, 43114),
        ];
    });
};
describe('verify Traderjoe estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield traderjoe.estimateSellTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield traderjoe.estimateSellTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify Traderjoe estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield traderjoe.estimateBuyTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchPairData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield traderjoe.estimateBuyTrade(WETH, WAVAX, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('getAllowedSlippage', () => {
    it('return value of string when not null', () => {
        const allowedSlippage = traderjoe.getAllowedSlippage('3/100');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('3', '100'));
    });
    it('return value from config when string is null', () => {
        const allowedSlippage = traderjoe.getAllowedSlippage();
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
    it('return value from config when string is malformed', () => {
        const allowedSlippage = traderjoe.getAllowedSlippage('yo');
        expect(allowedSlippage).toEqual(new sdk_1.Percent('1', '100'));
    });
});
//# sourceMappingURL=traderjoe.test.js.map