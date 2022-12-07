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
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
jest.useFakeTimers();
jest.setTimeout(30000);
const openocean_1 = require("../../../../src/connectors/openocean/openocean");
const error_handler_1 = require("../../../../src/services/error-handler");
const sdk_1 = require("@uniswap/sdk");
const ethers_1 = require("ethers");
const avalanche_1 = require("../../../../src/chains/avalanche/avalanche");
let avalanche;
let openocean;
const USDC = new sdk_1.Token(43114, '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 6, 'USDC');
const WAVAX = new sdk_1.Token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX');
const bDAI = new sdk_1.Token(43114, '0x6807eD4369d9399847F306D7d835538915fA749d', 18, 'bDAI');
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    avalanche = avalanche_1.Avalanche.getInstance('avalanche');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    yield avalanche.init();
    openocean = openocean_1.Openocean.getInstance('avalanche', 'avalanche');
    yield openocean.init();
}));
describe('verify Openocean estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedTrade = yield openocean.estimateSellTrade(USDC, WAVAX, ethers_1.BigNumber.from((Math.pow(10, USDC.decimals)).toString()));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield openocean.estimateSellTrade(USDC, bDAI, ethers_1.BigNumber.from((Math.pow(10, USDC.decimals)).toString()));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify Openocean estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedTrade = yield openocean.estimateBuyTrade(USDC, WAVAX, ethers_1.BigNumber.from((Math.pow(10, WAVAX.decimals)).toString()));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield openocean.estimateBuyTrade(USDC, bDAI, ethers_1.BigNumber.from((Math.pow(10, bDAI.decimals)).toString()));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
//# sourceMappingURL=openocean.test.js.map