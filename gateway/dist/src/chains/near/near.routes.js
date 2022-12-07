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
exports.NearRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../../services/error-handler");
const connection_manager_1 = require("../../services/connection-manager");
const near_validators_1 = require("./near.validators");
const nearControllers = __importStar(require("./near.controllers"));
const network_controllers_1 = require("../../network/network.controllers");
const network_routes_1 = require("../../network/network.routes");
var NearRoutes;
(function (NearRoutes) {
    NearRoutes.router = (0, express_1.Router)();
    NearRoutes.router.post('/balances', (0, error_handler_1.asyncHandler)((req, res, _next) => __awaiter(this, void 0, void 0, function* () {
        (0, near_validators_1.validateBalanceRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)('near', req.body.network);
        res
            .status(200)
            .json((yield nearControllers.balances(chain, req.body)));
    })));
    NearRoutes.router.post('/poll', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, network_routes_1.validatePollRequest)(req.body);
        const chain = yield (0, connection_manager_1.getChain)('near', req.body.network);
        res
            .status(200)
            .json(yield nearControllers.poll(chain, req.body.address, req.body.txHash));
    })));
    NearRoutes.router.get('/tokens', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, network_routes_1.validateTokensRequest)(req.query);
        res.status(200).json(yield (0, network_controllers_1.getTokens)(req.query));
    })));
})(NearRoutes = exports.NearRoutes || (exports.NearRoutes = {}));
//# sourceMappingURL=near.routes.js.map