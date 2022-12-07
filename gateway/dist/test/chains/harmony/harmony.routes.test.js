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
const patch_1 = require("../../services/patch");
const app_1 = require("../../../src/app");
const error_handler_1 = require("../../../src/services/error-handler");
const transactionSuccesful = __importStar(require("../ethereum/fixtures/transaction-succesful.json"));
const transactionSuccesfulReceipt = __importStar(require("../ethereum/fixtures/transaction-succesful-receipt.json"));
const transactionOutOfGas = __importStar(require("../ethereum/fixtures/transaction-out-of-gas.json"));
const transactionOutOfGasReceipt = __importStar(require("../ethereum/fixtures/transaction-out-of-gas-receipt.json"));
const harmony_1 = require("../../../src/chains/harmony/harmony");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
let harmony;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    harmony = harmony_1.Harmony.getInstance('testnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    yield harmony.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield harmony.close();
}));
const address = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
const patchGetWallet = () => {
    (0, patch_1.patch)(harmony, 'getWallet', () => {
        return {
            address,
        };
    });
};
const patchGetNonce = () => {
    (0, patch_1.patch)(harmony.nonceManager, 'getNonce', () => 2);
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(harmony, 'getTokenBySymbol', () => {
        return {
            chainId: 1666600000,
            address: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
            decimals: 18,
            name: 'Wrapped ONE',
            symbol: 'WONE',
            logoURI: 'https://raw.githubusercontent.com/sushiswap/icons/master/token/one.jpg',
        };
    });
};
const patchApproveERC20 = (tx_type) => {
    const default_tx = {
        type: 2,
        chainId: 1666600000,
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
        from: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        confirmations: 0,
    };
    if (tx_type === 'overwritten_tx') {
        default_tx.hash =
            '0x5a1ed682d0d7a58fbd7828bbf5994cd024feb8895d4da82c741ec4a191b9e849';
    }
    (0, patch_1.patch)(harmony, 'approveERC20', () => {
        return default_tx;
    });
};
const patchGetERC20Allowance = () => {
    (0, patch_1.patch)(harmony, 'getERC20Allowance', () => ({ value: 1, decimals: 3 }));
};
const patchGetNativeBalance = () => {
    (0, patch_1.patch)(harmony, 'getNativeBalance', () => ({ value: 1, decimals: 3 }));
};
const patchGetERC20Balance = () => {
    (0, patch_1.patch)(harmony, 'getERC20Balance', () => ({ value: 1, decimals: 3 }));
};
describe('POST /evm/nonce', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetNonce();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/nonce`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address,
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.nonce).toBe(2));
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/nonce`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address: 'da857cbda0ba96757fed842617a4',
        })
            .expect(404);
    }));
});
describe('POST /evm/approve', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        harmony.getContract = jest.fn().mockReturnValue({
            address,
        });
        (0, patch_1.patch)(harmony.nonceManager, 'getNonce', () => 115);
        patchGetTokenBySymbol();
        patchApproveERC20();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/approve`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address,
            spender: 'sushiswap',
            token: 'SUSHI',
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
            expect(res.body.nonce).toEqual(115);
        });
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/approve`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address,
            spender: 'sushiswap',
            token: 123,
            nonce: '23',
        })
            .expect(404);
    }));
});
describe('POST /evm/allowances', () => {
    it('should return 200 asking for allowances', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetTokenBySymbol();
        const spender = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
        harmony.getSpender = jest.fn().mockReturnValue(spender);
        harmony.getContract = jest.fn().mockReturnValue({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        });
        patchGetERC20Allowance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/allowances`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            spender: spender,
            tokenSymbols: ['WETH', 'DAI'],
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.spender).toEqual(spender))
            .expect((res) => expect(res.body.approvals.WETH).toEqual('0.001'))
            .expect((res) => expect(res.body.approvals.DAI).toEqual('0.001'));
    }));
});
describe('POST /network/balances', () => {
    it('should return 200 asking for supported tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetTokenBySymbol();
        patchGetNativeBalance();
        patchGetERC20Balance();
        harmony.getContract = jest.fn().mockReturnValue({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/network/balances`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            tokenSymbols: ['WETH', 'DAI'],
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.balances.WETH).toBeDefined())
            .expect((res) => expect(res.body.balances.DAI).toBeDefined());
    }));
});
describe('POST /evm/cancel', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        harmony.getWallet = jest.fn().mockReturnValue({
            address,
        });
        harmony.cancelTx = jest.fn().mockReturnValue({
            hash: '0xf6b9e7cec507cb3763a1179ff7e2a88c6008372e3a6f297d9027a0b39b0fff77',
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/cancel`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address,
            nonce: 23,
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
            expect(res.body.txHash).toEqual('0xf6b9e7cec507cb3763a1179ff7e2a88c6008372e3a6f297d9027a0b39b0fff77');
        });
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/cancel`)
            .send({
            chain: 'harmony',
            network: 'testnet',
            address: '',
            nonce: '23',
        })
            .expect(404);
    }));
});
describe('POST /network/poll', () => {
    it('should get a NETWORK_ERROR_CODE when the network is unavailable', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => {
            const error = new Error('something went wrong');
            error.code = 'NETWORK_ERROR';
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.NETWORK_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.NETWORK_ERROR_MESSAGE);
    }));
    it('should get a UNKNOWN_ERROR_ERROR_CODE when an unknown error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => {
            throw new Error();
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
    }));
    it('should get an OUT of GAS error for failed out of gas transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(harmony, 'getTransaction', () => transactionOutOfGas);
        (0, patch_1.patch)(harmony, 'getTransactionReceipt', () => transactionOutOfGasReceipt);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.OUT_OF_GAS_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.OUT_OF_GAS_ERROR_MESSAGE);
    }));
    it('should get a null in txReceipt for Tx in the mempool', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(harmony, 'getTransaction', () => transactionOutOfGas);
        (0, patch_1.patch)(harmony, 'getTransactionReceipt', () => null);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toEqual(null);
        expect(res.body.txData).toBeDefined();
    }));
    it('should get a null in txReceipt and txData for Tx that didnt reach the mempool and TxReceipt is null', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(harmony, 'getTransaction', () => null);
        (0, patch_1.patch)(harmony, 'getTransactionReceipt', () => null);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toEqual(null);
        expect(res.body.txData).toEqual(null);
    }));
    it('should get txStatus = 1 for a succesful query', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(harmony, 'getTransaction', () => transactionSuccesful);
        (0, patch_1.patch)(harmony, 'getTransactionReceipt', () => transactionSuccesfulReceipt);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x6d068067a5e5a0f08c6395b31938893d1cdad81f54a54456221ecd8c1941294d',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toBeDefined();
        expect(res.body.txData).toBeDefined();
    }));
    it('should get unknown error', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getCurrentBlockNumber', () => {
            const error = new Error('something went wrong');
            error.code = -32006;
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'harmony',
            network: 'testnet',
            txHash: '0x2faeb1aa55f96c1db55f643a8cf19b0f76bf091d0b7d1b068d2e829414576362',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.UNKNOWN_ERROR_MESSAGE);
    }));
});
//# sourceMappingURL=harmony.routes.test.js.map