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
const local_storage_1 = require("../../src/services/local-storage");
require("jest-extended");
const refcounting_closeable_1 = require("../../src/services/refcounting-closeable");
let dbPath = '';
const handle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    dbPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), '/local-storage.test.level'));
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.emptyDir(dbPath);
    fs_1.default.rmSync(dbPath, { force: true, recursive: true });
    const db = local_storage_1.LocalStorage.getInstance(dbPath, handle);
    yield db.close(handle);
}));
describe('Test local-storage', () => {
    it('save, get and delete a key value pair in the local db', () => __awaiter(void 0, void 0, void 0, function* () {
        const testKey = 'abc';
        const testValue = 123;
        const db = local_storage_1.LocalStorage.getInstance(dbPath, handle);
        yield db.del(testKey);
        yield db.save(testKey, testValue);
        const results = yield db.get((k, v) => {
            return [k, parseInt(v)];
        });
        expect(results).toStrictEqual({
            [testKey]: testValue,
        });
        expect(db.dbPath).toStrictEqual(dbPath);
        yield db.del(testKey);
        const results2 = yield db.get((k, v) => {
            return [k, parseInt(v)];
        });
        expect(results2).toStrictEqual({});
    }));
    it('Put and retrieve a objects', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = local_storage_1.LocalStorage.getInstance(dbPath, handle);
        const firstKey = 'camel';
        const firstValue = { kingdom: 'animalia', family: 'camelidae' };
        const secondKey = 'elephant';
        const secondValue = { kingdom: 'animalia', family: 'elephantidae' };
        const thirdKey = 'trex';
        const thirdValue = { kingdom: 'animalia', family: 'tyrannosauridae' };
        const fourthKey = 'shiitake';
        const fourthValue = { kingdom: 'animalia', family: 'omphalotaceae' };
        yield db.save(firstKey, firstValue);
        yield db.save(secondKey, secondValue);
        yield db.save(thirdKey, thirdValue);
        yield db.save(fourthKey, fourthValue);
        const results = yield db.get((k, v) => {
            return [k, v];
        });
        expect(results[firstKey]).toStrictEqual(firstValue);
        expect(results[secondKey]).toStrictEqual(secondValue);
        expect(results[thirdKey]).toStrictEqual(thirdValue);
        expect(results[fourthKey]).toStrictEqual(fourthValue);
    }));
});
//# sourceMappingURL=local-storage.test.js.map