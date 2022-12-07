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
const patch_1 = require("../../services/patch");
const avalanche_1 = require("../../../src/chains/avalanche/avalanche");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
let avalanche;
const TOKENS = [
    {
        chainId: 11111,
        address: '0x21cf0eB2E3Ab483a67C900b27dA8F34185991982',
        decimals: 18,
        name: 'Wrapped AVAX',
        symbol: 'WAVAX',
        logoURI: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/11111/0x21cf0eB2E3Ab483a67C900b27dA8F34185991982/logo.png',
    },
    {
        chainId: 43114,
        address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        decimals: 18,
        name: 'Wrapped AVAX',
        symbol: 'WAVAX',
        logoURI: 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
    },
];
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    avalanche = avalanche_1.Avalanche.getInstance('avalanche');
    (0, patch_1.patch)(avalanche, 'getTokenList', () => TOKENS);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    yield avalanche.init();
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
describe('verify Pangolin storedTokenList', () => {
    it('Should only return tokens in the chain', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = avalanche.storedTokenList;
        expect(tokenList).toEqual([TOKENS[1]]);
    }));
});
//# sourceMappingURL=avalanche.test.js.map