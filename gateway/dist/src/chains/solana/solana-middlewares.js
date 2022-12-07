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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySolanaIsAvailable = void 0;
const error_handler_1 = require("../../services/error-handler");
const solana_1 = require("./solana");
const verifySolanaIsAvailable = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req || !req.body || !req.body.network) {
        throw new error_handler_1.HttpException(404, 'No Solana network informed.');
    }
    const solana = yield solana_1.Solana.getInstance(req.body.network);
    if (!solana.ready) {
        yield solana.init();
    }
    return next();
});
exports.verifySolanaIsAvailable = verifySolanaIsAvailable;
//# sourceMappingURL=solana-middlewares.js.map