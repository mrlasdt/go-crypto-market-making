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
exports.EVMRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../services/error-handler");
const ethereum_controllers_1 = require("../chains/ethereum/ethereum.controllers");
const ethereum_validators_1 = require("../chains/ethereum/ethereum.validators");
const connection_manager_1 = require("../services/connection-manager");
var EVMRoutes;
(function (EVMRoutes) {
    EVMRoutes.router = (0, express_1.Router)();
    EVMRoutes.router.post('/nextNonce', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, ethereum_validators_1.validateNonceRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
        res.status(200).json(yield (0, ethereum_controllers_1.nextNonce)(chain, req.body));
    })));
    EVMRoutes.router.post('/nonce', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, ethereum_validators_1.validateNonceRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
        res.status(200).json(yield (0, ethereum_controllers_1.nonce)(chain, req.body));
    })));
    EVMRoutes.router.post('/allowances', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, ethereum_validators_1.validateAllowancesRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
        res.status(200).json(yield (0, ethereum_controllers_1.allowances)(chain, req.body));
    })));
    EVMRoutes.router.post('/approve', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, ethereum_validators_1.validateApproveRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
        res.status(200).json(yield (0, ethereum_controllers_1.approve)(chain, req.body));
    })));
    EVMRoutes.router.post('/cancel', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, ethereum_validators_1.validateCancelRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
        res.status(200).json(yield (0, ethereum_controllers_1.cancel)(chain, req.body));
    })));
})(EVMRoutes = exports.EVMRoutes || (exports.EVMRoutes = {}));
//# sourceMappingURL=evm.routes.js.map