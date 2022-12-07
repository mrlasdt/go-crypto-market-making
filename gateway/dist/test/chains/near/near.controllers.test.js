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
Object.defineProperty(exports, "__esModule", { value: true });
const near_1 = require("../../../src/chains/near/near");
const near_controllers_1 = require("../../../src/chains/near/near.controllers");
const error_handler_1 = require("../../../src/services/error-handler");
const patch_1 = require("../../services/patch");
const getTokenListData = __importStar(require("./fixtures/getTokenList.json"));
const getTransactionData = __importStar(require("./fixtures/getTransaction.json"));
const near_validators_test_1 = require("./near.validators.test");
let near;
const txHash = 'JCVEmLB2EQUR5hijgJkLLKjW5aGxdcdAndTQZBZ85Fm8';
const zeroAddress = '0000000000000000000000000000000000000000000000000000000000000000';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    near = near_1.Near.getInstance('testnet');
    near.getTokenList = jest.fn().mockReturnValue(getTokenListData);
    yield near.init();
}));
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield near.close();
}));
const CurrentBlockNumber = 112646487;
const patchGetCurrentBlockNumber = () => {
    (0, patch_1.patch)(near, 'getCurrentBlockNumber', () => CurrentBlockNumber);
};
const patchGetTransaction = () => {
    (0, patch_1.patch)(near, 'getTransaction', () => getTransactionData);
};
describe('poll', () => {
    it('return transaction data for given signature', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetCurrentBlockNumber();
        patchGetTransaction();
        const n = yield (0, near_controllers_1.poll)(near, near_validators_test_1.publicKey, txHash);
        expect(n.network).toBe(near.network);
        expect(n.timestamp).toBeNumber();
        expect(n.currentBlock).toBe(CurrentBlockNumber);
        expect(n.txHash).toBe(txHash);
        expect(n.txStatus).toBe(1);
    }));
});
describe('balances', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(near, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, near_controllers_1.balances)(near, {
            chain: 'near',
            network: 'testnet',
            address: near_validators_test_1.publicKey,
            tokenSymbols: ['ETHH', 'NEAR'],
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
});
describe('cancel', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(near, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, near_controllers_1.cancel)(near, {
            chain: 'near',
            network: 'testnet',
            nonce: 123,
            address: zeroAddress,
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
});
const eth = {
    chainId: 0,
    name: 'ETH',
    symbol: 'ETH',
    address: 'eth.near',
    decimals: 18,
};
describe('getTokenSymbolsToTokens', () => {
    it('return tokens for strings', () => {
        (0, patch_1.patch)(near, 'getTokenBySymbol', () => {
            return eth;
        });
        expect((0, near_controllers_1.getTokenSymbolsToTokens)(near, ['ETH'])).toEqual({ ETH: eth });
    });
});
//# sourceMappingURL=near.controllers.test.js.map