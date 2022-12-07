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
exports.PerpAmmRoutes = exports.AmmLiquidityRoutes = exports.AmmRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../services/error-handler");
const amm_controllers_1 = require("./amm.controllers");
const amm_validators_1 = require("./amm.validators");
var AmmRoutes;
(function (AmmRoutes) {
    AmmRoutes.router = (0, express_1.Router)();
    AmmRoutes.router.post('/price', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePriceRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.price)(req.body));
    })));
    AmmRoutes.router.post('/trade', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateTradeRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.trade)(req.body));
    })));
    AmmRoutes.router.post('/estimateGas', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateEstimateGasRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.estimateGas)(req.body));
    })));
})(AmmRoutes = exports.AmmRoutes || (exports.AmmRoutes = {}));
var AmmLiquidityRoutes;
(function (AmmLiquidityRoutes) {
    AmmLiquidityRoutes.router = (0, express_1.Router)();
    AmmLiquidityRoutes.router.post('/position', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePositionRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.positionInfo)(req.body));
    })));
    AmmLiquidityRoutes.router.post('/add', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateAddLiquidityRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.addLiquidity)(req.body));
    })));
    AmmLiquidityRoutes.router.post('/remove', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateRemoveLiquidityRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.reduceLiquidity)(req.body));
    })));
    AmmLiquidityRoutes.router.post('/collect_fees', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateCollectFeeRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.collectFees)(req.body));
    })));
    AmmLiquidityRoutes.router.post('/price', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePoolPriceRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.poolPrice)(req.body));
    })));
})(AmmLiquidityRoutes = exports.AmmLiquidityRoutes || (exports.AmmLiquidityRoutes = {}));
var PerpAmmRoutes;
(function (PerpAmmRoutes) {
    PerpAmmRoutes.router = (0, express_1.Router)();
    PerpAmmRoutes.router.post('/market-prices', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpMarketStatusRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpMarketPrices)(req.body));
    })));
    PerpAmmRoutes.router.post('/market-status', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpMarketStatusRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.getMarketStatus)(req.body));
    })));
    PerpAmmRoutes.router.post('/pairs', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpPairsRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpPairs)(req.body));
    })));
    PerpAmmRoutes.router.post('/position', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpPositionRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpPosition)(req.body));
    })));
    PerpAmmRoutes.router.post('/balance', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpBalanceRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpBalance)(req.body));
    })));
    PerpAmmRoutes.router.post('/open', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpOpenTradeRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpOrder)(req.body, true));
    })));
    PerpAmmRoutes.router.post('/close', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validatePerpCloseTradeRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.perpOrder)(req.body, false));
    })));
    PerpAmmRoutes.router.post('/estimateGas', (0, error_handler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
        (0, amm_validators_1.validateEstimateGasRequest)(req.body);
        res.status(200).json(yield (0, amm_controllers_1.estimatePerpGas)(req.body));
    })));
})(PerpAmmRoutes = exports.PerpAmmRoutes || (exports.PerpAmmRoutes = {}));
//# sourceMappingURL=amm.routes.js.map