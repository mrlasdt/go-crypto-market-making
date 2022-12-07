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
exports.SerumRoutes = void 0;
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const solana_1 = require("../../chains/solana/solana");
const solana_middlewares_1 = require("../../chains/solana/solana-middlewares");
const solana_validators_1 = require("../../chains/solana/solana.validators");
const error_handler_1 = require("../../services/error-handler");
const serum_1 = require("./serum");
const serum_middlewares_1 = require("./serum.middlewares");
const serum_controllers_1 = require("./serum.controllers");
var SerumRoutes;
(function (SerumRoutes) {
    SerumRoutes.router = (0, express_1.Router)();
    SerumRoutes.getSolana = (request) => __awaiter(this, void 0, void 0, function* () { return yield solana_1.Solana.getInstance(request.body.network); });
    SerumRoutes.getSerum = (request) => __awaiter(this, void 0, void 0, function* () { return yield serum_1.Serum.getInstance(request.body.chain, request.body.network); });
    SerumRoutes.router.use((0, error_handler_1.asyncHandler)(solana_middlewares_1.verifySolanaIsAvailable), (0, error_handler_1.asyncHandler)(serum_middlewares_1.verifySerumIsAvailable));
    SerumRoutes.router.get('/', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const serum = yield SerumRoutes.getSerum(request);
        response.status(http_status_codes_1.StatusCodes.OK).json({
            chain: serum.chain,
            network: serum.network,
            connector: serum.connector,
            connection: serum.ready(),
            timestamp: Date.now(),
        });
    })));
    SerumRoutes.router.get('/markets', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        const result = yield (0, serum_controllers_1.getMarkets)(solana, serum, request.body);
        return yield response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.get('/tickers', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        const result = yield (0, serum_controllers_1.getTickers)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.get('/orderBooks', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        const result = yield (0, serum_controllers_1.getOrderBooks)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.get('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.getOrders)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.post('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.createOrders)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.delete('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.get('/orders/open', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.get('/orders/filled', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.getFilledOrders)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
    SerumRoutes.router.post('/settleFunds', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const solana = yield SerumRoutes.getSolana(request);
        const serum = yield SerumRoutes.getSerum(request);
        (0, solana_validators_1.validatePublicKey)(request.body);
        const result = yield (0, serum_controllers_1.settleFunds)(solana, serum, request.body);
        response.status(result.status).json(result.body);
    })));
})(SerumRoutes = exports.SerumRoutes || (exports.SerumRoutes = {}));
//# sourceMappingURL=serum.routes.js.map