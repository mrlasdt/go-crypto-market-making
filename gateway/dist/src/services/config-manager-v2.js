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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ConfigurationNamespace_namespaceId, _ConfigurationNamespace_schemaPath, _ConfigurationNamespace_configurationPath, _ConfigurationNamespace_templatePath, _ConfigurationNamespace_validator, _ConfigurationNamespace_configuration, _ConfigManagerV2_namespaces;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManagerV2 = exports.ConfigurationNamespace = exports.percentRegexp = exports.initiateWithTemplate = exports.deepCopy = exports.ConfigRootSchemaPath = void 0;
const ajv_1 = __importDefault(require("ajv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const migrations = __importStar(require("./config-migration/migrations"));
const paths_1 = require("../paths");
const NamespaceTag = '$namespace ';
exports.ConfigRootSchemaPath = path_1.default.join(__dirname, 'schema/configuration-root-schema.json');
const ConfigTemplatesDir = path_1.default.join(__dirname, '../templates/');
const ConfigDir = path_1.default.join((0, paths_1.rootPath)(), 'conf/');
function deepCopy(srcObject, dstObject) {
    for (const [key, value] of Object.entries(srcObject)) {
        if (srcObject[key] instanceof Array) {
            if (!dstObject[key])
                dstObject[key] = [];
            deepCopy(srcObject[key], dstObject[key]);
        }
        else if (srcObject[key] instanceof Object) {
            if (!dstObject[key])
                dstObject[key] = {};
            deepCopy(srcObject[key], dstObject[key]);
        }
        else if (typeof srcObject[key] === typeof dstObject[key] ||
            !dstObject[key]) {
            dstObject[key] = value;
        }
    }
}
exports.deepCopy = deepCopy;
function initiateWithTemplate(templateFile, configFile) {
    fs_1.default.copyFileSync(templateFile, configFile);
}
exports.initiateWithTemplate = initiateWithTemplate;
const ajv = new ajv_1.default();
exports.percentRegexp = new RegExp(/^(\d+)\/(\d+)$/);
class ConfigurationNamespace {
    constructor(id, schemaPath, configurationPath, templatePath) {
        _ConfigurationNamespace_namespaceId.set(this, void 0);
        _ConfigurationNamespace_schemaPath.set(this, void 0);
        _ConfigurationNamespace_configurationPath.set(this, void 0);
        _ConfigurationNamespace_templatePath.set(this, void 0);
        _ConfigurationNamespace_validator.set(this, void 0);
        _ConfigurationNamespace_configuration.set(this, void 0);
        __classPrivateFieldSet(this, _ConfigurationNamespace_namespaceId, id, "f");
        __classPrivateFieldSet(this, _ConfigurationNamespace_schemaPath, schemaPath, "f");
        __classPrivateFieldSet(this, _ConfigurationNamespace_configurationPath, configurationPath, "f");
        __classPrivateFieldSet(this, _ConfigurationNamespace_templatePath, templatePath, "f");
        __classPrivateFieldSet(this, _ConfigurationNamespace_configuration, {}, "f");
        if (!fs_1.default.existsSync(schemaPath)) {
            throw new Error(`The JSON schema for namespace ${id} (${schemaPath}) does not exist.`);
        }
        __classPrivateFieldSet(this, _ConfigurationNamespace_validator, ajv.compile(JSON.parse(fs_1.default.readFileSync(schemaPath).toString())), "f");
        if (!fs_1.default.existsSync(configurationPath)) {
            initiateWithTemplate(this.templatePath, this.configurationPath);
        }
        this.loadConfig();
    }
    get id() {
        return __classPrivateFieldGet(this, _ConfigurationNamespace_namespaceId, "f");
    }
    get schemaPath() {
        return __classPrivateFieldGet(this, _ConfigurationNamespace_schemaPath, "f");
    }
    get configurationPath() {
        return __classPrivateFieldGet(this, _ConfigurationNamespace_configurationPath, "f");
    }
    get configuration() {
        return __classPrivateFieldGet(this, _ConfigurationNamespace_configuration, "f");
    }
    get templatePath() {
        return __classPrivateFieldGet(this, _ConfigurationNamespace_templatePath, "f");
    }
    loadConfig() {
        const configCandidate = js_yaml_1.default.load(fs_1.default.readFileSync(__classPrivateFieldGet(this, _ConfigurationNamespace_configurationPath, "f"), 'utf8'));
        if (!__classPrivateFieldGet(this, _ConfigurationNamespace_validator, "f").call(this, configCandidate)) {
            const configTemplateCandidate = js_yaml_1.default.load(fs_1.default.readFileSync(__classPrivateFieldGet(this, _ConfigurationNamespace_templatePath, "f"), 'utf8'));
            deepCopy(configCandidate, configTemplateCandidate);
            if (!__classPrivateFieldGet(this, _ConfigurationNamespace_validator, "f").call(this, configTemplateCandidate)) {
                for (const err of __classPrivateFieldGet(this, _ConfigurationNamespace_validator, "f").errors) {
                    if (err.keyword === 'additionalProperties') {
                        throw new Error(`${this.id} config file seems to be outdated/broken due to additional property "${err.params.additionalProperty}". Kindly fix manually.`);
                    }
                    else {
                        throw new Error(`${this.id} config file seems to be outdated/broken due to "${err.keyword}" in "${err.instancePath}" - ${err.message}. Kindly fix manually.`);
                    }
                }
            }
            __classPrivateFieldSet(this, _ConfigurationNamespace_configuration, configTemplateCandidate, "f");
            this.saveConfig();
            return;
        }
        __classPrivateFieldSet(this, _ConfigurationNamespace_configuration, configCandidate, "f");
    }
    saveConfig() {
        fs_1.default.writeFileSync(__classPrivateFieldGet(this, _ConfigurationNamespace_configurationPath, "f"), js_yaml_1.default.dump(__classPrivateFieldGet(this, _ConfigurationNamespace_configuration, "f")));
    }
    get(configPath) {
        const pathComponents = configPath.split('.');
        let cursor = __classPrivateFieldGet(this, _ConfigurationNamespace_configuration, "f");
        for (const component of pathComponents) {
            cursor = cursor[component];
            if (cursor === undefined) {
                return cursor;
            }
        }
        return cursor;
    }
    set(configPath, value) {
        const pathComponents = configPath.split('.');
        const configClone = JSON.parse(JSON.stringify(__classPrivateFieldGet(this, _ConfigurationNamespace_configuration, "f")));
        let cursor = configClone;
        let parent = configClone;
        for (const component of pathComponents.slice(0, -1)) {
            parent = cursor;
            cursor = cursor[component];
            if (cursor === undefined) {
                parent[component] = {};
                cursor = parent[component];
            }
        }
        const lastComponent = pathComponents[pathComponents.length - 1];
        cursor[lastComponent] = value;
        if (!__classPrivateFieldGet(this, _ConfigurationNamespace_validator, "f").call(this, configClone)) {
            throw new Error(`Cannot set ${this.id}.${configPath} to ${value}: ` +
                'JSON schema violation.');
        }
        __classPrivateFieldSet(this, _ConfigurationNamespace_configuration, configClone, "f");
        this.saveConfig();
    }
}
exports.ConfigurationNamespace = ConfigurationNamespace;
_ConfigurationNamespace_namespaceId = new WeakMap(), _ConfigurationNamespace_schemaPath = new WeakMap(), _ConfigurationNamespace_configurationPath = new WeakMap(), _ConfigurationNamespace_templatePath = new WeakMap(), _ConfigurationNamespace_validator = new WeakMap(), _ConfigurationNamespace_configuration = new WeakMap();
class ConfigManagerV2 {
    constructor(configRootPath) {
        _ConfigManagerV2_namespaces.set(this, void 0);
        __classPrivateFieldSet(this, _ConfigManagerV2_namespaces, {}, "f");
        this.loadConfigRoot(configRootPath);
    }
    static getInstance() {
        if (!ConfigManagerV2._instance) {
            const rootPath = path_1.default.join(ConfigDir, 'root.yml');
            if (!fs_1.default.existsSync(rootPath)) {
                fs_1.default.copyFileSync(path_1.default.join(ConfigTemplatesDir, 'root.yml'), rootPath);
            }
            ConfigManagerV2._instance = new ConfigManagerV2(rootPath);
        }
        return ConfigManagerV2._instance;
    }
    static setDefaults(namespaceId, defaultTree) {
        ConfigManagerV2.defaults[namespaceId] = defaultTree;
    }
    static getFromDefaults(namespaceId, configPath) {
        if (!(namespaceId in ConfigManagerV2.defaults)) {
            return undefined;
        }
        const pathComponents = configPath.split('.');
        const defaultConfig = ConfigManagerV2.defaults[namespaceId];
        let cursor = defaultConfig;
        for (const pathComponent of pathComponents) {
            cursor = cursor[pathComponent];
            if (cursor === undefined) {
                return cursor;
            }
        }
        return cursor;
    }
    get namespaces() {
        return __classPrivateFieldGet(this, _ConfigManagerV2_namespaces, "f");
    }
    get allConfigurations() {
        const result = {};
        for (const [key, value] of Object.entries(__classPrivateFieldGet(this, _ConfigManagerV2_namespaces, "f"))) {
            result[key] = value.configuration;
        }
        return result;
    }
    getNamespace(id) {
        return __classPrivateFieldGet(this, _ConfigManagerV2_namespaces, "f")[id];
    }
    addNamespace(id, schemaPath, configurationPath, templatePath) {
        __classPrivateFieldGet(this, _ConfigManagerV2_namespaces, "f")[id] = new ConfigurationNamespace(id, schemaPath, configurationPath, templatePath);
    }
    unpackFullConfigPath(fullConfigPath) {
        const pathComponents = fullConfigPath.split('.');
        if (pathComponents.length < 2) {
            throw new Error('Configuration paths must have at least two components.');
        }
        const namespaceComponent = pathComponents[0];
        const namespace = __classPrivateFieldGet(this, _ConfigManagerV2_namespaces, "f")[namespaceComponent];
        if (namespace === undefined) {
            throw new Error(`The configuration namespace ${namespaceComponent} does not exist.`);
        }
        const configPath = pathComponents.slice(1).join('.');
        return {
            namespace,
            configPath,
        };
    }
    get(fullConfigPath) {
        const { namespace, configPath } = this.unpackFullConfigPath(fullConfigPath);
        const configValue = namespace.get(configPath);
        if (configValue === undefined) {
            return ConfigManagerV2.getFromDefaults(namespace.id, configPath);
        }
        return configValue;
    }
    set(fullConfigPath, value) {
        const { namespace, configPath } = this.unpackFullConfigPath(fullConfigPath);
        namespace.set(configPath, value);
    }
    loadConfigRoot(configRootPath) {
        const configRootFullPath = fs_1.default.realpathSync(configRootPath);
        const configRootTemplateFullPath = path_1.default.join(ConfigTemplatesDir, 'root.yml');
        const configRootDir = path_1.default.dirname(configRootFullPath);
        const configRoot = js_yaml_1.default.load(fs_1.default.readFileSync(configRootFullPath, 'utf8'));
        const configRootTemplate = js_yaml_1.default.load(fs_1.default.readFileSync(configRootTemplateFullPath, 'utf8'));
        if (configRootTemplate.version > configRoot.version) {
            for (let num = configRoot.version + 1; num <= configRootTemplate.version; num++) {
                if (migrations[`updateToVersion${num}`]) {
                    migrations[`updateToVersion${num}`](configRootFullPath, configRootTemplateFullPath);
                }
            }
        }
        const validator = ajv.compile(JSON.parse(fs_1.default.readFileSync(exports.ConfigRootSchemaPath).toString()));
        if (!validator(configRoot)) {
            throw new Error('Configuration root file is invalid.');
        }
        const namespaceMap = {};
        for (const namespaceKey of Object.keys(configRoot.configurations)) {
            namespaceMap[namespaceKey.slice(NamespaceTag.length)] =
                configRoot.configurations[namespaceKey];
        }
        for (const namespaceDefinition of Object.values(namespaceMap)) {
            for (const [key, filePath] of Object.entries(namespaceDefinition)) {
                if (!path_1.default.isAbsolute(filePath)) {
                    if (key === 'configurationPath') {
                        namespaceDefinition['templatePath'] = path_1.default.join(ConfigTemplatesDir, filePath);
                        namespaceDefinition[key] = path_1.default.join(configRootDir, filePath);
                    }
                    else if (key === 'schemaPath') {
                        namespaceDefinition[key] = path_1.default.join(path_1.default.dirname(exports.ConfigRootSchemaPath), filePath);
                    }
                }
                else {
                    throw new Error(`Absolute path not allowed for ${key}.`);
                }
            }
        }
        for (const [namespaceId, namespaceDefinition] of Object.entries(namespaceMap)) {
            this.addNamespace(namespaceId, namespaceDefinition.schemaPath, namespaceDefinition.configurationPath, namespaceDefinition.templatePath);
        }
    }
}
exports.ConfigManagerV2 = ConfigManagerV2;
_ConfigManagerV2_namespaces = new WeakMap();
ConfigManagerV2.defaults = {};
//# sourceMappingURL=config-manager-v2.js.map