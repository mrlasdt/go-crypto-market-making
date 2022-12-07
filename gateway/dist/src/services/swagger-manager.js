"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerManager = void 0;
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
var SwaggerManager;
(function (SwaggerManager) {
    function validateMainFile(o) {
        return ('swagger' in o &&
            'info' in o &&
            'host' in o &&
            'tags' in o &&
            'schemes' in o &&
            'externalDocs' in o);
    }
    SwaggerManager.validateMainFile = validateMainFile;
    function validateRoutesFile(o) {
        return 'paths' in o;
    }
    SwaggerManager.validateRoutesFile = validateRoutesFile;
    function validateDefinitionsFile(o) {
        return 'definitions' in o;
    }
    SwaggerManager.validateDefinitionsFile = validateDefinitionsFile;
    function validate(fp, f) {
        const o = js_yaml_1.default.load(fs_1.default.readFileSync(fp, 'utf8'));
        if (o != null && typeof o === 'object' && f(o)) {
            return o;
        }
        else {
            throw new Error(fp + ' does not conform to the expected structure.');
        }
    }
    SwaggerManager.validate = validate;
    function generateSwaggerJson(mainFilePath, definitionsFilePath, routesFilePaths) {
        const main = validate(mainFilePath, validateMainFile);
        const paths = {};
        for (const fp of routesFilePaths) {
            const routes = validate(fp, validateRoutesFile);
            for (const key in routes['paths']) {
                paths[key] = routes['paths'][key];
            }
        }
        main['paths'] = paths;
        const definitions = validate(definitionsFilePath, validateDefinitionsFile);
        main['definitions'] = definitions['definitions'];
        return main;
    }
    SwaggerManager.generateSwaggerJson = generateSwaggerJson;
})(SwaggerManager = exports.SwaggerManager || (exports.SwaggerManager = {}));
//# sourceMappingURL=swagger-manager.js.map