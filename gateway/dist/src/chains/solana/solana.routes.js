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
exports.SolanaRoutes = void 0;
const express_1 = require("express");
const solana_1 = require("./solana");
const solana_middlewares_1 = require("./solana-middlewares");
const error_handler_1 = require("../../services/error-handler");
const solana_controllers_1 = require("./solana.controllers");
const solana_validators_1 = require("./solana.validators");
var SolanaRoutes;
(function (SolanaRoutes) {
    SolanaRoutes.router = (0, express_1.Router)();
    SolanaRoutes.getSolana = (request) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield solana_1.Solana.getInstance(request.body.network);
        yield solana.init();
        return solana;
    });
    SolanaRoutes.router.use((0, error_handler_1.asyncHandler)(solana_middlewares_1.verifySolanaIsAvailable));
    SolanaRoutes.router.get('/', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SolanaRoutes.getSolana(request);
        const rpcUrl = solana.rpcUrl;
        response.status(200).json({
            network: solana.network,
            rpcUrl: rpcUrl,
            connection: true,
            timestamp: Date.now(),
        });
    })));
    SolanaRoutes.router.get('/balances', (0, error_handler_1.asyncHandler)((request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SolanaRoutes.getSolana(request);
        (0, solana_validators_1.validateSolanaBalanceRequest)(request.body);
        response.status(200).json(yield (0, solana_controllers_1.balances)(solana, request.body));
    })));
    SolanaRoutes.router.get('/token', (0, error_handler_1.asyncHandler)((request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SolanaRoutes.getSolana(request);
        (0, solana_validators_1.validateSolanaGetTokenRequest)(request.body);
        response.status(200).json(yield (0, solana_controllers_1.token)(solana, request.body));
    })));
    SolanaRoutes.router.post('/token', (0, error_handler_1.asyncHandler)((request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SolanaRoutes.getSolana(request);
        (0, solana_validators_1.validateSolanaPostTokenRequest)(request.body);
        response
            .status(200)
            .json(yield (0, solana_controllers_1.getOrCreateTokenAccount)(solana, request.body));
    })));
    SolanaRoutes.router.post('/poll', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SolanaRoutes.getSolana(request);
        (0, solana_validators_1.validateSolanaPollRequest)(request.body);
        response.status(200).json(yield (0, solana_controllers_1.poll)(solana, request.body));
    })));
})(SolanaRoutes = exports.SolanaRoutes || (exports.SolanaRoutes = {}));
//# sourceMappingURL=solana.routes.js.map