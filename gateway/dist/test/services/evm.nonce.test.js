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
const ethers_1 = require("ethers");
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const promises_1 = __importDefault(require("fs/promises"));
require("jest-extended");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const evm_nonce_1 = require("../../src/services/evm.nonce");
const refcounting_closeable_1 = require("../../src/services/refcounting-closeable");
const patch_1 = require("./patch");
describe('Test NonceLocalStorage', () => {
    let dbPath = '';
    let db;
    const handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/NonceLocalStorage.test.level'));
    }));
    beforeEach(() => {
        db = evm_nonce_1.NonceLocalStorage.getInstance(dbPath, handle);
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield fs_extra_1.default.emptyDir(dbPath);
        fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.close(handle);
    }));
    it('save, get and delete nonces', () => __awaiter(void 0, void 0, void 0, function* () {
        const testChain1 = 'ethereum';
        const testChain1Id = 1;
        const address1 = 'A';
        const address2 = 'B';
        const now = new Date().getTime();
        db.saveLeadingNonce(testChain1, testChain1Id, address1, new evm_nonce_1.NonceInfo(15, now + 1000));
        db.saveLeadingNonce(testChain1, testChain1Id, address2, new evm_nonce_1.NonceInfo(23, now + 1000));
        const results = yield db.getLeadingNonces(testChain1, testChain1Id);
        expect(results).toStrictEqual({
            [address1]: new evm_nonce_1.NonceInfo(15, now + 1000),
            [address2]: new evm_nonce_1.NonceInfo(23, now + 1000),
        });
    }));
});
describe('Test EVMNonceManager', () => {
    let dbPath = '';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(__dirname, '/EVMNonceManager.test.level'));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield fs_extra_1.default.emptyDir(dbPath);
        yield fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    const testChain1 = 'ethereum';
    const testChain1Id = 1;
    const testChain2 = 'avalanche';
    const testChain2Id = 1;
    const address1 = 'ABC';
    it('getNonce reads nonce from node, commits, then reads nonce from memory', () => __awaiter(void 0, void 0, void 0, function* () {
        const evmNonceManager = new evm_nonce_1.EVMNonceManager(testChain1, testChain1Id, dbPath, 300);
        (0, patch_1.patch)(evmNonceManager, 'mergeNonceFromEVMNode', (_ethAddress) => {
            return;
        });
        (0, patch_1.patch)(evmNonceManager, 'getNonceFromNode', (_ethAddress) => {
            return Promise.resolve(12);
        });
        yield evmNonceManager.init(new ethers_1.providers.StaticJsonRpcProvider('https://kovan.infura.io/v3/'));
        const nonce = yield evmNonceManager.getNonce(address1);
        expect(nonce).toEqual(12);
        yield evmNonceManager.commitNonce(address1, nonce);
        const nonce2 = yield evmNonceManager.getNextNonce(address1);
        expect(nonce2).toEqual(13);
    }));
    it('commits to the same address on different chains should have separate nonce values', () => __awaiter(void 0, void 0, void 0, function* () {
        const ethereumNonceManager = new evm_nonce_1.EVMNonceManager(testChain1, testChain1Id, dbPath, 300);
        const avalancheNonceManager = new evm_nonce_1.EVMNonceManager(testChain2, testChain2Id, dbPath, 300);
        (0, patch_1.patch)(ethereumNonceManager, 'mergeNonceFromEVMNode', (_ethAddress) => {
            return;
        });
        (0, patch_1.patch)(ethereumNonceManager, 'getNonceFromNode', (_ethAddress) => {
            return Promise.resolve(30);
        });
        (0, patch_1.patch)(avalancheNonceManager, 'mergeNonceFromEVMNode', (_ethAddress) => {
            return;
        });
        (0, patch_1.patch)(avalancheNonceManager, 'getNonceFromNode', (_ethAddress) => {
            return Promise.resolve(51);
        });
        yield ethereumNonceManager.init(new ethers_1.providers.StaticJsonRpcProvider(''));
        yield avalancheNonceManager.init(new ethers_1.providers.StaticJsonRpcProvider(''));
        const ethereumNonce1 = yield ethereumNonceManager.getNextNonce(address1);
        const avalancheNonce1 = yield avalancheNonceManager.getNextNonce(address1);
        expect(ethereumNonce1).toEqual(14);
        expect(avalancheNonce1).toEqual(52);
        yield ethereumNonceManager.commitNonce(address1, ethereumNonce1);
        yield avalancheNonceManager.commitNonce(address1, avalancheNonce1);
        const ethereumNonce2 = yield ethereumNonceManager.getNextNonce(address1);
        const avalancheNonce2 = yield avalancheNonceManager.getNextNonce(address1);
        expect(ethereumNonce2).toEqual(15);
        expect(avalancheNonce2).toEqual(53);
    }));
});
//# sourceMappingURL=evm.nonce.test.js.map