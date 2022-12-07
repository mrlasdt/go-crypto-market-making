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
exports.NetworkRoutes = exports.validateTokensRequest = exports.validatePollRequest = void 0;
const express_1 = require("express");
const ethereumControllers = __importStar(require("../chains/ethereum/ethereum.controllers"));
const solanaControllers = __importStar(require("../chains/solana/solana.controllers"));
const config_manager_v2_1 = require("../services/config-manager-v2");
const connection_manager_1 = require("../services/connection-manager");
const error_handler_1 = require("../services/error-handler");
const validators_1 = require("../services/validators");
const network_controllers_1 = require("./network.controllers");
const ethereum_validators_1 = require("../chains/ethereum/ethereum.validators");
const solana_validators_1 = require("../chains/solana/solana.validators");
exports.validatePollRequest = (0, validators_1.mkRequestValidator)([
    validators_1.validateTxHash,
]);
exports.validateTokensRequest = (0, validators_1.mkRequestValidator)([
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
]);
var NetworkRoutes;
(function (NetworkRoutes) {
    NetworkRoutes.router = (0, express_1.Router)();
    NetworkRoutes.router.get('/status', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        res.status(200).json(yield (0, network_controllers_1.getStatus)(req.query));
    })));
    NetworkRoutes.router.get('/config', (_req, res) => {
        res.status(200).json(config_manager_v2_1.ConfigManagerV2.getInstance().allConfigurations);
    });
    NetworkRoutes.router.post('/balances', (0, error_handler_1.asyncHandler)((req, res, _next) => __awaiter(this, void 0, void 0, function* () {
        if (req.body.chain == 'solana') {
            (0, solana_validators_1.validateSolanaBalanceRequest)(req.body);
            const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
            res
                .status(200)
                .json((yield solanaControllers.balances(chain, req.body)));
        }
        else {
            (0, ethereum_validators_1.validateBalanceRequest)(req.body);
            const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
            res
                .status(200)
                .json(yield ethereumControllers.balances(chain, req.body));
        }
    })));
    NetworkRoutes.router.post('/poll', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        if (req.body.chain == 'solana') {
            (0, solana_validators_1.validateSolanaPollRequest)(req.body);
            const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
            res.status(200).json(yield solanaControllers.poll(chain, req.body));
        }
        else {
            (0, exports.validatePollRequest)(req.body);
            const chain = yield (0, connection_manager_1.getChain)(req.body.chain, req.body.network);
            res.status(200).json(yield ethereumControllers.poll(chain, req.body));
        }
    })));
    NetworkRoutes.router.get('/tokens', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, exports.validateTokensRequest)(req.query);
        res.status(200).json(yield (0, network_controllers_1.getTokens)(req.query));
    })));
})(NetworkRoutes = exports.NetworkRoutes || (exports.NetworkRoutes = {}));
//# sourceMappingURL=network.routes.js.map