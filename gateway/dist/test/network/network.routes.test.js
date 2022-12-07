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
const app_1 = require("../../src/app");
const avalanche_1 = require("../../src/chains/avalanche/avalanche");
const cronos_1 = require("../../src/chains/cronos/cronos");
const ethereum_1 = require("../../src/chains/ethereum/ethereum");
const harmony_1 = require("../../src/chains/harmony/harmony");
const polygon_1 = require("../../src/chains/polygon/polygon");
const evm_nonce_mock_1 = require("../evm.nonce.mock");
const patch_1 = require("../services/patch");
let eth;
let goerli;
let avalanche;
let harmony;
let polygon;
let cronos;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    eth = ethereum_1.Ethereum.getInstance('kovan');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(eth.nonceManager);
    yield eth.init();
    goerli = ethereum_1.Ethereum.getInstance('goerli');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(goerli.nonceManager);
    yield goerli.init();
    avalanche = avalanche_1.Avalanche.getInstance('fuji');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    yield avalanche.init();
    harmony = harmony_1.Harmony.getInstance('testnet');
    yield harmony.init();
    polygon = polygon_1.Polygon.getInstance('mumbai');
    yield polygon.init();
    cronos = cronos_1.Cronos.getInstance('testnet');
    yield cronos.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(eth.nonceManager);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(goerli.nonceManager);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(avalanche.nonceManager);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(polygon.nonceManager);
    (0, evm_nonce_mock_1.patchEVMNonceManager)(cronos.nonceManager);
});
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, patch_1.unpatch)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield eth.close();
    yield goerli.close();
    yield avalanche.close();
    yield harmony.close();
    yield polygon.close();
    yield cronos.close();
}));
describe('GET /network/status', () => {
    it('should return 200 when asking for harmony network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'chain', () => {
            return 'testnet';
        });
        (0, patch_1.patch)(harmony, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(harmony, 'chainId', 88);
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => {
            return 3;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'harmony',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('testnet'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when asking for ethereum network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'chain', () => {
            return 'kovan';
        });
        (0, patch_1.patch)(eth, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(eth, 'chainId', 34);
        (0, patch_1.patch)(eth, 'getCurrentBlockNumber', () => {
            return 1;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'ethereum',
            network: 'kovan',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('kovan'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when asking for goerli network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(goerli, 'chain', () => {
            return 'goerli';
        });
        (0, patch_1.patch)(goerli, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(goerli, 'chainId', 5);
        (0, patch_1.patch)(goerli, 'getCurrentBlockNumber', () => {
            return 1;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'ethereum',
            network: 'goerli',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('goerli'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when asking for avalance network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(avalanche, 'chain', () => {
            return 'fuji';
        });
        (0, patch_1.patch)(avalanche, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(avalanche, 'chainId', 20);
        (0, patch_1.patch)(avalanche, 'getCurrentBlockNumber', () => {
            return 2;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'avalanche',
            network: 'fuji',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('fuji'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when asking for polygon network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(polygon, 'chain', () => {
            return 'mumbai';
        });
        (0, patch_1.patch)(polygon, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(polygon, 'chainId', 80001);
        (0, patch_1.patch)(polygon, 'getCurrentBlockNumber', () => {
            return 2;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'polygon',
            network: 'mumbai',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('mumbai'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when asking for cronos network status', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(cronos, 'chain', () => {
            return 'testnet';
        });
        (0, patch_1.patch)(cronos, 'rpcUrl', 'http://...');
        (0, patch_1.patch)(cronos, 'chainId', 338);
        (0, patch_1.patch)(cronos, 'getCurrentBlockNumber', () => {
            return 2;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'cronos',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.chain).toBe('testnet'))
            .expect((res) => expect(res.body.chainId).toBeDefined())
            .expect((res) => expect(res.body.rpcUrl).toBeDefined())
            .expect((res) => expect(res.body.currentBlockNumber).toBeDefined());
    }));
    it('should return 200 when requesting network status without specifying', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getCurrentBlockNumber', () => {
            return 212;
        });
        (0, patch_1.patch)(avalanche, 'getCurrentBlockNumber', () => {
            return 204;
        });
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => {
            return 100;
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(Array.isArray(res.body)).toEqual(true));
    }));
    it('should return 500 when asking for invalid network', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/status`)
            .query({
            chain: 'hello',
        })
            .expect(500);
    }));
});
describe('GET /network/config', () => {
    it('should return 200 when asking for config', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/config`)
            .expect('Content-Type', /json/)
            .expect(200);
    }));
});
describe('GET /network/tokens', () => {
    it('should return 200 when retrieving ethereum-kovan tokens, tokenSymbols parameter not provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'ethereum',
            network: 'kovan',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving ethereum-kovan tokens, s parameter provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'ethereum',
            network: 'kovan',
            tokenSymbols: ['COIN3', 'COIN1'],
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving ethereum-goerli tokens, tokenSymbols parameter not provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'ethereum',
            network: 'goerli',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving ethereum-goerli tokens, tokenSymbols parameter provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'ethereum',
            network: 'goerli',
            tokenSymbols: ['WETH', 'DAI'],
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving polygon-mumbai tokens, tokenSymbols parameter not provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'polygon',
            network: 'mumbai',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving polygon-mumbai tokens, tokenSymbols parameter provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'polygon',
            network: 'mumbai',
            tokenSymbols: ['WMATIC', 'WETH'],
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving cronos-testnet tokens, tokenSymbols parameter not provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'cronos',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 200 when retrieving cronos-testnet tokens, tokenSymbols parameter provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'cronos',
            network: 'testnet',
            tokenSymbols: ['WCRO', 'WETH'],
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('should return 500 when retrieving tokens for invalid chain', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/network/tokens`)
            .query({
            chain: 'unknown',
            network: 'kovan',
        })
            .expect(500);
    }));
});
//# sourceMappingURL=network.routes.test.js.map