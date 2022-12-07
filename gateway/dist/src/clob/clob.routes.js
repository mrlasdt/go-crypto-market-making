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
exports.ClobRoutes = void 0;
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const connection_manager_1 = require("../services/connection-manager");
const error_handler_1 = require("../services/error-handler");
const clob_controllers_1 = require("./clob.controllers");
var ClobRoutes;
(function (ClobRoutes) {
    ClobRoutes.router = (0, express_1.Router)();
    ClobRoutes.router.get('/', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const connector = yield (0, connection_manager_1.getConnector)(request.body.chain, request.body.network, request.body.connector);
        response.status(http_status_codes_1.StatusCodes.OK).json({
            chain: connector.chain,
            network: connector.network,
            connector: connector.connector,
            connection: connector.ready(),
            timestamp: Date.now(),
        });
    })));
    ClobRoutes.router.get('/markets', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getMarkets)(request.body);
        response.status(result.status).send(result.body);
    })));
    ClobRoutes.router.get('/tickers', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getTickers)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.get('/orderBooks', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getOrderBooks)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.get('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getOrders)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.post('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.createOrders)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.delete('/orders', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.cancelOrders)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.get('/orders/open', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getOpenOrders)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.get('/orders/filled', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.getFilledOrders)(request.body);
        response.status(result.status).json(result.body);
    })));
    ClobRoutes.router.post('/settleFunds', (0, error_handler_1.asyncHandler)((request, response) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, clob_controllers_1.settleFunds)(request.body);
        response.status(result.status).json(result.body);
    })));
})(ClobRoutes = exports.ClobRoutes || (exports.ClobRoutes = {}));
//# sourceMappingURL=clob.routes.js.map