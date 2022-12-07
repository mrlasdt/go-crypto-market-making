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
const harmony_1 = require("../../../src/chains/harmony/harmony");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
const sushiswap_config_1 = require("../../../src/connectors/sushiswap/sushiswap.config");
const defikingdoms_config_1 = require("../../../src/connectors/defikingdoms/defikingdoms.config");
const defira_config_1 = require("../../../src/connectors/defira/defira.config");
let harmony;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    harmony = harmony_1.Harmony.getInstance('mainnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    yield harmony.init();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield harmony.close();
}));
describe('getSpender', () => {
    describe('get defira', () => {
        it('returns defira mainnet router address', () => {
            const dfkAddress = harmony.getSpender('defira');
            expect(dfkAddress.toLowerCase()).toEqual(defira_config_1.DefiraConfig.config.routerAddress('mainnet').toLowerCase());
        });
    });
    describe('get viperswap', () => {
        it('returns viperswap mainnet address', () => {
            const viperswapAddress = harmony.getSpender('viperswap');
            expect(viperswapAddress.toLowerCase()).toEqual('0xf012702a5f0e54015362cbca26a26fc90aa832a3');
        });
    });
    describe('get sushiswap', () => {
        it('returns sushiswap kovan address', () => {
            const sushiswapAddress = harmony.getSpender('sushiswap');
            expect(sushiswapAddress.toLowerCase()).toEqual(sushiswap_config_1.SushiswapConfig.config
                .sushiswapRouterAddress('ethereum', 'kovan')
                .toLowerCase());
        });
    });
    describe('get defikingdoms', () => {
        it('returns defikingdoms mainnet router address', () => {
            const dfkAddress = harmony.getSpender('defikingdoms');
            expect(dfkAddress.toLowerCase()).toEqual(defikingdoms_config_1.DefikingdomsConfig.config.routerAddress('mainnet').toLowerCase());
        });
    });
    describe('get defira', () => {
        it('returns defira mainnet router address', () => {
            const dfkAddress = harmony.getSpender('defira');
            expect(dfkAddress.toLowerCase()).toEqual(defira_config_1.DefiraConfig.config.routerAddress('mainnet').toLowerCase());
        });
    });
});
//# sourceMappingURL=harmony.test.js.map