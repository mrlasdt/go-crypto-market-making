"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPath = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function rootPath() {
    const insideDistDir = __filename.match(/dist\//) !== null;
    if (insideDistDir) {
        return fs_1.default.realpathSync(path_1.default.join(__dirname, '../../'), 'utf8');
    }
    return fs_1.default.realpathSync(path_1.default.join(__dirname, '../'), 'utf8');
}
exports.rootPath = rootPath;
//# sourceMappingURL=paths.js.map