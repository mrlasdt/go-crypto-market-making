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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const patch_1 = require("../../../services/patch");
const app_1 = require("../../../../src/app");
const cronos_1 = require("../../../../src/chains/cronos/cronos");
const vvs_1 = require("../../../../src/connectors/vvs/vvs");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let cronos;
let vvs;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    cronos = cronos_1.Cronos.getInstance('mainnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(cronos.nonceManager);
    yield cronos.init();
    vvs = vvs_1.VVSConnector.getInstance('cronos', 'mainnet');
    yield vvs.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(cronos.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield cronos.close();
}));
const address = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
const patchGetWallet = () => {
    (0, patch_1.patch)(cronos, 'getWallet', () => {
        return {
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        };
    });
};
const patchStoredTokenList = () => {
    (0, patch_1.patch)(cronos, 'tokenList', () => {
        return [
            {
                chainId: 43114,
                name: 'WETH',
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
            },
            {
                chainId: 43114,
                name: 'Wrapped AVAX',
                symbol: 'WAVAX',
                address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
                decimals: 18,
            },
        ];
    });
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(cronos, 'getTokenBySymbol', (symbol) => {
        if (symbol === 'WETH') {
            return {
                chainId: 43114,
                name: 'WETH',
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
            };
        }
        else {
            return {
                chainId: 42,
                name: 'WAVAX',
                symbol: 'WAVAX',
                address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                decimals: 18,
            };
        }
    });
};
const patchGetTokenByAddress = () => {
    (0, patch_1.patch)(vvs, 'getTokenByAddress', () => {
        return {
            chainId: 43114,
            name: 'WETH',
            symbol: 'WETH',
            address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
            decimals: 18,
        };
    });
};
const patchGasPrice = () => {
    (0, patch_1.patch)(cronos, 'gasPrice', () => 100);
};
const patchEstimateBuyTrade = () => {
    (0, patch_1.patch)(vvs, 'estimateBuyTrade', () => {
        return {
            expectedAmount: {
                toSignificant: () => 100,
            },
            trade: {
                executionPrice: {
                    invert: jest.fn().mockReturnValue({
                        toSignificant: () => 100,
                        toFixed: () => '100',
                    }),
                },
            },
        };
    });
};
const patchEstimateSellTrade = () => {
    (0, patch_1.patch)(vvs, 'estimateSellTrade', () => {
        return {
            expectedAmount: {
                toSignificant: () => 100,
            },
            trade: {
                executionPrice: {
                    toSignificant: () => 100,
                    toFixed: () => '100',
                },
            },
        };
    });
};
const patchGetNonce = () => {
    (0, patch_1.patch)(cronos.nonceManager, 'getNonce', () => 21);
};
const patchExecuteTrade = () => {
    (0, patch_1.patch)(vvs, 'executeTrade', () => {
        return { nonce: 21, hash: '000000000000000' };
    });
};
describe('POST /amm/price', () => {
    it('should return 200 for BUY', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchEstimateBuyTrade();
        patchGetNonce();
        patchExecuteTrade();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/price`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            side: 'BUY',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.amount).toEqual('10000.000000000000000000');
            expect(res.body.rawAmount).toEqual('10000000000000000000000');
        });
    }));
    it('should return 200 for SELL', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchEstimateSellTrade();
        patchGetNonce();
        patchExecuteTrade();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/price`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.amount).toEqual('10000.000000000000000000');
            expect(res.body.rawAmount).toEqual('10000000000000000000000');
        });
    }));
    it('should return 500 for unrecognized quote symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        (0, patch_1.patch)(cronos, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'WETH') {
                return {
                    chainId: 43114,
                    name: 'WETH',
                    symbol: 'WETH',
                    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                    decimals: 18,
                };
            }
            else {
                return null;
            }
        });
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/price`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'DOGE',
            base: 'WETH',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 for unrecognized base symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        (0, patch_1.patch)(cronos, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'WETH') {
                return {
                    chainId: 43114,
                    name: 'WETH',
                    symbol: 'WETH',
                    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                    decimals: 18,
                };
            }
            else {
                return null;
            }
        });
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/price`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'SHIBA',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /amm/trade', () => {
    const patchForBuy = () => {
        patchGetWallet();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchEstimateBuyTrade();
        patchGetNonce();
        patchExecuteTrade();
    };
    it('should return 200 for BUY', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.nonce).toEqual(21);
        });
    }));
    it('should return 200 for BUY without nonce parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 200 for BUY with maxFeePerGas and maxPriorityFeePerGas', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
            maxFeePerGas: '5000000000',
            maxPriorityFeePerGas: '5000000000',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    const patchForSell = () => {
        patchGetWallet();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchEstimateSellTrade();
        patchGetNonce();
        patchExecuteTrade();
    };
    it('should return 200 for SELL', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'SELL',
            nonce: 21,
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.nonce).toEqual(21);
        });
    }));
    it('should return 200 for SELL  with maxFeePerGas and maxPriorityFeePerGas', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'SELL',
            nonce: 21,
            maxFeePerGas: '5000000000',
            maxPriorityFeePerGas: '5000000000',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 404 when parameters are incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: 10000,
            address: 'da8',
            side: 'comprar',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
    it('should return 500 when base token is unknown', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        (0, patch_1.patch)(cronos, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'WETH') {
                return {
                    chainId: 43114,
                    name: 'WETH',
                    symbol: 'WETH',
                    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                    decimals: 18,
                };
            }
            else {
                return null;
            }
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WETH',
            base: 'BITCOIN',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
            maxFeePerGas: '5000000000',
            maxPriorityFeePerGas: '5000000000',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 when quote token is unknown', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        (0, patch_1.patch)(cronos, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'WETH') {
                return {
                    chainId: 43114,
                    name: 'WETH',
                    symbol: 'WETH',
                    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                    decimals: 18,
                };
            }
            else {
                return null;
            }
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'BITCOIN',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
            maxFeePerGas: '5000000000',
            maxPriorityFeePerGas: '5000000000',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 200 for SELL with limitPrice', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'SELL',
            nonce: 21,
            limitPrice: '9',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 200 for BUY with limitPrice', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
            limitPrice: '999999999999999999999',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 200 for SELL with price higher than limitPrice', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'SELL',
            nonce: 21,
            limitPrice: '99999999999',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 200 for BUY with price less than limitPrice', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/amm/trade`)
            .send({
            chain: 'cronos',
            network: 'mainnet',
            connector: 'vvs',
            quote: 'WAVAX',
            base: 'WETH',
            amount: '10000',
            address,
            side: 'BUY',
            nonce: 21,
            limitPrice: '9',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
//# sourceMappingURL=vvs.routes.test.js.map