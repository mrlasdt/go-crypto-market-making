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
const transactionSuccesfulReceipt = __importStar(require("../ethereum//fixtures/transaction-succesful-receipt.json"));
const transactionOutOfGas = __importStar(require("../ethereum//fixtures/transaction-out-of-gas.json"));
const transactionOutOfGasReceipt = __importStar(require("../ethereum/fixtures/transaction-out-of-gas-receipt.json"));
const binance_smart_chain_1 = require("../../../src/chains/binance-smart-chain/binance-smart-chain");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
let bsc;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    bsc = binance_smart_chain_1.BinanceSmartChain.getInstance('testnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(bsc.nonceManager);
    yield bsc.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(bsc.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield bsc.close();
}));
const address = '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD';
const patchGetWallet = () => {
    (0, patch_1.patch)(bsc, 'getWallet', () => {
        return {
            address,
        };
    });
};
const patchGetNonce = () => {
    (0, patch_1.patch)(bsc.nonceManager, 'getNonce', () => 0);
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(bsc, 'getTokenBySymbol', () => {
        return {
            chainId: 97,
            address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
            decimals: 18,
            name: 'WBNB Token',
            symbol: 'WBNB',
            logoURI: 'https://exchange.pancakeswap.finance/images/coins/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
        };
    });
};
const patchApproveERC20 = () => {
    (0, patch_1.patch)(bsc, 'approveERC20', () => {
        return {
            type: 2,
            chainId: 97,
            nonce: 0,
            maxPriorityFeePerGas: { toString: () => '106000000000' },
            maxFeePerGas: { toString: () => '106000000000' },
            gasPrice: { toString: () => null },
            gasLimit: { toString: () => '66763' },
            to: '0x8babbb98678facc7342735486c851abd7a0d17ca',
            value: { toString: () => '0' },
            data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            accessList: [],
            hash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
            v: 229,
            r: '0x8800b16cbc6d468acad057dd5f724944d6aa48543cd90472e28dd5c6e90268b1',
            s: '0x662ed86bb86fb40911738ab67785f6e6c76f1c989d977ca23c504ef7a4796d08',
            from: '0x242532ebdfcc760f2ddfe8378eb51f5f847ce5bd',
            confirmations: 98,
        };
    });
};
const patchGetERC20Allowance = () => {
    (0, patch_1.patch)(bsc, 'getERC20Allowance', () => ({ value: 1, decimals: 3 }));
};
const patchGetNativeBalance = () => {
    (0, patch_1.patch)(bsc, 'getNativeBalance', () => ({ value: 1, decimals: 3 }));
};
const patchGetERC20Balance = () => {
    (0, patch_1.patch)(bsc, 'getERC20Balance', () => ({ value: 1, decimals: 3 }));
};
describe('POST /evm/approve', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        bsc.getContract = jest.fn().mockReturnValue({
            address,
        });
        patchGetNonce();
        patchGetTokenBySymbol();
        patchApproveERC20();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/approve`)
            .send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            address,
            spender: address,
            token: 'BNB',
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
            expect(res.body.nonce).toEqual(0);
        });
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/approve`)
            .send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            address,
            spender: address,
            token: 123,
            nonce: '23',
        })
            .expect(404);
    }));
});
describe('POST /evm/nonce', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetNonce();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/nonce`)
            .send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            address,
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.nonce).toBe(0));
    }));
});
describe('POST /evm/allowances', () => {
    it('should return 200 asking for allowances', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetTokenBySymbol();
        const spender = '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD';
        bsc.getSpender = jest.fn().mockReturnValue(spender);
        bsc.getContract = jest.fn().mockReturnValue({
            address: '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD',
        });
        patchGetERC20Allowance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/allowances`)
            .send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            address: '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD',
            spender: spender,
            tokenSymbols: ['BNB', 'DAI'],
        })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.spender).toEqual(spender))
            .expect((res) => expect(res.body.approvals.BNB).toEqual('0.001'))
            .expect((res) => expect(res.body.approvals.DAI).toEqual('0.001'));
    }));
});
describe('POST /network/balances', () => {
    it('should return 200 asking for supported tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchGetTokenBySymbol();
        patchGetNativeBalance();
        patchGetERC20Balance();
        bsc.getContract = jest.fn().mockReturnValue({
            address: '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD',
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/network/balances`)
            .send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            address: '0x242532ebDfcc760f2Ddfe8378eB51f5F847CE5bD',
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
        bsc.getWallet = jest.fn().mockReturnValue({
            address,
        });
        bsc.cancelTx = jest.fn().mockReturnValue({
            hash: '0xf6b9e7cec507cb3763a1179ff7e2a88c6008372e3a6f297d9027a0b39b0fff77',
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/evm/cancel`)
            .send({
            chain: 'binance-smart-chain',
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
            chain: 'binance-smart-chain',
            network: 'testnet',
            address: '',
            nonce: '23',
        })
            .expect(404);
    }));
});
describe('POST /network/poll', () => {
    it('should get a NETWORK_ERROR_CODE when the network is unavailable', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => {
            const error = new Error('something went wrong');
            error.code = 'NETWORK_ERROR';
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.NETWORK_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.NETWORK_ERROR_MESSAGE);
    }));
    it('should get a UNKNOWN_ERROR_ERROR_CODE when an unknown error is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => {
            throw new Error();
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
    }));
    it('should get an OUT of GAS error for failed out of gas transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(bsc, 'getTransaction', () => transactionOutOfGas);
        (0, patch_1.patch)(bsc, 'getTransactionReceipt', () => transactionOutOfGasReceipt);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.OUT_OF_GAS_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.OUT_OF_GAS_ERROR_MESSAGE);
    }));
    it('should get a null in txReceipt for Tx in the mempool', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(bsc, 'getTransaction', () => transactionOutOfGas);
        (0, patch_1.patch)(bsc, 'getTransactionReceipt', () => null);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toEqual(null);
        expect(res.body.txData).toBeDefined();
    }));
    it('should get a null in txReceipt and txData for Tx that didnt reach the mempool and TxReceipt is null', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(bsc, 'getTransaction', () => null);
        (0, patch_1.patch)(bsc, 'getTransactionReceipt', () => null);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toEqual(null);
        expect(res.body.txData).toEqual(null);
    }));
    it('should get txStatus = 1 for a succesful query', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => 1);
        (0, patch_1.patch)(bsc, 'getTransaction', () => transactionSuccesful);
        (0, patch_1.patch)(bsc, 'getTransactionReceipt', () => transactionSuccesfulReceipt);
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.txReceipt).toBeDefined();
        expect(res.body.txData).toBeDefined();
    }));
    it('should get unknown error', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getCurrentBlockNumber', () => {
            const error = new Error('something went wrong');
            error.code = -32006;
            throw error;
        });
        const res = yield (0, supertest_1.default)(app_1.gatewayApp).post('/network/poll').send({
            chain: 'binance-smart-chain',
            network: 'testnet',
            txHash: '0xffdb7b393b46d3795b82c94b8d836ad6b3087a914244634fa89c3abbbf00ed72',
        });
        expect(res.statusCode).toEqual(503);
        expect(res.body.errorCode).toEqual(error_handler_1.UNKNOWN_ERROR_ERROR_CODE);
        expect(res.body.message).toEqual(error_handler_1.UNKNOWN_ERROR_MESSAGE);
    }));
});
//# sourceMappingURL=binance-smart-chain.routes.test.js.map