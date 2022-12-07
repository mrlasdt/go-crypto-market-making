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
const polygon_1 = require("../../../src/chains/polygon/polygon");
const patch_1 = require("../../services/patch");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
let polygon;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    polygon = polygon_1.Polygon.getInstance('mumbai');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(polygon.nonceManager);
    yield polygon.init();
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
describe('public get', () => {
    it('gasPrice', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(polygon.gasPrice).toEqual(100);
    }));
    it('native token', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(polygon.nativeTokenSymbol).toEqual('MATIC');
    }));
    it('chain', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(polygon.chain).toEqual('mumbai');
    }));
    it('getSpender', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(polygon.getSpender('0xd0A1E359811322d97991E03f863a0C30C2cF029C')).toEqual('0xd0A1E359811322d97991E03f863a0C30C2cF029C');
    }));
});
//# sourceMappingURL=polygon.test.js.map