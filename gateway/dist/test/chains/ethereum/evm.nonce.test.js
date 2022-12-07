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
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const ethers_1 = require("ethers");
const error_handler_1 = require("../../../src/services/error-handler");
const evm_nonce_1 = require("../../../src/services/evm.nonce");
const patch_1 = require("../../services/patch");
require("jest-extended");
const refcounting_closeable_1 = require("../../../src/services/refcounting-closeable");
const exampleAddress = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
afterEach(() => {
    (0, patch_1.unpatch)();
});
describe('uninitiated EVMNodeService', () => {
    let dbPath = '';
    const handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
    let nonceManager;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.useFakeTimers();
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/evm-nonce1.test.level'));
        nonceManager = new evm_nonce_1.EVMNonceManager('ethereum', 43, dbPath, 0, 0);
        nonceManager.declareOwnership(handle);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield nonceManager.close(handle);
        fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    it('mergeNonceFromEVMNode throws error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(nonceManager.mergeNonceFromEVMNode(exampleAddress)).rejects.toThrow(new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.mergeNonceFromEVMNode'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE));
    }));
    it('getNonce throws error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(nonceManager.getNonce(exampleAddress)).rejects.toThrow(new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.getNonceFromMemory'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE));
    }));
    it('commitNonce (txNonce not null) throws error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(nonceManager.commitNonce(exampleAddress, 87)).rejects.toThrow(new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.commitNonce'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE));
    }));
    it('localNonceTTL value too low', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new ethers_1.providers.StaticJsonRpcProvider('https://ethereum.node.com');
        const nonceManager2 = new evm_nonce_1.EVMNonceManager('ethereum', 43, dbPath, -5, 0);
        nonceManager2.declareOwnership(handle);
        try {
            yield expect(nonceManager2.init(provider)).rejects.toThrow(new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.init localNonceTTL must be greater than or equal to zero.'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE));
        }
        finally {
            yield nonceManager2.close(handle);
        }
    }));
    it('pendingNonceTTL value too low', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new ethers_1.providers.StaticJsonRpcProvider('https://ethereum.node.com');
        const nonceManager2 = new evm_nonce_1.EVMNonceManager('ethereum', 43, dbPath, 0, -5);
        nonceManager2.declareOwnership(handle);
        try {
            yield expect(nonceManager2.init(provider)).rejects.toThrow(new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('EVMNonceManager.init pendingNonceTTL must be greater than or equal to zero.'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE));
        }
        finally {
            yield nonceManager2.close(handle);
        }
    }));
});
describe('EVMNodeService', () => {
    let nonceManager;
    let dbPath = '';
    const handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
    const provider = new ethers_1.providers.StaticJsonRpcProvider('https://ethereum.node.com');
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/evm-nonce2.test.level'));
        nonceManager = new evm_nonce_1.EVMNonceManager('ethereum', 43, dbPath, 0, 0);
        nonceManager.declareOwnership(handle);
        yield nonceManager.init(provider);
        yield nonceManager.commitNonce(exampleAddress, 0);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield nonceManager.close(handle);
        fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    const patchGetTransactionCount = () => {
        if (nonceManager._provider) {
            (0, patch_1.patch)(nonceManager._provider, 'getTransactionCount', () => 11);
        }
    };
    const patchDropExpiredPendingNonces = () => {
        (0, patch_1.patch)(nonceManager, 'dropExpiredPendingNonces', (_) => {
            return null;
        });
    };
    it('commitNonce with a provided txNonce will only update current nonce if txNonce > currentNonce', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTransactionCount();
        yield nonceManager.commitNonce(exampleAddress, 10);
        let nonce = yield nonceManager.getNonce(exampleAddress);
        yield expect(nonce).toEqual(10);
        yield expect(nonceManager.commitNonce(exampleAddress, 5)).rejects.toThrow(new error_handler_1.InvalidNonceError(error_handler_1.INVALID_NONCE_ERROR_MESSAGE + `txNonce(5) < currentNonce(10)`, error_handler_1.INVALID_NONCE_ERROR_CODE));
        nonce = yield nonceManager.getNonce(exampleAddress);
        yield expect(nonce).toEqual(10);
    }));
    it('mergeNonceFromEVMNode should update with nonce from EVM node (local<node)', () => __awaiter(void 0, void 0, void 0, function* () {
        if (nonceManager._provider) {
            (0, patch_1.patch)(nonceManager._provider, 'getTransactionCount', () => 20);
        }
        yield nonceManager.commitNonce(exampleAddress, 8);
        jest.advanceTimersByTime(300000);
        yield nonceManager.mergeNonceFromEVMNode(exampleAddress);
        const nonce = yield nonceManager.getNonce(exampleAddress);
        yield expect(nonce).toEqual(19);
    }));
    it('getNextNonce should return nonces that are sequentially increasing', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTransactionCount();
        patchDropExpiredPendingNonces();
        (0, patch_1.patch)(nonceManager, '_pendingNonceTTL', 300 * 1000);
        nonceManager.commitNonce(exampleAddress, 1);
        jest.advanceTimersByTime(300000);
        const pendingNonce1 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce1).toEqual(11);
        const pendingNonce2 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce2).toEqual(pendingNonce1 + 1);
    }));
    it('getNextNonce should reuse expired nonces', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTransactionCount();
        const pendingNonce1 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce1).toEqual(11);
        jest.advanceTimersByTime(1000);
        const pendingNonce2 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce2).toEqual(pendingNonce1);
        yield nonceManager.commitNonce(exampleAddress, 20);
        jest.advanceTimersByTime(300000);
        yield nonceManager.mergeNonceFromEVMNode(exampleAddress);
        const nonce = yield nonceManager.getNonce(exampleAddress);
        yield expect(nonce).toEqual(10);
    }));
    it('provideNonce, nonce not provided. should return function results and commit nonce on successful execution of transaction', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTransactionCount();
        (0, patch_1.patch)(nonceManager, '_localNonceTTL', 300 * 1000);
        const testFunction = (_nonce) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                nonce: _nonce,
            };
        });
        const transactionResult = yield nonceManager.provideNonce(undefined, exampleAddress, testFunction);
        const currentNonceFromMemory = yield nonceManager.getNonceFromMemory(exampleAddress);
        expect(transactionResult.nonce).toEqual(11);
        expect(currentNonceFromMemory).toEqual(11);
    }));
    it('provideNonce, nonce not provided. should remove all pendingNonces greater or equal should function fail', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetTransactionCount();
        const expectedNonce = yield nonceManager.getNonceFromMemory(exampleAddress);
        expect(expectedNonce).toEqual(10);
        const pendingNonce1 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce1).toEqual(11);
        const testFunction = (_nonce) => __awaiter(void 0, void 0, void 0, function* () {
            throw new Error('testFunction has failed.');
        });
        jest.advanceTimersByTime(300000);
        try {
            yield nonceManager.provideNonce(undefined, exampleAddress, testFunction);
        }
        catch (error) {
            expect(error).toEqual(new Error('testFunction has failed.'));
        }
        const currentNonceFromMemory = yield nonceManager.getNonceFromMemory(exampleAddress);
        expect(currentNonceFromMemory).toEqual(expectedNonce);
        const pendingNonce2 = yield nonceManager.getNextNonce(exampleAddress);
        expect(pendingNonce2).toEqual(pendingNonce1);
    }));
});
describe("EVMNodeService was previously a singleton. Let's prove that it no longer is.", () => {
    let nonceManager1;
    let nonceManager2;
    let dbPath = '';
    const handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/evm-nonce3.test.level'));
        nonceManager1 = new evm_nonce_1.EVMNonceManager('ethereum', 43, dbPath, 60, 60);
        const provider1 = new ethers_1.providers.StaticJsonRpcProvider('https://ethereum.node.com');
        nonceManager1.declareOwnership(handle);
        yield nonceManager1.init(provider1);
        nonceManager2 = new evm_nonce_1.EVMNonceManager('avalanche', 56, dbPath, 60, 60);
        nonceManager2.declareOwnership(handle);
        const provider2 = new ethers_1.providers.StaticJsonRpcProvider('https://avalanche.node.com');
        yield nonceManager2.init(provider2);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield nonceManager1.close(handle);
        yield nonceManager2.close(handle);
        fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    it('commitNonce with a provided txNonce will only update current nonce if txNonce > currentNonce', () => __awaiter(void 0, void 0, void 0, function* () {
        if (nonceManager1._provider) {
            (0, patch_1.patch)(nonceManager1._provider, 'getTransactionCount', () => 11);
        }
        if (nonceManager2._provider) {
            (0, patch_1.patch)(nonceManager2._provider, 'getTransactionCount', () => 24);
        }
        yield nonceManager1.commitNonce(exampleAddress, 10);
        jest.advanceTimersByTime(300000);
        const nonce1 = yield nonceManager1.getNonce(exampleAddress);
        yield expect(nonce1).toEqual(10);
        yield nonceManager2.commitNonce(exampleAddress, 23);
        jest.advanceTimersByTime(300000);
        const nonce2 = yield nonceManager2.getNonce(exampleAddress);
        yield expect(nonce2).toEqual(23);
        yield nonceManager1.commitNonce(exampleAddress, 11);
        jest.advanceTimersByTime(300000);
        const nonce3 = yield nonceManager1.getNonce(exampleAddress);
        yield expect(nonce3).toEqual(10);
    }));
});
//# sourceMappingURL=evm.nonce.test.js.map