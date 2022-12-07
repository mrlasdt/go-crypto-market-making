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
const avalanche_1 = require("../../../../src/chains/avalanche/avalanche");
const openocean_1 = require("../../../../src/connectors/openocean/openocean");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
const patch_1 = require("../../../services/patch");
const base_1 = require("../../../../src/services/base");
const amm_routes_1 = require("../../../../src/amm/amm.routes");
const express_1 = __importDefault(require("express"));
let app;
let avalanche;
let openocean;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    avalanche = avalanche_1.Avalanche.getInstance('avalanche');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    yield avalanche.init();
    openocean = openocean_1.Openocean.getInstance('avalanche', 'avalanche');
    yield openocean.init();
    app.use('/amm', amm_routes_1.AmmRoutes.router);
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
const address = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
const patchGetWallet = () => {
    (0, patch_1.patch)(avalanche, 'getWallet', () => {
        return {
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        };
    });
};
const patchInit = () => {
    (0, patch_1.patch)(openocean, 'init', () => __awaiter(void 0, void 0, void 0, function* () {
        return;
    }));
};
const patchStoredTokenList = () => {
    (0, patch_1.patch)(avalanche, 'tokenList', () => {
        return [
            {
                chainId: 43114,
                name: 'USDC',
                symbol: 'USDC',
                address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                decimals: 6,
            },
            {
                chainId: 43114,
                name: 'sAVAX',
                symbol: 'sAVAX',
                address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
                decimals: 18,
            },
        ];
    });
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(avalanche, 'getTokenBySymbol', (symbol) => {
        if (symbol === 'USDC') {
            return {
                chainId: 43114,
                name: 'USDC',
                symbol: 'USDC',
                address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                decimals: 6,
            };
        }
        else {
            return {
                chainId: 43114,
                name: 'sAVAX',
                symbol: 'sAVAX',
                address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
                decimals: 18,
            };
        }
    });
};
const patchGetTokenByAddress = () => {
    (0, patch_1.patch)(openocean, 'getTokenByAddress', () => {
        return {
            chainId: 43114,
            name: 'USDC',
            symbol: 'USDC',
            address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            decimals: 6,
        };
    });
};
const patchGasPrice = () => {
    (0, patch_1.patch)(avalanche, 'gasPrice', () => 100);
};
const patchEstimateBuyTrade = () => {
    (0, patch_1.patch)(openocean, 'estimateBuyTrade', () => {
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
    (0, patch_1.patch)(openocean, 'estimateSellTrade', () => {
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
    (0, patch_1.patch)(avalanche.nonceManager, 'getNonce', () => 21);
};
const patchExecuteTrade = () => {
    (0, patch_1.patch)(openocean, 'executeTrade', () => {
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
            side: 'BUY',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.amount).toEqual('0.010000');
            expect(res.body.rawAmount).toEqual('10000');
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.amount).toEqual('10000.000000');
            expect(res.body.rawAmount).toEqual('10000000000');
        });
    }));
    it('should return 500 for unrecognized quote symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        (0, patch_1.patch)(avalanche, 'getTokenBySymbol', (symbol) => {
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 for unrecognized base symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchStoredTokenList();
        (0, patch_1.patch)(avalanche, 'getTokenBySymbol', (symbol) => {
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 for unrecognized base symbol with decimals in the amount and SELL', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10.000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 for unrecognized base symbol with decimals in the amount and BUY', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10.000',
            side: 'BUY',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 when the priceSwapIn operation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        (0, patch_1.patch)(openocean, 'priceSwapIn', () => {
            return 'error';
        });
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10000',
            side: 'SELL',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 500 when the priceSwapOut operation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        (0, patch_1.patch)(openocean, 'priceSwapOut', () => {
            return 'error';
        });
        yield (0, supertest_1.default)(app)
            .post(`/amm/price`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'bDAI',
            amount: '10000',
            side: 'BUY',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
            address,
            side: 'BUY',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 200 for BUY with maxFeePerGas and maxPriorityFeePerGas', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
            amount: 10000,
            address: 'da8',
            side: 'comprar',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
    it('should return 500 when base token is unknown', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForSell();
        (0, patch_1.patch)(avalanche, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'USDC') {
                return {
                    chainId: 43114,
                    name: 'USDC',
                    symbol: 'USDC',
                    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                    decimals: 6,
                };
            }
            else {
                return null;
            }
        });
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
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
        (0, patch_1.patch)(avalanche, 'getTokenBySymbol', (symbol) => {
            if (symbol === 'USDC') {
                return {
                    chainId: 43114,
                    name: 'USDC',
                    symbol: 'USDC',
                    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                    decimals: 6,
                };
            }
            else {
                return null;
            }
        });
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'BITCOIN',
            base: 'USDC',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'USDC',
            base: 'sAVAX',
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
        yield (0, supertest_1.default)(app)
            .post(`/amm/trade`)
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
            quote: 'sAVAX',
            base: 'USDC',
            amount: '0.01',
            address,
            side: 'BUY',
            nonce: 21,
            limitPrice: '9',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /amm/estimateGas', () => {
    it('should return 200 for valid connector', () => __awaiter(void 0, void 0, void 0, function* () {
        patchInit();
        patchGasPrice();
        yield (0, supertest_1.default)(app)
            .post('/amm/estimateGas')
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'openocean',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.network).toEqual('avalanche');
            expect(res.body.gasPrice).toEqual(100);
            expect(res.body.gasCost).toEqual((0, base_1.gasCostInEthString)(100, openocean.gasLimitEstimate));
        });
    }));
    it('should return 500 for invalid connector', () => __awaiter(void 0, void 0, void 0, function* () {
        patchInit();
        patchGasPrice();
        yield (0, supertest_1.default)(app)
            .post('/amm/estimateGas')
            .send({
            chain: 'avalanche',
            network: 'avalanche',
            connector: 'sushiswap',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
//# sourceMappingURL=openocean.routes.test.js.map