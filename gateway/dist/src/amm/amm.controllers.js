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
exports.estimatePerpGas = exports.getMarketStatus = exports.perpPairs = exports.perpBalance = exports.perpPosition = exports.perpOrder = exports.perpMarketPrices = exports.estimateGas = exports.poolPrice = exports.positionInfo = exports.collectFees = exports.reduceLiquidity = exports.addLiquidity = exports.trade = exports.price = void 0;
const uniswap_controllers_1 = require("../connectors/uniswap/uniswap.controllers");
const ref_controllers_1 = require("../connectors/ref/ref.controllers");
const perp_controllers_1 = require("../connectors/perp/perp.controllers");
const connection_manager_1 = require("../services/connection-manager");
function price(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        if ('routerAbi' in connector) {
            return (0, uniswap_controllers_1.price)(chain, connector, req);
        }
        else {
            return (0, ref_controllers_1.price)(chain, connector, req);
        }
    });
}
exports.price = price;
function trade(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        if ('routerAbi' in connector) {
            return (0, uniswap_controllers_1.trade)(chain, connector, req);
        }
        else {
            return (0, ref_controllers_1.trade)(chain, connector, req);
        }
    });
}
exports.trade = trade;
function addLiquidity(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, uniswap_controllers_1.addLiquidity)(chain, connector, req);
    });
}
exports.addLiquidity = addLiquidity;
function reduceLiquidity(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, uniswap_controllers_1.removeLiquidity)(chain, connector, req);
    });
}
exports.reduceLiquidity = reduceLiquidity;
function collectFees(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, uniswap_controllers_1.collectEarnedFees)(chain, connector, req);
    });
}
exports.collectFees = collectFees;
function positionInfo(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, uniswap_controllers_1.positionInfo)(chain, connector, req);
    });
}
exports.positionInfo = positionInfo;
function poolPrice(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, uniswap_controllers_1.poolPrice)(chain, connector, req);
    });
}
exports.poolPrice = poolPrice;
function estimateGas(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        if ('routerAbi' in connector) {
            return (0, uniswap_controllers_1.estimateGas)(chain, connector);
        }
        else {
            return (0, ref_controllers_1.estimateGas)(chain, connector);
        }
    });
}
exports.estimateGas = estimateGas;
function perpMarketPrices(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, perp_controllers_1.getPriceData)(chain, connector, req);
    });
}
exports.perpMarketPrices = perpMarketPrices;
function perpOrder(req, isOpen) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector, req.address);
        return (0, perp_controllers_1.createTakerOrder)(chain, connector, req, isOpen);
    });
}
exports.perpOrder = perpOrder;
function perpPosition(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector, req.address);
        return (0, perp_controllers_1.getPosition)(chain, connector, req);
    });
}
exports.perpPosition = perpPosition;
function perpBalance(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = (yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector, req.address));
        return (0, perp_controllers_1.getAccountValue)(chain, connector);
    });
}
exports.perpBalance = perpBalance;
function perpPairs(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, perp_controllers_1.getAvailablePairs)(chain, connector);
    });
}
exports.perpPairs = perpPairs;
function getMarketStatus(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, perp_controllers_1.checkMarketStatus)(chain, connector, req);
    });
}
exports.getMarketStatus = getMarketStatus;
function estimatePerpGas(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(req.chain, req.network);
        const connector = yield (0, connection_manager_1.getConnector)(req.chain, req.network, req.connector);
        return (0, perp_controllers_1.estimateGas)(chain, connector);
    });
}
exports.estimatePerpGas = estimatePerpGas;
//# sourceMappingURL=amm.controllers.js.map