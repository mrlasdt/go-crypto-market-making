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
const defikingdoms_1 = require("../../../../src/connectors/defikingdoms/defikingdoms");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const defikingdoms_sdk_1 = require("@switchboard-xyz/defikingdoms-sdk");
const ethers_1 = require("ethers");
const harmony_1 = require("../../../../src/chains/harmony/harmony");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
const defikingdoms_config_1 = require("../../../../src/connectors/defikingdoms/defikingdoms.config");
let harmony;
let defikingdoms;
const WONE = new defikingdoms_sdk_1.Token(1666600000, '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', 18, 'WONE');
const ETH = new defikingdoms_sdk_1.Token(1666600000, '0x6983D1E6DEf3690C4d616b13597A09e6193EA013', 18, 'ETH');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    harmony = harmony_1.Harmony.getInstance('mainnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    defikingdoms = defikingdoms_1.Defikingdoms.getInstance('harmony', 'mainnet');
    yield defikingdoms.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield harmony.close();
}));
const patchFetchData = () => {
    (0, patch_1.patch)(defikingdoms, 'fetchPairData', () => {
        return new defikingdoms_sdk_1.Pair(new defikingdoms_sdk_1.TokenAmount(WONE, '2000000000000000000'), new defikingdoms_sdk_1.TokenAmount(ETH, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(defikingdoms_sdk_1.Trade, key, () => {
        if (error)
            return [];
        const WONE_ETH = new defikingdoms_sdk_1.Pair(new defikingdoms_sdk_1.TokenAmount(WONE, '2000000000000000000'), new defikingdoms_sdk_1.TokenAmount(ETH, '1000000000000000000'));
        const ETH_TO_WONE = new defikingdoms_sdk_1.Route([WONE_ETH], ETH, WONE);
        return [
            new defikingdoms_sdk_1.Trade(ETH_TO_WONE, new defikingdoms_sdk_1.TokenAmount(ETH, '1000000000000000'), defikingdoms_sdk_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify defikingdoms gasLimit', () => {
    it('Should initially match the config for mainnet', () => {
        expect(defikingdoms.gasLimitEstimate).toEqual(defikingdoms_config_1.DefikingdomsConfig.config.gasLimit);
    });
});
describe('verify defikingdoms getAllowedSlippage', () => {
    it('Should parse simple fractions', () => {
        expect(defikingdoms.getAllowedSlippage('3/100')).toEqual(new defikingdoms_sdk_1.Percent('3', '100'));
    });
});
describe('verify defikingdoms estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield defikingdoms.estimateSellTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield defikingdoms.estimateSellTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify defikingdoms estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield defikingdoms.estimateBuyTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield defikingdoms.estimateBuyTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify defikingdoms Token List', () => {
    it('Should return a token by address', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = defikingdoms.getTokenByAddress(ETH.address);
        expect(token).toBeInstanceOf(defikingdoms_sdk_1.Token);
    }));
});
//# sourceMappingURL=defikingdoms.test.js.map