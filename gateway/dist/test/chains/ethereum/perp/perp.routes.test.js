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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const big_js_1 = require("big.js");
const sdk_curie_1 = require("@perp/sdk-curie");
const ethereum_1 = require("../../../../src/chains/ethereum/ethereum");
const perp_1 = require("../../../../src/connectors/perp/perp");
const amm_routes_1 = require("../../../../src/amm/amm.routes");
const patch_1 = require("../../../services/patch");
const base_1 = require("../../../../src/services/base");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let app;
let ethereum;
let perp, perp2;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    ethereum = ethereum_1.Ethereum.getInstance('optimism');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    yield ethereum.init();
    perp = perp_1.Perp.getInstance('ethereum', 'optimism');
    perp2 = perp_1.Perp.getInstance('ethereum', 'optimism', address);
    app.use('/amm/perp', amm_routes_1.PerpAmmRoutes.router);
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    (0, patch_1.patch)(perp, 'ready', () => {
        return true;
    });
    (0, patch_1.patch)(perp2, 'ready', () => {
        return true;
    });
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield ethereum.close();
}));
const address = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
const patchGasPrice = () => {
    (0, patch_1.patch)(ethereum, 'gasPrice', () => 100);
};
const patchMarket = () => {
    (0, patch_1.patch)(perp.perp, 'markets', () => {
        return {
            getMarket() {
                return {
                    getPrices() {
                        return {
                            markPrice: new big_js_1.Big('1'),
                            indexPrice: new big_js_1.Big('2'),
                            indexTwapPrice: new big_js_1.Big('3'),
                        };
                    },
                    getStatus() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return sdk_curie_1.MarketStatus.ACTIVE;
                        });
                    },
                };
            },
            get marketMap() {
                return {
                    AAVEUSD: 1,
                    WETHUSD: 2,
                    WBTCUSD: 3,
                };
            },
        };
    });
};
const patchPosition = () => {
    (0, patch_1.patch)(perp.perp, 'positions', () => {
        return {
            getTakerPositionByTickerSymbol() {
                return;
            },
            getTotalPendingFundingPayments() {
                return {};
            },
        };
    });
};
const patchCH = () => {
    (0, patch_1.patch)(perp.perp, 'clearingHouse', () => {
        return {
            createPositionDraft() {
                return;
            },
            openPosition() {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        transaction: {
                            type: 2,
                            chainId: 42,
                            nonce: 115,
                            maxPriorityFeePerGas: { toString: () => '106000000000' },
                            maxFeePerGas: { toString: () => '106000000000' },
                            gasPrice: { toString: () => null },
                            gasLimit: { toString: () => '100000' },
                            to: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
                            value: { toString: () => '0' },
                            data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                            accessList: [],
                            hash: '0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9',
                            v: 0,
                            r: '0xbeb9aa40028d79b9fdab108fcef5de635457a05f3a254410414c095b02c64643',
                            s: '0x5a1506fa4b7f8b4f3826d8648f27ebaa9c0ee4bd67f569414b8cd8884c073100',
                            from: address,
                            confirmations: 0,
                        },
                    };
                });
            },
            getAccountValue() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new big_js_1.Big('10');
                });
            },
        };
    });
};
describe('POST /amm/perp/market-prices', () => {
    it('should return 200 with right parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/market-prices`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            quote: 'USD',
            base: 'WETH',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.markPrice).toEqual('1');
            expect(res.body.indexPrice).toEqual('2');
            expect(res.body.indexTwapPrice).toEqual('3');
        });
    }));
    it('should return 500 with wrong paramters', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/market-prices`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perpp',
            quote: '1234',
            base: 'WETH',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /amm/perp/market-status', () => {
    it('should return 200 with right parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/market-status`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            quote: 'USD',
            base: 'WETH',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.isActive).toEqual(true);
        });
    }));
    it('should return 500 with wrong paramters', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/market-status`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perpp',
            quote: '1234',
            base: 'WETH',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /amm/perp/pairs', () => {
    it('should return list of available pairs', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/pairs`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.pairs).toEqual(['AAVEUSD', 'WETHUSD', 'WBTCUSD']);
        });
    }));
});
describe('POST /amm/perp/position', () => {
    it('should return a default object of a perp position', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPosition();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/position`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            quote: 'USD',
            base: 'WETH',
            address: address,
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body).toHaveProperty('positionAmt');
            expect(res.body).toHaveProperty('positionSide');
            expect(res.body).toHaveProperty('unrealizedProfit');
            expect(res.body).toHaveProperty('leverage');
            expect(res.body).toHaveProperty('entryPrice');
            expect(res.body).toHaveProperty('tickerSymbol');
            expect(res.body).toHaveProperty('pendingFundingPayment');
        });
    }));
});
describe('POST /amm/perp/balance', () => {
    it('should return a account value', () => __awaiter(void 0, void 0, void 0, function* () {
        patchCH();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/balance`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            address: address,
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body).toHaveProperty('balance');
        });
    }));
});
describe('POST /amm/perp/open and /amm/perp/close', () => {
    it('open should return with hash', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGasPrice();
        patchPosition();
        patchCH();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/open`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            quote: 'USD',
            base: 'WETH',
            amount: '0.01',
            side: 'LONG',
            address: address,
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body).toHaveProperty('txHash');
            expect(res.body.nonce).toEqual(115);
        });
    }));
    it('close should return error', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPosition();
        patchCH();
        yield (0, supertest_1.default)(app)
            .post(`/amm/perp/close`)
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
            quote: 'USD',
            base: 'WETH',
            address: address,
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /amm/perp/estimateGas', () => {
    it('should return 200 with right parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGasPrice();
        yield (0, supertest_1.default)(app)
            .post('/amm/perp/estimateGas')
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'perp',
        })
            .set('Accept', 'application/json')
            .expect(200)
            .then((res) => {
            expect(res.body.network).toEqual('optimism');
            expect(res.body.gasPrice).toEqual(100);
            expect(res.body.gasCost).toEqual((0, base_1.gasCostInEthString)(100, perp.gasLimit));
        });
    }));
    it('should return 500 for invalid connector', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGasPrice();
        yield (0, supertest_1.default)(app)
            .post('/amm/perp/estimateGas')
            .send({
            chain: 'ethereum',
            network: 'optimism',
            connector: 'pangolin',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
//# sourceMappingURL=perp.routes.test.js.map