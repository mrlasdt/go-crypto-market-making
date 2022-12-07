"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const near_1 = require("../../../src/chains/near/near");
const patch_1 = require("../../services/patch");
const app_1 = require("../../../src/app");
const error_handler_1 = require("../../../src/services/error-handler");
const transactionSuccesful = __importStar(require("./fixtures/getTransaction.json"));
let near;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    near = near_1.Near.getInstance('testnet');
}));
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield near.close();
}));
const patchGetWallet = () => {
    (0, patch_1.patch)(near, 'getWallet', () => {
        return {
            address: 'test.near',
        };
    });
};
const patchGetFTBalance = () => {
    (0, patch_1.patch)(near, 'getFungibleTokenBalance', () => '0.01');
};
const patchGetNativeBalance = () => {
    (0, patch_1.patch)(near, 'getNativeBalance', () => '0.01');
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(near, 'getTokenBySymbol', (symbol) => {
        let result;
        switch (symbol) {
            case 'WETH':
                result = {
                    chainId: 42,
                    name: 'WETH',
                    symbol: 'WETH',
                    address: 'weth.near',
                    decimals: 18,
                };
                break;
            case 'DAI':
                result = {
                    chainId: 42,
                    name: 'DAI',
                    symbol: 'DAI',
                    address: 'dai.near',
                    decimals: 18,
                };
                break;
        }
        return result;
    });
};
describe('POST /near/balances', () => {
    it('should return 500 for unsupported tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetTokenBySymbol();
        patchGetNativeBalance();
        patchGetFTBalance();
        near.getContract = jest.fn().mockReturnValue({
            address: 'test.near',
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/near/balances`)
            .send({
            chain: 'near',
            network: 'testnet',
            address: 'test.near',
            tokenSymbols: ['XXX', 'YYY'],
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(500);
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/near/balances`)
            .send({
            chain: 'near',
            network: 'testnet',
            address: 'da857cbda0ba96757fed842617a4',
        })
            .expect(404);
    }));
});
describe('POST /near/poll', () => {
    it('should get a NETWORK_ERROR_CODE when the network is unavailable', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => {
            const error = new Error('somnearing went wrong');
            error.code = 'NETWORK_ERROR';
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/near/poll').send({
            address: 'test.near',
            network: 'testnet',
            txHash: '2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.NETWORK_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.NETWORK_ERROR_MESSAGE);
    }));
    it('should get a UNKNOWN_ERROR_ERROR_CODE when an unknown error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => {
            throw new Error();
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/near/poll').send({
            address: 'test.near',
            network: 'testnet',
            txHash: '2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
    }));
    it('should get txStatus = 1 for a succesful query', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(near, 'getTransaction', () => transactionSuccesful);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/near/poll').send({
            address: 'test.near',
            network: 'testnet',
            txHash: '0x6d068067a5e5a0f08c6395b31938893d1cdad81f54a54456221ecd8c1941294d',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toBeDefined();
    }));
    it('should get an RATE_LIMIT_ERROR_CODE when the blockchain API is rate limited', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => {
            const error = new Error('daily request count exceeded, request rate limited');
            error.code = -32005;
            error.data = {
                see: 'https://infura.io/docs/near/jsonrpc/ratelimits',
                current_rps: 13.333,
                allowed_rps: 10.0,
                backoff_seconds: 30.0,
            };
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/near/poll').send({
            address: 'test.near',
            network: 'testnet',
            txHash: '2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.RATE_LIMIT_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.RATE_LIMIT_ERROR_MESSAGE);
    }));
    it('should get unknown error', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => {
            const error = new Error('somnearing went wrong');
            error.code = -32006;
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/near/poll').send({
            address: 'test.near',
            network: 'testnet',
            txHash: '2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.UNKNOWN_ERROR_MESSAGE);
    }));
});
//# sourceMappingURL=near.routes.test.js.map