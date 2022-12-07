"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundsSettlementError = exports.OrderNotFoundError = exports.TickerNotFoundError = exports.MarketNotFoundError = exports.SerumishError = exports.TickerSource = exports.OrderType = exports.OrderStatus = exports.OrderSide = exports.SerumOpenOrders = exports.SerumOrderBook = exports.SerumMarket = exports.ISet = exports.IMap = void 0;
const serum_1 = require("@project-serum/serum");
const market_1 = require("@project-serum/serum/lib/market");
const immutable_1 = require("immutable");
const market_2 = require("./extensions/market");
exports.IMap = immutable_1.Map;
exports.ISet = immutable_1.Set;
exports.SerumMarket = market_2.Market;
exports.SerumOrderBook = serum_1.Orderbook;
exports.SerumOpenOrders = market_1.OpenOrders;
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["OPEN"] = "OPEN";
    OrderStatus["CANCELED"] = "CANCELED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CREATION_PENDING"] = "CREATION_PENDING";
    OrderStatus["CANCELATION_PENDING"] = "CANCELATION_PENDING";
    OrderStatus["UNKNOWN"] = "UNKNOWN";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["LIMIT"] = "LIMIT";
    OrderType["IOC"] = "IOC";
    OrderType["POST_ONLY"] = "POST_ONLY";
})(OrderType = exports.OrderType || (exports.OrderType = {}));
var TickerSource;
(function (TickerSource) {
    TickerSource["NOMIMCS"] = "nomics";
    TickerSource["ALEPH"] = "aleph";
})(TickerSource = exports.TickerSource || (exports.TickerSource = {}));
class SerumishError extends Error {
}
exports.SerumishError = SerumishError;
class MarketNotFoundError extends SerumishError {
}
exports.MarketNotFoundError = MarketNotFoundError;
class TickerNotFoundError extends SerumishError {
}
exports.TickerNotFoundError = TickerNotFoundError;
class OrderNotFoundError extends SerumishError {
}
exports.OrderNotFoundError = OrderNotFoundError;
class FundsSettlementError extends SerumishError {
}
exports.FundsSettlementError = FundsSettlementError;
//# sourceMappingURL=serum.types.js.map