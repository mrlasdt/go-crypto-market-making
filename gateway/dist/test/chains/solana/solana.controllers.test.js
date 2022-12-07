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
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const bs58_1 = __importDefault(require("bs58"));
const solana_1 = require("../../../src/chains/solana/solana");
const solana_controllers_1 = require("../../../src/chains/solana/solana.controllers");
const solana_requests_1 = require("../../../src/chains/solana/solana.requests");
const error_handler_1 = require("../../../src/services/error-handler");
const patch_1 = require("../../services/patch");
const validators_test_1 = require("../../services/validators.test");
const getTokenListData = __importStar(require("./fixtures/getTokenList.json"));
const getTransactionData = __importStar(require("./fixtures/getTransaction.json"));
const solana_validators_test_1 = require("./solana.validators.test");
let solana;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    solana = yield solana_1.Solana.getInstance('devnet');
    solana.getTokenList = jest
        .fn()
        .mockReturnValue([
        getTokenListData[0],
        getTokenListData[1],
        getTokenListData[2],
        getTokenListData[3],
    ]);
    yield solana.init();
}));
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield solana.close();
}));
const patchGetKeypair = () => {
    (0, patch_1.patch)(solana, 'getKeypair', (pubkey) => {
        return pubkey === solana_validators_test_1.publicKey
            ? web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(solana_validators_test_1.privateKey))
            : null;
    });
};
const CurrentBlockNumber = 112646487;
const patchGetCurrentBlockNumber = () => {
    (0, patch_1.patch)(solana, 'getCurrentBlockNumber', () => CurrentBlockNumber);
};
const patchGetTransaction = () => {
    (0, patch_1.patch)(solana, 'getTransaction', () => getTransactionData);
};
describe('poll', () => {
    it('return transaction data for given signature', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetKeypair();
        patchGetCurrentBlockNumber();
        patchGetTransaction();
        const n = yield (0, solana_controllers_1.poll)(solana, {
            chain: 'solana',
            network: 'devnet',
            txHash: validators_test_1.txHash,
        });
        expect(n.network).toBe(solana.network);
        expect(n.timestamp).toBeNumber();
        expect(n.currentBlock).toBe(CurrentBlockNumber);
        expect(n.txHash).toBe(validators_test_1.txHash);
        expect(n.txStatus).toBe(solana_requests_1.TransactionResponseStatusCode.CONFIRMED);
        expect(n.txData).toStrictEqual(getTransactionData);
    }));
});
describe('balances', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(solana, 'getKeypair', () => {
            throw new Error(err);
        });
        yield expect((0, solana_controllers_1.balances)(solana, {
            chain: 'solana',
            network: 'devnet',
            address: solana_validators_test_1.publicKey,
            tokenSymbols: ['MBS', 'DAI'],
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
    it('return -1 if token account not initialized', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetKeypair();
        (0, patch_1.patch)(solana, 'getBalances', () => {
            return {
                MBS: { value: new bn_js_1.default(100), decimals: 3 },
                DAI: undefined,
            };
        });
        expect((yield (0, solana_controllers_1.balances)(solana, {
            chain: 'solana',
            network: 'devnet',
            address: solana_validators_test_1.publicKey,
            tokenSymbols: ['MBS', 'DAI'],
        })).balances).toStrictEqual({ MBS: '0.100', DAI: '-1' });
    }));
});
//# sourceMappingURL=solana.controllers.test.js.map