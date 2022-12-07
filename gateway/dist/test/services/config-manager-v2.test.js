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
const config_manager_v2_1 = require("../../src/services/config-manager-v2");
describe('Configuration manager v2 tests', () => {
    const testDataSourcePath = fs_extra_1.default.realpathSync(path_1.default.join(__dirname, 'data/config-manager-v2'));
    let tempDirPath = '';
    let configManager;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        tempDirPath = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'config-manager-v2-unit-test'));
        tempDirPath = fs_extra_1.default.realpathSync(tempDirPath);
        yield fs_extra_1.default.copy(testDataSourcePath, tempDirPath);
        configManager = new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/root.yml'));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        fs_1.default.rmSync(tempDirPath, { force: true, recursive: true });
        tempDirPath = '';
        config_manager_v2_1.ConfigManagerV2.setDefaults('ethereum', {});
    }));
    it('loading a valid configuration root', (done) => {
        expect(configManager.get('ssl.caCertificatePath')).toBeDefined();
        expect(configManager.get('ethereum.networks')).toBeDefined();
        expect(configManager.get('defira.contractAddresses')).toBeDefined();
        done();
    });
    it('loading an invalid configuration root', (done) => {
        expect(() => {
            new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/invalid-root.yml'));
        }).toThrow();
        expect(() => {
            new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/invalid-root-3.yml'));
        }).toThrow();
        expect(() => {
            new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/invalid-root-4.yml'));
        }).toThrow();
        done();
    });
    it('loading an invalid config file', (done) => {
        expect(() => {
            new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/invalid-root-2.yml'));
        }).toThrow();
        expect(() => {
            new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/invalid-root-defira.yml'));
        }).toThrow();
        done();
    });
    it('reading from config file', (done) => {
        expect(configManager.get('ssl.keyPath')).toEqual('gateway.key');
        expect(configManager.get('ethereum.networks.kovan.chainID')).toEqual(42);
        expect(configManager.get('ethereum.networks.kovan.nativeCurrencySymbol')).toEqual('ETH');
        expect(configManager.get('defira.contractAddresses.testnet.initCodeHash')).toEqual('0x7224a10f5f94e12d3973f5ef0f63a558539a93e1eef47935934ffc4d741b4b9f');
        done();
    });
    it('reading a non-existent config entry', (done) => {
        expect(configManager.get('ethereum.kovan.chainID')).toBeUndefined();
        expect(configManager.get('ssl.keyPath.keyPath')).toBeUndefined();
        done();
    });
    it('reading invalid config keys', (done) => {
        expect(() => {
            configManager.get('ssl');
        }).toThrow();
        done();
        expect(() => {
            configManager.get('noSuchNamespace.networks');
        }).toThrow();
    });
    it('writing a valid configuration', (done) => {
        const newKeyPath = 'new-gateway.key';
        configManager.set('ssl.keyPath', newKeyPath);
        configManager.set('ethereum.networks.kovan.chainID', 970);
        configManager.set('ethereum.networks.mainnet', {
            chainID: 61,
            nodeURL: 'http://localhost:8561',
            tokenListType: 'URL',
            tokenListSource: 'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link',
            nativeCurrencySymbol: 'ETH',
        });
        expect(configManager.get('ssl.keyPath')).toEqual(newKeyPath);
        const verifyConfigManager = new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/root.yml'));
        expect(verifyConfigManager.get('ssl.keyPath')).toEqual(newKeyPath);
        expect(verifyConfigManager.get('ethereum.networks.kovan.chainID')).toEqual(970);
        expect(verifyConfigManager.get('ethereum.networks.mainnet.chainID')).toEqual(61);
        done();
    });
    it('writing an invalid configuration', (done) => {
        expect(() => {
            configManager.set('ssl.nonKeyPath', 'noSuchFile.txt');
        }).toThrow();
        expect(() => {
            configManager.set('ethereum', {});
        }).toThrow();
        done();
    });
    it('using default configurations', (done) => {
        config_manager_v2_1.ConfigManagerV2.setDefaults('ethereum', {
            networks: {
                rinkeby: {
                    chainID: 4,
                    nodeURL: 'http://localhost:8504',
                },
            },
        });
        expect(configManager.get('ethereum.networks.rinkeby.chainID')).toEqual(4);
        done();
    });
    it('getting namespace objects', (done) => {
        const sslNamespace = configManager.getNamespace('ssl');
        expect(path_1.default.basename(sslNamespace.schemaPath)).toEqual('ssl-schema.json');
        expect(path_1.default.dirname(sslNamespace.schemaPath)).toEqual(path_1.default.dirname(config_manager_v2_1.ConfigRootSchemaPath));
        expect(sslNamespace.configurationPath).toEqual(path_1.default.join(tempDirPath, 'test1/ssl.yml'));
        done();
    });
    it('Test upgradability', () => {
        expect(configManager.get('logging.logPath')).toEqual('./logs');
        expect(configManager.get('telemetry.allowed')).toEqual(false);
        expect(configManager.get('telemetry.enabled')).toEqual(false);
    });
    it('Dummy test to attempt migration', () => {
        const configManager2 = new config_manager_v2_1.ConfigManagerV2(path_1.default.join(tempDirPath, 'test1/root2.yml'));
        expect(configManager2.get('ssl.caCertificatePath')).toBeDefined();
    });
    it('Test deep copy', (done) => {
        const templateObj = {
            a: 1,
            b: { c: { f: 5, g: 6 }, d: 3 },
            e: 4,
            j: [{ i: '0' }, { k: '1' }],
            l: { m: [1, 2, 3], n: [9, 7, 8] },
        };
        const configObj = {
            a: 9,
            b: { c: 8, d: 7 },
            e: 6,
            f: '5',
            g: { h: 4 },
            h: ['1', '2'],
            j: [{ i: '3' }, { k: '4' }],
            l: { m: [9, 7, 8], n: [1, 2, 3] },
        };
        (0, config_manager_v2_1.deepCopy)(configObj, templateObj);
        expect(templateObj.a).toEqual(9);
        expect(templateObj.b.d).toEqual(7);
        expect(templateObj.b.c).toEqual({ f: 5, g: 6 });
        expect(templateObj.e).toEqual(6);
        expect(templateObj.f).toEqual('5');
        expect(templateObj.g).toEqual({ h: 4 });
        expect(templateObj.h).toEqual(['1', '2']);
        expect(templateObj.j).toEqual([{ i: '3' }, { k: '4' }]);
        expect(templateObj.l.m).toEqual([9, 7, 8]);
        expect(templateObj.l.n).toEqual([1, 2, 3]);
        done();
    });
    it('Get all configuration', (done) => {
        const allConfigs = configManager.allConfigurations;
        expect(allConfigs.ssl.keyPath).toEqual('gateway.key');
        expect(allConfigs.ethereum.networks.kovan.chainID).toEqual(42);
        done();
    });
    it('Get instance', (done) => {
        let configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
        expect(configManager.allConfigurations.telemetry.enabled).toEqual(false);
        configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
        expect(configManager.allConfigurations.telemetry.enabled).toEqual(false);
        done();
    });
});
describe('Sample configurations', () => {
    it('Read sample schemas', (done) => {
        const sampleConfigManager = new config_manager_v2_1.ConfigManagerV2('./src/templates/root.yml');
        expect(sampleConfigManager.get('ssl.caCertificatePath')).toBeDefined();
        done();
    });
});
//# sourceMappingURL=config-manager-v2.test.js.map