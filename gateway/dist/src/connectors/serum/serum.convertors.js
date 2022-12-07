"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSerumTypeToOrderType = exports.convertOrderTypeToSerumType = exports.convertSerumSideToOrderSide = exports.convertOrderSideToSerumSide = exports.convertToPostSettleFundsResponse = exports.convertToGetFilledOrderResponse = exports.convertToGetOpenOrderResponse = exports.convertToCancelOrderResponse = exports.convertToCreateOrderResponse = exports.convertToGetOrderResponse = exports.convertToGetTickerResponse = exports.convertToGetOrderBookResponse = exports.convertToGetMarketResponse = exports.convertSerumOrderToOrder = exports.convertToTicker = exports.convertArrayOfSerumOrdersToMapOfOrders = exports.convertMarketBidsAndAsksToOrderBook = exports.convertSerumMarketToMarket = exports.convertToJsonIfNeeded = exports.convertSingle = exports.convertMap = exports.convertMapMap = exports.convert = exports.Types = void 0;
const serum_helpers_1 = require("./serum.helpers");
const serum_types_1 = require("./serum.types");
var Types;
(function (Types) {
    Types["GetMarketsResponse"] = "GetMarketsResponse";
    Types["GetTickersResponse"] = "GetTickersResponse";
    Types["GetOrderBooksResponse"] = "GetOrderBooksResponse";
    Types["GetOrdersResponse"] = "GetOrdersResponse";
    Types["GetOpenOrdersResponse"] = "GetOpenOrdersResponse";
    Types["GetFilledOrdersResponse"] = "GetFilledOrdersResponse";
    Types["CreateOrdersResponse"] = "CreateOrdersResponse";
    Types["CancelOrdersResponse"] = "CancelOrdersResponse";
    Types["PostSettleFundsResponse"] = "PostSettleFundsResponse";
})(Types = exports.Types || (exports.Types = {}));
const convert = (input, type) => {
    if (serum_types_1.IMap.isMap(input)) {
        if (serum_types_1.IMap.isMap(input.first())) {
            return (0, exports.convertMapMap)(input, type);
        }
        return (0, exports.convertMap)(input, type);
    }
    return (0, exports.convertSingle)(input, type);
};
exports.convert = convert;
const convertMapMap = (input, type) => {
    const output = (0, serum_types_1.IMap)().asMutable();
    if (serum_types_1.IMap.isMap(input)) {
        if (serum_types_1.IMap.isMap(input.first())) {
            input.forEach((value, key) => {
                output.set(key, (0, exports.convert)(value, type));
            });
        }
    }
    return output;
};
exports.convertMapMap = convertMapMap;
const convertMap = (input, type) => {
    const output = (0, serum_types_1.IMap)().asMutable();
    if (serum_types_1.IMap.isMap(input)) {
        input.forEach((value, key) => {
            output.set(key, (0, exports.convert)(value, type));
        });
    }
    return output;
};
exports.convertMap = convertMap;
const convertSingle = (input, type) => {
    if (type === Types.GetMarketsResponse)
        return (0, exports.convertToGetMarketResponse)(input);
    if (type === Types.GetOrderBooksResponse)
        return (0, exports.convertToGetOrderBookResponse)(input);
    if (type === Types.GetTickersResponse)
        return (0, exports.convertToGetTickerResponse)(input);
    if (type === Types.GetOrdersResponse)
        return (0, exports.convertToGetOrderResponse)(input);
    if (type === Types.CreateOrdersResponse)
        return (0, exports.convertToCreateOrderResponse)(input);
    if (type === Types.CancelOrdersResponse)
        return (0, exports.convertToCancelOrderResponse)(input);
    if (type === Types.GetOpenOrdersResponse)
        return (0, exports.convertToGetOpenOrderResponse)(input);
    if (type === Types.GetFilledOrdersResponse)
        return (0, exports.convertToGetFilledOrderResponse)(input);
    if (type === Types.PostSettleFundsResponse)
        return (0, exports.convertToPostSettleFundsResponse)(input);
    throw new Error(`Unsupported input type "${type}".`);
};
exports.convertSingle = convertSingle;
const convertToJsonIfNeeded = (input) => {
    let output = input;
    if (serum_types_1.IMap.isMap(input))
        output = input.toJS();
    return output;
};
exports.convertToJsonIfNeeded = convertToJsonIfNeeded;
const convertSerumMarketToMarket = (market, extraInfo) => {
    return {
        name: extraInfo.name,
        address: extraInfo.address,
        programId: extraInfo.programId,
        deprecated: extraInfo.deprecated,
        minimumOrderSize: market.minOrderSize,
        tickSize: market.tickSize,
        minimumBaseIncrement: market.decoded.baseLotSize,
        fees: market.decoded.fee,
        market: market,
    };
};
exports.convertSerumMarketToMarket = convertSerumMarketToMarket;
const convertMarketBidsAndAsksToOrderBook = (market, asks, bids) => {
    return {
        market: market,
        asks: (0, exports.convertArrayOfSerumOrdersToMapOfOrders)(market, asks, undefined),
        bids: (0, exports.convertArrayOfSerumOrdersToMapOfOrders)(market, bids, undefined),
        orderBook: {
            asks: asks,
            bids: bids,
        },
    };
};
exports.convertMarketBidsAndAsksToOrderBook = convertMarketBidsAndAsksToOrderBook;
const convertArrayOfSerumOrdersToMapOfOrders = (market, orders, ownerAddress, status) => {
    const result = (0, serum_types_1.IMap)().asMutable();
    for (const order of orders) {
        result.set(order.clientId || order.orderId, (0, exports.convertSerumOrderToOrder)(market, order, undefined, undefined, ownerAddress, status));
    }
    return result;
};
exports.convertArrayOfSerumOrdersToMapOfOrders = convertArrayOfSerumOrdersToMapOfOrders;
const convertToTicker = (input) => {
    const price = parseFloat(input.price);
    const timestamp = new Date(input.last_updated).getTime();
    return {
        price: price,
        timestamp: timestamp,
        ticker: input,
    };
};
exports.convertToTicker = convertToTicker;
const convertSerumOrderToOrder = (market, order, candidate, orderParameters, ownerAddress, status, signature) => {
    var _a;
    return {
        id: ((_a = order === null || order === void 0 ? void 0 : order.clientId) === null || _a === void 0 ? void 0 : _a.toString()) || (candidate === null || candidate === void 0 ? void 0 : candidate.id) || undefined,
        exchangeId: (order === null || order === void 0 ? void 0 : order.orderId.toString()) || undefined,
        marketName: market.name,
        ownerAddress: ownerAddress || (candidate === null || candidate === void 0 ? void 0 : candidate.ownerAddress),
        price: (0, serum_helpers_1.getNotNullOrThrowError)((order === null || order === void 0 ? void 0 : order.price) || (candidate === null || candidate === void 0 ? void 0 : candidate.price), 'Price is not defined.'),
        amount: (0, serum_helpers_1.getNotNullOrThrowError)((order === null || order === void 0 ? void 0 : order.size) || (candidate === null || candidate === void 0 ? void 0 : candidate.amount), 'Amount is not defined.'),
        side: (0, serum_helpers_1.getNotNullOrThrowError)(order ? (0, exports.convertSerumSideToOrderSide)(order.side) : candidate === null || candidate === void 0 ? void 0 : candidate.side, 'Side is not defined.'),
        status: status,
        type: orderParameters && orderParameters.orderType
            ? (0, exports.convertSerumTypeToOrderType)(orderParameters.orderType)
            : undefined,
        fillmentTimestamp: undefined,
        signature: signature,
        order: order,
    };
};
exports.convertSerumOrderToOrder = convertSerumOrderToOrder;
const convertToGetMarketResponse = (input) => {
    var _a;
    return {
        name: input.name,
        address: input.address,
        programId: input.programId,
        deprecated: input.deprecated,
        minimumOrderSize: input.minimumOrderSize,
        tickSize: input.tickSize,
        minimumBaseIncrement: (_a = input.minimumBaseIncrement) === null || _a === void 0 ? void 0 : _a.toString(),
        fees: input.fees,
    };
};
exports.convertToGetMarketResponse = convertToGetMarketResponse;
const convertToGetOrderBookResponse = (input) => {
    return {
        market: (0, exports.convertToGetMarketResponse)(input.market),
        bids: input.bids
            .map((item) => (0, exports.convertToGetOrderResponse)(item))
            .toJS(),
        asks: input.asks
            .map((item) => (0, exports.convertToGetOrderResponse)(item))
            .toJS(),
    };
};
exports.convertToGetOrderBookResponse = convertToGetOrderBookResponse;
const convertToGetTickerResponse = (input) => {
    return {
        price: input.price,
        timestamp: input.timestamp,
    };
};
exports.convertToGetTickerResponse = convertToGetTickerResponse;
const convertToGetOrderResponse = (input) => {
    return {
        id: input.id,
        exchangeId: input.exchangeId,
        marketName: input.marketName,
        ownerAddress: input.ownerAddress,
        price: input.price,
        amount: input.amount,
        side: input.side,
        status: input.status,
        type: input.type,
        fillmentTimestamp: input.fillmentTimestamp,
    };
};
exports.convertToGetOrderResponse = convertToGetOrderResponse;
const convertToCreateOrderResponse = (input) => {
    return {
        id: input.id,
        exchangeId: input.exchangeId,
        marketName: input.marketName,
        ownerAddress: input.ownerAddress,
        price: input.price,
        amount: input.amount,
        side: input.side,
        status: input.status,
        type: input.type,
        signature: input.signature,
    };
};
exports.convertToCreateOrderResponse = convertToCreateOrderResponse;
const convertToCancelOrderResponse = (input) => {
    return {
        id: input.id,
        exchangeId: input.exchangeId,
        marketName: input.marketName,
        ownerAddress: (0, serum_helpers_1.getNotNullOrThrowError)(input.ownerAddress, 'Owner address is not defined.'),
        price: input.price,
        amount: input.amount,
        side: input.side,
        status: input.status,
        type: input.type,
        signature: input.signature,
    };
};
exports.convertToCancelOrderResponse = convertToCancelOrderResponse;
const convertToGetOpenOrderResponse = (input) => {
    return {
        id: input.id,
        exchangeId: input.exchangeId,
        marketName: input.marketName,
        ownerAddress: input.ownerAddress,
        price: input.price,
        amount: input.amount,
        side: input.side,
        status: input.status,
        type: input.type,
    };
};
exports.convertToGetOpenOrderResponse = convertToGetOpenOrderResponse;
const convertToGetFilledOrderResponse = (input) => {
    return {
        id: input.id,
        exchangeId: input.exchangeId,
        marketName: input.marketName,
        ownerAddress: input.ownerAddress,
        price: input.price,
        amount: input.amount,
        side: input.side,
        status: input.status,
        type: input.type,
        fillmentTimestamp: input.fillmentTimestamp,
    };
};
exports.convertToGetFilledOrderResponse = convertToGetFilledOrderResponse;
const convertToPostSettleFundsResponse = (input) => {
    return input;
};
exports.convertToPostSettleFundsResponse = convertToPostSettleFundsResponse;
const convertOrderSideToSerumSide = (input) => {
    return input.toLowerCase();
};
exports.convertOrderSideToSerumSide = convertOrderSideToSerumSide;
const convertSerumSideToOrderSide = (input) => {
    if (input == 'buy')
        return serum_types_1.OrderSide.BUY;
    if (input == 'sell')
        return serum_types_1.OrderSide.SELL;
    throw new Error(`Invalid order side: ${input}`);
};
exports.convertSerumSideToOrderSide = convertSerumSideToOrderSide;
const convertOrderTypeToSerumType = (input) => {
    if (!input)
        return 'limit';
    else if (['limit', 'ioc'].includes(input.toLowerCase()))
        return input.toLowerCase();
    else if (['post_only', 'postOnly'].includes(input.toLowerCase()))
        return 'postOnly';
    else
        throw new Error(`Invalid order type: ${input}`);
};
exports.convertOrderTypeToSerumType = convertOrderTypeToSerumType;
const convertSerumTypeToOrderType = (input) => {
    if (input == 'limit')
        return serum_types_1.OrderType.LIMIT;
    if (input == 'ioc')
        return serum_types_1.OrderType.IOC;
    if (input == 'postOnly')
        return serum_types_1.OrderType.POST_ONLY;
    throw new Error(`Invalid order type: ${input}`);
};
exports.convertSerumTypeToOrderType = convertSerumTypeToOrderType;
//# sourceMappingURL=serum.convertors.js.map