"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_manager_1 = require("../../src/services/swagger-manager");
const patch_1 = require("./patch");
const fs_1 = __importDefault(require("fs"));
require("jest-extended");
describe('validateMainFile', () => {
    it('true with all expected keys', () => {
        expect(swagger_manager_1.SwaggerManager.validateMainFile({
            swagger: '',
            info: '',
            host: '',
            tags: '',
            schemes: '',
            externalDocs: '',
        })).toEqual(true);
    });
    it('false with a key missing', () => {
        expect(swagger_manager_1.SwaggerManager.validateMainFile({
            info: '',
            host: '',
            tags: '',
            schemes: '',
            externalDocs: '',
        })).toEqual(false);
    });
});
describe('validateRoutesFile', () => {
    it('true with all expected keys', () => {
        expect(swagger_manager_1.SwaggerManager.validateRoutesFile({
            paths: '',
        })).toEqual(true);
    });
    it('false with a key missing', () => {
        expect(swagger_manager_1.SwaggerManager.validateRoutesFile({
            info: '',
        })).toEqual(false);
    });
});
describe('validateDefinitionsFile', () => {
    it('true with all expected keys', () => {
        expect(swagger_manager_1.SwaggerManager.validateDefinitionsFile({
            definitions: '',
        })).toEqual(true);
    });
    it('false with a key missing', () => {
        expect(swagger_manager_1.SwaggerManager.validateDefinitionsFile({
            info: '',
        })).toEqual(false);
    });
});
describe('validate', () => {
    afterEach(() => {
        (0, patch_1.unpatch)();
    });
    it('return object if validation function returns true', () => {
        (0, patch_1.patch)(fs_1.default, 'readFileSync', () => 'definitions: abc');
        expect(swagger_manager_1.SwaggerManager.validate('dummy-file-name', swagger_manager_1.SwaggerManager.validateDefinitionsFile)).toEqual({ definitions: 'abc' });
    });
    it('throws an error if validation function returns false', () => {
        (0, patch_1.patch)(fs_1.default, 'readFileSync', () => 'definitions: abc');
        expect(() => swagger_manager_1.SwaggerManager.validate('dummy-file-name', swagger_manager_1.SwaggerManager.validateMainFile)).toThrow();
    });
});
describe('generateSwaggerJson', () => {
    afterEach(() => {
        (0, patch_1.unpatch)();
    });
    it('return object if validation function returns true', () => {
        (0, patch_1.patch)(fs_1.default, 'readFileSync', (fp) => {
            if (fp === 'main') {
                return "swagger: two\ninfo: 'nothing'\nhost:  'localhost'\ntags:  []\nschemes: []\nexternalDocs: ''";
            }
            else if (fp === 'definitions') {
                return 'definitions: []';
            }
            return 'paths:\n  /eth:\n    get';
        });
        expect(swagger_manager_1.SwaggerManager.generateSwaggerJson('main', 'definitions', ['path'])).toEqual({
            swagger: 'two',
            info: 'nothing',
            host: 'localhost',
            tags: [],
            schemes: [],
            externalDocs: '',
            definitions: [],
            paths: { '/eth': 'get' },
        });
    });
    it('throw an error if something does not conform to the structure', () => {
        (0, patch_1.patch)(fs_1.default, 'readFileSync', (fp) => {
            if (fp === 'main') {
                return 'swagger: two\n';
            }
            else if (fp === 'definitions') {
                return 'definitions: []';
            }
            return 'paths:\n  /eth:\n    get';
        });
        expect(() => swagger_manager_1.SwaggerManager.generateSwaggerJson('main', 'definitions', ['path'])).toThrow();
    });
});
//# sourceMappingURL=swagger-manager.test.js.map