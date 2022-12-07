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
exports.WalletRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../error-handler");
const wallet_controllers_1 = require("./wallet.controllers");
const wallet_validators_1 = require("./wallet.validators");
var WalletRoutes;
(function (WalletRoutes) {
    WalletRoutes.router = (0, express_1.Router)();
    WalletRoutes.router.get('/', (0, error_handler_1.asyncHandler)((_req, res) => __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, wallet_controllers_1.getWallets)();
        res.status(200).json(response);
    })));
    WalletRoutes.router.post('/add', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, wallet_validators_1.validateAddWalletRequest)(req.body);
        res.status(200).json(yield (0, wallet_controllers_1.addWallet)(req.body));
    })));
    WalletRoutes.router.delete('/remove', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, wallet_validators_1.validateRemoveWalletRequest)(req.body);
        yield (0, wallet_controllers_1.removeWallet)(req.body);
        res.status(200).json();
    })));
})(WalletRoutes = exports.WalletRoutes || (exports.WalletRoutes = {}));
//# sourceMappingURL=wallet.routes.js.map