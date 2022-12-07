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
exports.settleFunds = exports.getFilledOrders = exports.getOpenOrders = exports.cancelOrders = exports.createOrders = exports.getOrders = exports.getTickers = exports.getOrderBooks = exports.getMarkets = void 0;
const serumControllers = __importStar(require("../connectors/serum/serum.controllers"));
const connection_manager_1 = require("../services/connection-manager");
function getMarkets(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getMarkets(chain, connector, request);
    });
}
exports.getMarkets = getMarkets;
function getOrderBooks(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getOrderBooks(chain, connector, request);
    });
}
exports.getOrderBooks = getOrderBooks;
function getTickers(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getTickers(chain, connector, request);
    });
}
exports.getTickers = getTickers;
function getOrders(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getOrders(chain, connector, request);
    });
}
exports.getOrders = getOrders;
function createOrders(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.createOrders(chain, connector, request);
    });
}
exports.createOrders = createOrders;
function cancelOrders(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.cancelOrders(chain, connector, request);
    });
}
exports.cancelOrders = cancelOrders;
function getOpenOrders(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getOpenOrders(chain, connector, request);
    });
}
exports.getOpenOrders = getOpenOrders;
function getFilledOrders(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.getFilledOrders(chain, connector, request);
    });
}
exports.getFilledOrders = getFilledOrders;
function settleFunds(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const chain = yield (0, connection_manager_1.getChain)(request.chain, request.network);
        const connector = yield (0, connection_manager_1.getConnector)(request.chain, request.network, request.connector);
        return serumControllers.settleFunds(chain, connector, request);
    });
}
exports.settleFunds = settleFunds;
//# sourceMappingURL=clob.controllers.js.map