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
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const evm_tx_storage_1 = require("../../src/services/evm.tx-storage");
require("jest-extended");
const refcounting_closeable_1 = require("../../src/services/refcounting-closeable");
describe('Test local-storage', () => {
    let dbPath = '';
    let db;
    let handle;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/evm.tx-storage.test.level'));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield fs_extra_1.default.emptyDir(dbPath);
        fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    }));
    beforeEach(() => {
        handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
        db = evm_tx_storage_1.EvmTxStorage.getInstance(dbPath, handle);
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.close(handle);
    }));
    it('save, get and delete a key value pair in the local db', () => __awaiter(void 0, void 0, void 0, function* () {
        const testChain1 = 'ethereum';
        const testChain1Id = 423;
        const testChain1Tx1 = '0xadaef9c4540192e45c991ffe6f12cc86be9c07b80b43487e5778d95c964405c7';
        const testChain1GasPrice1 = 200000;
        const testChain1Tx2 = '0xadaef9c4540192e45c991ffe6f12cc86be9c07b80b43487edddddddddddddddd';
        const testChain1GasPrice2 = 200300;
        yield db.deleteTx(testChain1, testChain1Id, testChain1Tx1);
        yield db.deleteTx(testChain1, testChain1Id, testChain1Tx2);
        const testTime1 = new Date();
        yield db.saveTx(testChain1, testChain1Id, testChain1Tx1, testTime1, testChain1GasPrice1);
        const results = yield db.getTxs(testChain1, testChain1Id);
        expect(results).toStrictEqual({
            [testChain1Tx1]: [testTime1, testChain1GasPrice1],
        });
        const testTime2 = new Date();
        yield db.saveTx(testChain1, testChain1Id, testChain1Tx2, testTime2, testChain1GasPrice2);
        const results2 = yield db.getTxs(testChain1, testChain1Id);
        expect(results2).toStrictEqual({
            [testChain1Tx1]: [testTime1, testChain1GasPrice1],
            [testChain1Tx2]: [testTime2, testChain1GasPrice2],
        });
        const testChain2 = 'avalanche';
        const testChain2Id = 10;
        const testChain2Tx1 = '0xadaef9c4540192e45c991ffe6f12cc86be9c07b80b43487fffffffffffffffff';
        const testChain2GasPrice1 = 4000000;
        const testTime3 = new Date();
        yield db.deleteTx(testChain2, testChain2Id, testChain2Tx1);
        yield db.saveTx(testChain2, testChain2Id, testChain2Tx1, testTime3, testChain2GasPrice1);
        const results3 = yield db.getTxs(testChain2, testChain2Id);
        expect(results3).toStrictEqual({
            [testChain2Tx1]: [testTime3, testChain2GasPrice1],
        });
        expect(db.localStorage.dbPath).toStrictEqual(dbPath);
        yield db.deleteTx(testChain1, testChain1Id, testChain1Tx1);
        yield db.deleteTx(testChain1, testChain1Id, testChain1Tx2);
        const results4 = yield db.getTxs(testChain1, testChain1Id);
        expect(results4).toStrictEqual({});
    }));
});
//# sourceMappingURL=evm.tx-storage.test.js.map