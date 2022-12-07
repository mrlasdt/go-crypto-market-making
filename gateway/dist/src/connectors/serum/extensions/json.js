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
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../../../services/error-handler");
const cycle = __importStar(require("cycle"));
JSON.originalStringify = JSON.stringify;
JSON.stringify = (value, replacer, space) => {
    return JSON.originalStringify(cycle.decycle(value), replacer, space);
};
JSON.originalParse = JSON.parse;
JSON.parse = (text, reviver) => {
    try {
        return JSON.originalParse(cycle.retrocycle(text), reviver);
    }
    catch (exception) {
        if (text.startsWith('<html>') &&
            text.includes('<head><title>504 Gateway Time-out</title></head>')) {
            throw new error_handler_1.HttpException(504, 'Gateway Timeout');
        }
        console.log('text:\n', text, '\nexception:\n', exception);
        throw exception;
    }
};
//# sourceMappingURL=json.js.map