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
const bs58_1 = __importDefault(require("bs58"));
const ethers_1 = require("ethers");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../../src/app");
const solana_1 = require("../../../src/chains/solana/solana");
const solana_requests_1 = require("../../../src/chains/solana/solana.requests");
const patch_1 = require("../../services/patch");
const validators_test_1 = require("../../services/validators.test");
const getOrCreateAssociatedTokenAccount_1 = __importDefault(require("./fixtures/getOrCreateAssociatedTokenAccount"));
const getTokenAccount_1 = __importDefault(require("./fixtures/getTokenAccount"));
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
afterEach(() => (0, patch_1.unpatch)());
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
describe('GET /solana', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana`)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.connection).toBe(true))
            .expect((res) => expect(res.body.rpcUrl).toBe(solana.rpcUrl));
    }));
});
const patchGetBalances = () => {
    (0, patch_1.patch)(solana, 'getBalances', () => {
        return {
            SOL: { value: ethers_1.BigNumber.from(228293), decimals: 9 },
            [validators_test_1.tokenSymbols[0]]: { value: ethers_1.BigNumber.from(100001), decimals: 9 },
            [validators_test_1.tokenSymbols[1]]: { value: ethers_1.BigNumber.from(200002), decimals: 9 },
            OTH: { value: ethers_1.BigNumber.from(300003), decimals: 9 },
        };
    });
};
describe('GET /solana/balances', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetKeypair();
        patchGetBalances();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/balances`)
            .send({ network: solana.network, address: solana_validators_test_1.publicKey, tokenSymbols: validators_test_1.tokenSymbols })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.latency).toBeNumber())
            .expect((res) => expect(res.body.balances).toEqual({
            [validators_test_1.tokenSymbols[0]]: '0.000100001',
            [validators_test_1.tokenSymbols[1]]: '0.000200002',
        }));
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/balances`)
            .send({ network: solana.network })
            .expect(404);
    }));
});
const patchGetTokenAccount = () => {
    (0, patch_1.patch)(solana, 'getTokenAccount', () => getTokenAccount_1.default);
};
const patchGetSplBalance = () => {
    (0, patch_1.patch)(solana, 'getSplBalance', () => {
        return { value: ethers_1.BigNumber.from(123456), decimals: 9 };
    });
};
describe('GET /solana/token', () => {
    it('should get accountAddress = undefined when Token account not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(solana, 'getTokenAccount', () => {
            return null;
        });
        patchGetSplBalance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBeUndefined())
            .expect((res) => expect(res.body.amount).toBe('0.000123456'));
    }));
    it('should get amount = null when Token account not initialized', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTokenAccount();
        (0, patch_1.patch)(solana, 'getSplBalance', () => {
            throw new Error(`Token account not initialized`);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBe(getTokenAccount_1.default.pubkey.toBase58()))
            .expect((res) => expect(res.body.amount).toBeNull());
    }));
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTokenAccount();
        patchGetSplBalance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBe(getTokenAccount_1.default.pubkey.toBase58()))
            .expect((res) => expect(res.body.amount).toBe('0.000123456'));
    }));
    it('should return 500 when token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/token`)
            .send({ network: solana.network, token: 'not found', address: solana_validators_test_1.publicKey })
            .expect(500);
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/solana/token`)
            .send({ network: solana.network })
            .expect(404);
    }));
});
const patchGetOrCreateAssociatedTokenAccount = () => {
    (0, patch_1.patch)(solana, 'getOrCreateAssociatedTokenAccount', () => getOrCreateAssociatedTokenAccount_1.default);
};
describe('POST /solana/token', () => {
    it('should get accountAddress = undefined when Token account not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(solana, 'getOrCreateAssociatedTokenAccount', () => {
            return null;
        });
        patchGetKeypair();
        patchGetSplBalance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBeUndefined())
            .expect((res) => expect(res.body.amount).toBe('0.000123456'));
    }));
    it('should get amount = null when Token account not initialized', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetOrCreateAssociatedTokenAccount();
        patchGetKeypair();
        (0, patch_1.patch)(solana, 'getSplBalance', () => {
            throw new Error(`Token account not initialized`);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBe(getTokenAccount_1.default.pubkey.toBase58()))
            .expect((res) => expect(res.body.amount).toBeNull());
    }));
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetOrCreateAssociatedTokenAccount();
        patchGetKeypair();
        patchGetSplBalance();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/token`)
            .send({
            network: solana.network,
            token: validators_test_1.tokenSymbols[0],
            address: solana_validators_test_1.publicKey,
        })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.token).toBe(validators_test_1.tokenSymbols[0]))
            .expect((res) => expect(res.body.mintAddress).toBe(getTokenListData[0].address))
            .expect((res) => expect(res.body.accountAddress).toBe(getTokenAccount_1.default.pubkey.toBase58()))
            .expect((res) => expect(res.body.amount).toBe('0.000123456'));
    }));
    it('should return 500 when token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/token`)
            .send({ network: solana.network, token: 'not found', address: solana_validators_test_1.publicKey })
            .expect(500);
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/token`)
            .send({ network: solana.network })
            .expect(404);
    }));
});
const CurrentBlockNumber = 146630151;
const patchGetCurrentBlockNumber = () => {
    (0, patch_1.patch)(solana, 'getCurrentBlockNumber', () => CurrentBlockNumber);
};
const patchGetTransaction = () => {
    (0, patch_1.patch)(solana, 'getTransaction', () => {
        return getTransactionData;
    });
};
describe('POST /solana/poll', () => {
    it('should return 200', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetCurrentBlockNumber();
        patchGetTransaction();
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/poll`)
            .send({ network: solana.network, txHash: validators_test_1.txHash })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => expect(res.body.network).toBe(solana.network))
            .expect((res) => expect(res.body.timestamp).toBeNumber())
            .expect((res) => expect(res.body.currentBlock).toBe(CurrentBlockNumber))
            .expect((res) => expect(res.body.txHash).toBe(validators_test_1.txHash))
            .expect((res) => expect(res.body.txStatus).toBe(solana_requests_1.TransactionResponseStatusCode.CONFIRMED))
            .expect((res) => {
            const received = JSON.parse(JSON.stringify(res.body.txData, null, 2));
            delete received.default;
            const expected = JSON.parse(JSON.stringify(getTransactionData, null, 2));
            delete expected.default;
            expect(received).toStrictEqual(expected);
        });
    }));
    it('should return 404 when parameters are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/solana/poll`)
            .send({ network: solana.network })
            .expect(404);
    }));
});
//# sourceMappingURL=solana.routes.test.js.map