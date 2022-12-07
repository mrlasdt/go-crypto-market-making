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
const { MockProvider } = require('mock-ethers-provider');
const defira_sdk_1 = require("@zuzu-cat/defira-sdk");
const defira_1 = require("../../../../src/connectors/defira/defira");
const patch_1 = require("../../../services/patch");
const error_handler_1 = require("../../../../src/services/error-handler");
const sdk_core_1 = require("@uniswap/sdk-core");
const defira_sdk_2 = require("@zuzu-cat/defira-sdk");
const ethers_1 = require("ethers");
const harmony_1 = require("../../../../src/chains/harmony/harmony");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
const defira_config_1 = require("../../../../src/connectors/defira/defira.config");
const defira_v2_router_abi_json_1 = require("../../../../src/connectors/defira/defira_v2_router_abi.json");
let harmony;
let defira;
const WONE = new sdk_core_1.Token(3, '0x1E120B3b4aF96e7F394ECAF84375b1C661830013', 18, 'WONE');
const ETH = new sdk_core_1.Token(3, '0x7466d7d0C21Fa05F32F5a0Fa27e12bdC06348Ce2', 18, 'ETH');
let mockProvider;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    harmony = harmony_1.Harmony.getInstance('testnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    defira = defira_1.Defira.getInstance('harmony', 'testnet');
    yield defira.init();
}));
beforeEach(() => {
    mockProvider = new MockProvider();
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield harmony.close();
}));
const patchMockProvider = () => {
    mockProvider.setMockContract(defira_config_1.DefiraConfig.config.routerAddress('testnet'), defira_v2_router_abi_json_1.abi);
    (0, patch_1.patch)(defira, 'provider', () => {
        return mockProvider;
    });
};
const patchFetchData = () => {
    (0, patch_1.patch)(defira, 'fetchPairData', () => {
        return new defira_sdk_2.Pair(sdk_core_1.CurrencyAmount.fromRawAmount(WONE, '2000000000000000000'), sdk_core_1.CurrencyAmount.fromRawAmount(ETH, '1000000000000000000'));
    });
};
const patchTrade = (key, error) => {
    (0, patch_1.patch)(defira_sdk_2.Trade, key, () => {
        if (error)
            return [];
        const WONE_ETH = new defira_sdk_2.Pair(sdk_core_1.CurrencyAmount.fromRawAmount(WONE, '2000000000000000000'), sdk_core_1.CurrencyAmount.fromRawAmount(ETH, '1000000000000000000'));
        const ETH_TO_WONE = new defira_sdk_2.Route([WONE_ETH], ETH, WONE);
        return [
            new defira_sdk_2.Trade(ETH_TO_WONE, sdk_core_1.CurrencyAmount.fromRawAmount(ETH, '1000000000000000'), sdk_core_1.TradeType.EXACT_INPUT),
        ];
    });
};
describe('verify defira gasLimitEstimate', () => {
    it('Should initially match the config for mainnet', () => {
        expect(defira.gasLimitEstimate).toEqual(defira_config_1.DefiraConfig.config.gasLimitEstimate());
    });
});
describe('verify defira getAllowedSlippage', () => {
    it('Should parse simple fractions', () => {
        expect(defira.getAllowedSlippage('3/100')).toEqual(new sdk_core_1.Percent('3', '100'));
    });
});
describe('verify defira factory', () => {
    const expectedFactoryAddress = defira_sdk_1.FACTORY_ADDRESS;
    beforeEach(() => {
        patchMockProvider();
        mockProvider.stub(defira_config_1.DefiraConfig.config.routerAddress('testnet'), 'factory', expectedFactoryAddress);
    });
    it('Returns the factory address via the provider', () => __awaiter(void 0, void 0, void 0, function* () {
        const factoryAddress = yield defira.factory;
        expect(factoryAddress).toEqual(expectedFactoryAddress);
    }));
});
describe('verify defira initCodeHash', () => {
    it('Should return the testnet factory initCodeHash', () => {
        expect(defira.initCodeHash).toEqual(defira_config_1.DefiraConfig.config.initCodeHash('testnet'));
    });
});
describe('verify defira estimateSellTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn');
        const expectedTrade = yield defira.estimateSellTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should throw an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactIn', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield defira.estimateSellTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify defira estimateBuyTrade', () => {
    it('Should return an ExpectedTrade when available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut');
        const expectedTrade = yield defira.estimateBuyTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        expect(expectedTrade).toHaveProperty('trade');
        expect(expectedTrade).toHaveProperty('expectedAmount');
    }));
    it('Should return an error if no pair is available', () => __awaiter(void 0, void 0, void 0, function* () {
        patchFetchData();
        patchTrade('bestTradeExactOut', new Error('error getting trade'));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield defira.estimateBuyTrade(WONE, ETH, ethers_1.BigNumber.from(1));
        })).rejects.toThrow(error_handler_1.UniswapishPriceError);
    }));
});
describe('verify defira Token List', () => {
    it('Should return a token by address', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = defira.getTokenByAddress(ETH.address);
        expect(token).toBeInstanceOf(sdk_core_1.Token);
    }));
});
//# sourceMappingURL=defira.test.js.map