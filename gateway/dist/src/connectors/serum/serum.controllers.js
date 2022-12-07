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
exports.settleFunds = exports.getFilledOrders = exports.getOpenOrders = exports.cancelOrders = exports.createOrders = exports.getOrders = exports.getTickers = exports.getOrderBooks = exports.getMarkets = void 0;
const http_status_codes_1 = require("http-status-codes");
const common_interfaces_1 = require("../../services/common-interfaces");
const error_handler_1 = require("../../services/error-handler");
require("./extensions/json");
const serum_convertors_1 = require("./serum.convertors");
const serum_types_1 = require("./serum.types");
const serum_validators_1 = require("./serum.validators");
function getMarkets(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('name' in request) {
            (0, serum_validators_1.validateGetMarketRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getMarket(request.name), serum_convertors_1.Types.GetMarketsResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('names' in request) {
            (0, serum_validators_1.validateGetMarketsRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getMarkets(request.names), serum_convertors_1.Types.GetMarketsResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllMarkets(), serum_convertors_1.Types.GetMarketsResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getMarkets = getMarkets;
function getOrderBooks(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('marketName' in request) {
            (0, serum_validators_1.validateGetOrderBookRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getOrderBook(request.marketName), serum_convertors_1.Types.GetOrderBooksResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('marketNames' in request) {
            (0, serum_validators_1.validateGetOrderBooksRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getOrderBooks(request.marketNames), serum_convertors_1.Types.GetOrderBooksResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllOrderBooks(), serum_convertors_1.Types.GetOrderBooksResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getOrderBooks = getOrderBooks;
function getTickers(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('marketName' in request) {
            (0, serum_validators_1.validateGetTickerRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getTicker(request.marketName), serum_convertors_1.Types.GetTickersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('marketNames' in request) {
            (0, serum_validators_1.validateGetTickersRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getTickers(request.marketNames), serum_convertors_1.Types.GetTickersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllTickers(), serum_convertors_1.Types.GetTickersResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getTickers = getTickers;
function getOrders(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('order' in request) {
            (0, serum_validators_1.validateGetOrderRequest)(request.order);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getOrder(request.order), serum_convertors_1.Types.GetOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('orders' in request) {
            (0, serum_validators_1.validateGetOrdersRequest)(request.orders);
            try {
                const orders = yield serum.getOrders(request.orders);
                if (!orders.size)
                    throw new serum_types_1.OrderNotFoundError('No orders found.');
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(orders, serum_convertors_1.Types.GetOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        (0, serum_validators_1.validateGetAllOrdersRequest)(request);
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllOrders(request.ownerAddress), serum_convertors_1.Types.GetFilledOrdersResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getOrders = getOrders;
function createOrders(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('order' in request) {
            (0, serum_validators_1.validateCreateOrderRequest)(request.order);
            response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.createOrder(request.order), serum_convertors_1.Types.CreateOrdersResponse));
            response.status = http_status_codes_1.StatusCodes.OK;
            return response;
        }
        if ('orders' in request) {
            (0, serum_validators_1.validateCreateOrdersRequest)(request.orders);
            response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.createOrders(request.orders), serum_convertors_1.Types.CreateOrdersResponse));
            response.status = http_status_codes_1.StatusCodes.OK;
            return response;
        }
        throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.BAD_REQUEST, `No order(s) was/were informed.`);
    });
}
exports.createOrders = createOrders;
function cancelOrders(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('order' in request) {
            (0, serum_validators_1.validateCancelOrderRequest)(request.order);
            response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.cancelOrder(request.order), serum_convertors_1.Types.CancelOrdersResponse));
            response.status = http_status_codes_1.StatusCodes.OK;
            return response;
        }
        if ('orders' in request) {
            (0, serum_validators_1.validateCancelOrdersRequest)(request.orders);
            response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.cancelOrders(request.orders), serum_convertors_1.Types.CancelOrdersResponse));
            response.status = http_status_codes_1.StatusCodes.OK;
            return response;
        }
        (0, serum_validators_1.validateCancelAllOrdersRequest)(request);
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.cancelAllOrders(request.ownerAddress), serum_convertors_1.Types.CancelOrdersResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.cancelOrders = cancelOrders;
function getOpenOrders(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('order' in request) {
            (0, serum_validators_1.validateGetOpenOrderRequest)(request.order);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getOpenOrder(request.order), serum_convertors_1.Types.GetOpenOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('orders' in request) {
            (0, serum_validators_1.validateGetOpenOrdersRequest)(request.orders);
            try {
                const orders = yield serum.getOpenOrders(request.orders);
                if (!orders.size)
                    throw new serum_types_1.OrderNotFoundError('No open orders found.');
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(orders, serum_convertors_1.Types.GetOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        (0, serum_validators_1.validateGetAllOrdersRequest)(request);
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllOpenOrders(request.ownerAddress), serum_convertors_1.Types.GetOpenOrdersResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getOpenOrders = getOpenOrders;
function getFilledOrders(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('order' in request) {
            (0, serum_validators_1.validateGetFilledOrderRequest)(request.order);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getFilledOrder(request.order), serum_convertors_1.Types.GetFilledOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('orders' in request) {
            (0, serum_validators_1.validateGetFilledOrdersRequest)(request.orders);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getFilledOrders(request.orders), serum_convertors_1.Types.GetFilledOrdersResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        (0, serum_validators_1.validateGetAllOrdersRequest)(request);
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.getAllFilledOrders(), serum_convertors_1.Types.GetFilledOrdersResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.getFilledOrders = getFilledOrders;
function settleFunds(_solana, serum, request) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = new common_interfaces_1.ResponseWrapper();
        if ('marketName' in request) {
            (0, serum_validators_1.validateSettleFundsRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.settleFundsForMarket(request.marketName, request.ownerAddress), serum_convertors_1.Types.PostSettleFundsResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        if ('marketNames' in request) {
            (0, serum_validators_1.validateSettleFundsSeveralRequest)(request);
            try {
                response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.settleFundsForMarkets(request.marketNames, request.ownerAddress), serum_convertors_1.Types.PostSettleFundsResponse));
                response.status = http_status_codes_1.StatusCodes.OK;
                return response;
            }
            catch (exception) {
                if (exception instanceof serum_types_1.MarketNotFoundError) {
                    throw new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, exception.message);
                }
                else {
                    throw exception;
                }
            }
        }
        (0, serum_validators_1.validateSettleAllFundsRequest)(request);
        response.body = (0, serum_convertors_1.convertToJsonIfNeeded)((0, serum_convertors_1.convert)(yield serum.settleAllFunds(request.ownerAddress), serum_convertors_1.Types.PostSettleFundsResponse));
        response.status = http_status_codes_1.StatusCodes.OK;
        return response;
    });
}
exports.settleFunds = settleFunds;
//# sourceMappingURL=serum.controllers.js.map