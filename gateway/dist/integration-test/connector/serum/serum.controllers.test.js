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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serum_1 = require("@project-serum/serum");
const bn_js_1 = __importDefault(require("bn.js"));
const http_status_codes_1 = require("http-status-codes");
require("jest-extended");
const solana_1 = require("../../../src/chains/solana/solana");
const serum_2 = require("../../../src/connectors/serum/serum");
const serum_controllers_1 = require("../../../src/connectors/serum/serum.controllers");
const serum_helpers_1 = require("../../../src/connectors/serum/serum.helpers");
const serum_types_1 = require("../../../src/connectors/serum/serum.types");
const config_manager_v2_1 = require("../../../src/services/config-manager-v2");
const error_handler_1 = require("../../../src/services/error-handler");
const patch_1 = require("../../../test/services/patch");
const config_1 = __importDefault(require("../../../test/chains/solana/serum/fixtures/config"));
const helpers_1 = require("../../../test/chains/solana/serum/fixtures/helpers");
const patches_1 = __importStar(require("../../../test/chains/solana/serum/fixtures/patches/patches"));
jest.setTimeout(5 * 60 * 1000);
(0, patches_1.disablePatches)();
let solana;
let serum;
let patches;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
    configManager.set('solana.timeout.all', 100000);
    configManager.set('solana.retry.all.maxNumberOfRetries', 5);
    configManager.set('solana.retry.all.delayBetweenRetries', 500);
    configManager.set('solana.parallel.all.batchSize', 100);
    configManager.set('solana.parallel.all.delayBetweenBatches', 500);
    solana = yield solana_1.Solana.getInstance(config_1.default.serum.network);
    serum = yield serum_2.Serum.getInstance(config_1.default.serum.chain, config_1.default.serum.network);
    patches = yield (0, patches_1.default)(solana, serum);
    patches.get('solana/loadTokens')();
    patches.get('serum/serumGetMarketsInformation')();
    patches.get('serum/market/load')();
    yield solana.init();
    yield serum.init();
}));
afterEach(() => {
    (0, patch_1.unpatch)();
});
const commonParameters = {
    chain: config_1.default.serum.chain,
    network: config_1.default.serum.network,
    connector: config_1.default.serum.connector,
};
const allowedMarkets = Object.values(config_1.default.solana.markets).map((market) => market.name);
const targetMarkets = allowedMarkets.slice(0, 2);
const numberOfAllowedMarkets = allowedMarkets.length;
const marketName = targetMarkets[0];
const orderIds = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const candidateOrders = (0, helpers_1.getNewCandidateOrdersTemplates)(10, 0);
let request;
let response;
it('getMarket ["SOL/USDT"]', () => __awaiter(void 0, void 0, void 0, function* () {
    request = Object.assign(Object.assign({}, commonParameters), { name: marketName });
    response = yield (0, serum_controllers_1.getMarkets)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const market = response.body;
    expect(market).toBeDefined();
    const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
    expect(targetMarket).toBeDefined();
    expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
    expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
    expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
    expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
    expect(market.minimumOrderSize).toBeGreaterThan(0);
    expect(market.tickSize).toBeGreaterThan(0);
    expect(market.minimumBaseIncrement).toBeDefined();
    expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
}));
it('getMarkets ["SOL/USDT", "SOL/USDC"]', () => __awaiter(void 0, void 0, void 0, function* () {
    request = Object.assign(Object.assign({}, commonParameters), { names: targetMarkets });
    response = yield (0, serum_controllers_1.getMarkets)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const marketsMap = new Map(Object.entries(response.body));
    expect(marketsMap).toBeDefined();
    expect(marketsMap.size).toBe(targetMarkets.length);
    for (const [marketName, market] of marketsMap) {
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
        expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
        expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
        expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
        expect(market.minimumOrderSize).toBeGreaterThan(0);
        expect(market.tickSize).toBeGreaterThan(0);
        expect(market.minimumBaseIncrement).toBeDefined();
        expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
    }
}));
it('getMarkets (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    request = Object.assign({}, commonParameters);
    response = yield (0, serum_controllers_1.getMarkets)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const marketsMap = new Map(Object.entries(response.body));
    expect(marketsMap).toBeDefined();
    expect(marketsMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, market] of marketsMap) {
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
        expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
        expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
        expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
        expect(market.minimumOrderSize).toBeGreaterThan(0);
        expect(market.tickSize).toBeGreaterThan(0);
        expect(market.minimumBaseIncrement).toBeDefined();
        expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
    }
}));
it('getOrderBook ["SOL/USDT"]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/loadAsks')('SOL/USDT');
    yield patches.get('serum/market/loadBids')('SOL/USDT');
    request = Object.assign(Object.assign({}, commonParameters), { marketName: marketName });
    response = yield (0, serum_controllers_1.getOrderBooks)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const orderBook = response.body;
    expect(orderBook).toBeDefined();
    expect(orderBook.market).toBeDefined();
    const market = orderBook.market;
    const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
    expect(targetMarket).toBeDefined();
    expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
    expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
    expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
    expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
    expect(market.minimumOrderSize).toBeGreaterThan(0);
    expect(market.tickSize).toBeGreaterThan(0);
    expect(market.minimumBaseIncrement).toBeDefined();
    expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
    expect(Object.entries(orderBook.bids).length).toBeGreaterThan(0);
    expect(Object.entries(orderBook.bids).length).toBeGreaterThan(0);
}));
it('getOrderBooks ["SOL/USDT", "SOL/USDC"]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(targetMarkets.flatMap((marketName) => __awaiter(void 0, void 0, void 0, function* () {
        yield patches.get('serum/market/loadAsks')(marketName);
        yield patches.get('serum/market/loadBids')(marketName);
    })));
    request = Object.assign(Object.assign({}, commonParameters), { marketNames: targetMarkets });
    response = yield (0, serum_controllers_1.getOrderBooks)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const orderBooksMap = new Map(Object.entries(response.body));
    expect(orderBooksMap).toBeDefined();
    expect(orderBooksMap.size).toBe(targetMarkets.length);
    for (const [marketName, orderBook] of orderBooksMap) {
        expect(orderBook).toBeDefined();
        expect(orderBook.market).toBeDefined();
        const market = orderBook.market;
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
        expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
        expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
        expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
        expect(market.minimumOrderSize).toBeGreaterThan(0);
        expect(market.tickSize).toBeGreaterThan(0);
        expect(market.minimumBaseIncrement).toBeDefined();
        expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
    }
}));
it('getOrderBooks (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(allowedMarkets.flatMap((marketName) => __awaiter(void 0, void 0, void 0, function* () {
        yield patches.get('serum/market/loadAsks')(marketName);
        yield patches.get('serum/market/loadBids')(marketName);
    })));
    request = Object.assign({}, commonParameters);
    response = yield (0, serum_controllers_1.getOrderBooks)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const orderBooksMap = new Map(Object.entries(response.body));
    expect(orderBooksMap).toBeDefined();
    expect(orderBooksMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, orderBook] of orderBooksMap) {
        expect(orderBook).toBeDefined();
        expect(orderBook.market).toBeDefined();
        const market = orderBook.market;
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(market.name).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.name);
        expect(market.address.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.address.toString());
        expect(market.programId.toString()).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.programId.toString());
        expect(market.deprecated).toBe(targetMarket === null || targetMarket === void 0 ? void 0 : targetMarket.deprecated);
        expect(market.minimumOrderSize).toBeGreaterThan(0);
        expect(market.tickSize).toBeGreaterThan(0);
        expect(market.minimumBaseIncrement).toBeDefined();
        expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
    }
}));
it('getTicker ["SOL/USDT"]', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('serum/getTicker')();
    request = Object.assign(Object.assign({}, commonParameters), { marketName: marketName });
    response = yield (0, serum_controllers_1.getTickers)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ticker = response.body;
    expect(ticker).toBeDefined();
    const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
    expect(targetMarket).toBeDefined();
    expect(ticker.price).toBeGreaterThan(0);
    expect(ticker.timestamp).toBeGreaterThan(0);
    expect(new Date(ticker.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
}));
it('getTickers ["SOL/USDT", "SOL/USDC"]', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('serum/getTicker')();
    request = Object.assign(Object.assign({}, commonParameters), { marketNames: targetMarkets });
    response = yield (0, serum_controllers_1.getTickers)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const tickersMap = new Map(Object.entries(response.body));
    expect(tickersMap).toBeDefined();
    expect(tickersMap.size).toBe(targetMarkets.length);
    for (const [marketName, ticker] of tickersMap) {
        expect(ticker).toBeDefined();
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(ticker.price).toBeGreaterThan(0);
        expect(ticker.timestamp).toBeGreaterThan(0);
        expect(new Date(ticker.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    }
}));
it('getTickers (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('serum/getTicker')();
    request = Object.assign({}, commonParameters);
    response = yield (0, serum_controllers_1.getTickers)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const tickersMap = new Map(Object.entries(response.body));
    expect(tickersMap).toBeDefined();
    expect(tickersMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ticker] of tickersMap) {
        expect(ticker).toBeDefined();
        const targetMarket = serum_1.MARKETS.find((market) => market.name === marketName && !market.deprecated);
        expect(targetMarket).toBeDefined();
        expect(ticker.price).toBeGreaterThan(0);
        expect(ticker.timestamp).toBeGreaterThan(0);
        expect(new Date(ticker.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    }
}));
it('cancelOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const canceledOrdersMap = new Map(Object.entries(response.body));
    expect(canceledOrdersMap).toBeDefined();
    expect(canceledOrdersMap.size).toBe(0);
}));
it('getOpenOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrdersMapMap = new Map(Object.entries(response.body));
    expect(openOrdersMapMap).toBeDefined();
    expect(openOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, openOrdersMapObject] of openOrdersMapMap) {
        const openOrdersMap = new Map(Object.entries(openOrdersMapObject));
        expect(allowedMarkets).toContain(marketName);
        expect(openOrdersMap).toBeDefined();
        expect(openOrdersMap.size).toBe(0);
    }
}));
it('createOrder [0]', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketPlaceOrders')();
    request = Object.assign(Object.assign({}, commonParameters), { order: candidateOrders[0] });
    response = yield (0, serum_controllers_1.createOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const createdOrder = response.body;
    const candidateOrder = request.order;
    expect(createdOrder).toBeDefined();
    expect(createdOrder.id).toBe(candidateOrder.id);
    expect(createdOrder.marketName).toBe(candidateOrder.marketName);
    expect(createdOrder.ownerAddress).toBe(candidateOrder.ownerAddress);
    expect(createdOrder.price).toBe(candidateOrder.price);
    expect(createdOrder.amount).toBe(candidateOrder.amount);
    expect(createdOrder.side).toBe(candidateOrder.side);
    expect(createdOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
    expect(createdOrder.type).toBe(candidateOrder.type);
}));
it('createOrders [1, 2, 3, 4, 5, 6, 7]', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketPlaceOrders')();
    request = Object.assign(Object.assign({}, commonParameters), { orders: candidateOrders.slice(1, 8) });
    response = yield (0, serum_controllers_1.createOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const createdOrders = new Map(Object.entries(response.body));
    expect(createdOrders).toBeDefined();
    expect(createdOrders.size).toBe(request.orders.length);
    for (const [orderId, createdOrder] of createdOrders) {
        const candidateOrder = request.orders.find((order) => order.id === orderId);
        expect(createdOrder).toBeDefined();
        expect(createdOrder.id).toBe(orderId);
        expect(createdOrder.marketName).toBe(candidateOrder.marketName);
        expect(createdOrder.ownerAddress).toBe(candidateOrder.ownerAddress);
        expect(createdOrder.price).toBe(candidateOrder.price);
        expect(createdOrder.amount).toBe(candidateOrder.amount);
        expect(createdOrder.side).toBe(candidateOrder.side);
        expect(createdOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
        expect(createdOrder.type).toBe(candidateOrder.type);
    }
}));
it('getOpenOrder [0]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([candidateOrders[0]]);
    request = Object.assign(Object.assign({}, commonParameters), { order: {
            id: orderIds[0],
            ownerAddress: config_1.default.solana.wallet.owner.publicKey,
        } });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrder = response.body;
    expect(openOrder).toBeDefined();
    expect(openOrder.id).toBe(orderIds[0]);
    expect(targetMarkets).toContain(openOrder.marketName);
    expect(openOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
    expect(openOrder.price).toBeGreaterThan(0);
    expect(openOrder.amount).toBeGreaterThan(0);
    expect(Object.keys(serum_types_1.OrderSide)).toContain(openOrder.side);
    expect(openOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
}));
it('getOrder [1]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([candidateOrders[1]]);
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { order: {
            id: orderIds[1],
            ownerAddress: config_1.default.solana.wallet.owner.publicKey,
        } });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrder = response.body;
    expect(openOrder).toBeDefined();
    expect(openOrder.id).toBe(orderIds[1]);
    expect(targetMarkets).toContain(openOrder.marketName);
    expect(openOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
    expect(openOrder.price).toBeGreaterThan(0);
    expect(openOrder.amount).toBeGreaterThan(0);
    expect(Object.keys(serum_types_1.OrderSide)).toContain(openOrder.side);
    expect(openOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
}));
it('getOpenOrders [2, 3]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(2, 4));
    request = Object.assign(Object.assign({}, commonParameters), { orders: [
            {
                ids: orderIds.slice(2, 4),
                ownerAddress: config_1.default.solana.wallet.owner.publicKey,
            },
        ] });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrders = new Map(Object.entries(response.body));
    expect(openOrders).toBeDefined();
    expect(openOrders.size).toBe(request.orders[0].ids.length);
    for (const [id, openOrder] of openOrders) {
        expect(openOrder).toBeDefined();
        expect(request.orders[0].ids).toContain(openOrder.id);
        expect(openOrder.id).toBe(id);
        expect(targetMarkets).toContain(openOrder.marketName);
        expect(openOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
        expect(openOrder.price).toBeGreaterThan(0);
        expect(openOrder.amount).toBeGreaterThan(0);
        expect(Object.keys(serum_types_1.OrderSide)).toContain(openOrder.side);
        expect(openOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
    }
}));
it('getOrders [4, 5]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(4, 6));
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { orders: [
            {
                ids: orderIds.slice(4, 6),
                ownerAddress: config_1.default.solana.wallet.owner.publicKey,
            },
        ] });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ordersMap = new Map(Object.entries(response.body));
    expect(ordersMap).toBeDefined();
    expect(ordersMap.size).toBe(request.orders[0].ids.length);
    for (const [id, order] of ordersMap) {
        expect(order).toBeDefined();
        expect(request.orders[0].ids).toContain(order.id);
        expect(order.id).toBe(id);
        expect(targetMarkets).toContain(order.marketName);
        expect(order.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
        expect(order.price).toBeGreaterThan(0);
        expect(order.amount).toBeGreaterThan(0);
        expect(order.side).toBeOneOf(Object.keys(serum_types_1.OrderSide));
        expect(order.status).toBe(serum_types_1.OrderStatus.OPEN);
    }
}));
it('getOpenOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(0, 8));
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrdersMapMap = new Map(Object.entries(response.body));
    expect(openOrdersMapMap).toBeDefined();
    expect(openOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, openOrdersMapObject] of openOrdersMapMap) {
        const openOrdersMap = new Map(Object.entries(openOrdersMapObject));
        expect(openOrdersMap).toBeDefined();
        for (const [id, openOrder] of openOrdersMap) {
            expect(openOrder).toBeDefined();
            expect(openOrder.id).toBe(id);
            expect(openOrder.exchangeId).toBeDefined();
            expect(openOrder.marketName).toBe(marketName);
            expect(targetMarkets).toContain(openOrder.marketName);
            expect(openOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
            expect(openOrder.price).toBeGreaterThan(0);
            expect(openOrder.amount).toBeGreaterThan(0);
            expect(Object.keys(serum_types_1.OrderSide)).toContain(openOrder.side);
            expect(openOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
        }
    }
}));
it('getOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(0, 8));
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ordersMapMap = new Map(Object.entries(response.body));
    expect(ordersMapMap).toBeDefined();
    expect(ordersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ordersMapObject] of ordersMapMap) {
        const ordersMap = new Map(Object.entries(ordersMapObject));
        expect(ordersMap).toBeDefined();
        for (const [id, order] of ordersMap) {
            expect(order).toBeDefined();
            expect(order.id).toBe(id);
            expect(order.exchangeId).toBeDefined();
            expect(order.marketName).toBe(marketName);
            expect(targetMarkets).toContain(order.marketName);
            expect(order.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
            expect(order.price).toBeGreaterThan(0);
            expect(order.amount).toBeGreaterThan(0);
            expect(order.side).toBeOneOf(Object.keys(serum_types_1.OrderSide));
            expect(order.status).toBe(serum_types_1.OrderStatus.OPEN);
        }
    }
}));
it('cancelOrders [0]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
    yield patches.get('serum/market/loadOrdersForOwner')([candidateOrders[0]]);
    request = Object.assign(Object.assign({}, commonParameters), { order: {
            id: orderIds[0],
            ownerAddress: config_1.default.solana.wallet.owner.publicKey,
            marketName: marketName,
        } });
    response = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const canceledOrder = response.body;
    const candidateOrder = candidateOrders.find((item) => item.id === request.order.id);
    expect(canceledOrder).toBeDefined();
    expect(canceledOrder.id).toBe(candidateOrder.id);
    expect(canceledOrder.exchangeId).toBeDefined();
    expect(canceledOrder.marketName).toBe(candidateOrder.marketName);
    expect(canceledOrder.ownerAddress).toBe(candidateOrder.ownerAddress);
    expect(canceledOrder.price).toBe(candidateOrder.price);
    expect(canceledOrder.amount).toBe(candidateOrder.amount);
    expect(canceledOrder.side).toBe(candidateOrder.side);
    expect([serum_types_1.OrderStatus.CANCELED, serum_types_1.OrderStatus.CANCELATION_PENDING]).toContain(canceledOrder.status);
}));
it('getOpenOrders [0]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { order: {
            id: orderIds[0],
            ownerAddress: config_1.default.solana.wallet.owner.publicKey,
        } });
    yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    })).rejects.toThrowError(new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, 'No open order found with id / exchange id "0 / undefined".'));
}));
it('getFilledOrders [1]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { order: {
            id: orderIds[1],
            ownerAddress: config_1.default.solana.wallet.owner.publicKey,
        } });
    yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, serum_controllers_1.getFilledOrders)(solana, serum, request);
    })).rejects.toThrowError(new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, 'No filled order found with id / exchange id "1 / undefined".'));
}));
it('getFilledOrders [2, 3]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { orders: [
            {
                ids: orderIds.slice(2, 4),
                ownerAddress: config_1.default.solana.wallet.owner.publicKey,
            },
        ] });
    yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, serum_controllers_1.getFilledOrders)(solana, serum, request);
    })).rejects.toThrowError(new error_handler_1.HttpException(http_status_codes_1.StatusCodes.NOT_FOUND, 'No filled orders found.'));
}));
it('getFilledOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getFilledOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const filledOrdersMapMap = new Map(Object.entries(response.body));
    expect(filledOrdersMapMap).toBeDefined();
    expect(filledOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ordersMap] of filledOrdersMapMap) {
        expect(ordersMap).toBeDefined();
        expect(ordersMap.size).toBeUndefined();
        expect(allowedMarkets).toContain(marketName);
    }
}));
it('cancelOrders [4, 5]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(4, 6));
    request = Object.assign(Object.assign({}, commonParameters), { orders: [
            {
                ids: orderIds.slice(4, 6),
                ownerAddress: config_1.default.solana.wallet.owner.publicKey,
                marketName: marketName,
            },
        ] });
    response = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const canceledOrdersMap = new Map(Object.entries(response.body));
    expect(canceledOrdersMap).toBeDefined();
    expect(canceledOrdersMap.size).toBe(request.orders[0].ids.length);
    for (const [id, canceledOrder] of canceledOrdersMap) {
        expect(canceledOrder).toBeDefined();
        expect(canceledOrder.id).toBe(id);
        expect(canceledOrder.exchangeId).toBeDefined();
        expect(targetMarkets).toContain(canceledOrder.marketName);
        expect(canceledOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
        expect(canceledOrder.price).toBeGreaterThan(0);
        expect(canceledOrder.amount).toBeGreaterThan(0);
        expect(Object.keys(serum_types_1.OrderSide)).toContain(canceledOrder.side);
        expect([serum_types_1.OrderStatus.CANCELED, serum_types_1.OrderStatus.CANCELATION_PENDING]).toContain(canceledOrder.status);
    }
}));
it('getOrders [4, 5]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { orders: [
            {
                ids: orderIds.slice(4, 6),
                ownerAddress: config_1.default.solana.wallet.owner.publicKey,
            },
        ] });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.NOT_FOUND);
}));
it('cancelOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const canceledOrdersMap = new Map(Object.entries(response.body));
    expect(canceledOrdersMap).toBeDefined();
    expect(canceledOrdersMap.size).toBe(numberOfAllowedMarkets);
    for (const [id, canceledOrder] of canceledOrdersMap) {
        expect(canceledOrder).toBeDefined();
        expect(canceledOrder.id).toBe(id);
        expect(canceledOrder.exchangeId).toBeDefined();
        expect(targetMarkets).toContain(canceledOrder.marketName);
        expect(canceledOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
        expect(canceledOrder.price).toBeGreaterThan(0);
        expect(canceledOrder.amount).toBeGreaterThan(0);
        expect(Object.keys(serum_types_1.OrderSide)).toContain(canceledOrder.side);
        expect([serum_types_1.OrderStatus.CANCELED, serum_types_1.OrderStatus.CANCELATION_PENDING]).toContain(canceledOrder.status);
    }
}));
it('getOpenOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrdersMapMap = new Map(Object.entries(response.body));
    expect(openOrdersMapMap).toBeDefined();
    expect(openOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, openOrdersMapObject] of openOrdersMapMap) {
        const openOrdersMap = new Map(Object.entries(openOrdersMapObject));
        expect(allowedMarkets).toContain(marketName);
        expect(openOrdersMap).toBeDefined();
        expect(openOrdersMap.size).toBe(0);
    }
}));
it('getOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ordersMapMap = new Map(Object.entries(response.body));
    expect(ordersMapMap).toBeDefined();
    expect(ordersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ordersMapObject] of ordersMapMap) {
        const ordersMap = new Map(Object.entries(ordersMapObject));
        expect(allowedMarkets).toContain(marketName);
        expect(ordersMap).toBeDefined();
        expect(ordersMap.size).toBe(0);
    }
}));
it('createOrders [8, 9]', () => __awaiter(void 0, void 0, void 0, function* () {
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketPlaceOrders')();
    request = Object.assign(Object.assign({}, commonParameters), { orders: candidateOrders.slice(8, 10) });
    response = yield (0, serum_controllers_1.createOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const createdOrders = new Map(Object.entries(response.body));
    expect(createdOrders).toBeDefined();
    expect(createdOrders.size).toBe(request.orders.length);
    for (const [orderId, createdOrder] of createdOrders) {
        const candidateOrder = request.orders.find((order) => order.id === orderId);
        expect(createdOrder).toBeDefined();
        expect(createdOrder.id).toBe(orderId);
        expect(createdOrder.marketName).toBe(candidateOrder.marketName);
        expect(createdOrder.ownerAddress).toBe(candidateOrder.ownerAddress);
        expect(createdOrder.price).toBe(candidateOrder.price);
        expect(createdOrder.amount).toBe(candidateOrder.amount);
        expect(createdOrder.side).toBe(candidateOrder.side);
        expect(createdOrder.status).toBeOneOf([
            serum_types_1.OrderStatus.OPEN,
            serum_types_1.OrderStatus.CREATION_PENDING,
        ]);
        expect(createdOrder.type).toBe(candidateOrder.type);
    }
}));
it('getOpenOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(8, 10));
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrdersMapMap = new Map(Object.entries(response.body));
    expect(openOrdersMapMap).toBeDefined();
    expect(openOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, openOrdersMapObject] of openOrdersMapMap) {
        const openOrdersMap = new Map(Object.entries(openOrdersMapObject));
        expect(openOrdersMap).toBeDefined();
        for (const [id, openOrder] of openOrdersMap) {
            expect(openOrder).toBeDefined();
            expect(openOrder.id).toBe(id);
            expect(openOrder.exchangeId).toBeDefined();
            expect(openOrder.marketName).toBe(marketName);
            expect(targetMarkets).toContain(openOrder.marketName);
            expect(openOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
            expect(openOrder.price).toBeGreaterThan(0);
            expect(openOrder.amount).toBeGreaterThan(0);
            expect(Object.keys(serum_types_1.OrderSide)).toContain(openOrder.side);
            expect(openOrder.status).toBe(serum_types_1.OrderStatus.OPEN);
        }
    }
}));
it('getOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')(candidateOrders.slice(8, 10));
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ordersMapMap = new Map(Object.entries(response.body));
    expect(ordersMapMap).toBeDefined();
    expect(ordersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ordersMapObject] of ordersMapMap) {
        const openOrdersMap = new Map(Object.entries(ordersMapObject));
        expect(openOrdersMap).toBeDefined();
        for (const [id, order] of openOrdersMap) {
            expect(order).toBeDefined();
            expect(order.id).toBe(id);
            expect(order.exchangeId).toBeDefined();
            expect(order.marketName).toBe(marketName);
            expect(targetMarkets).toContain(order.marketName);
            expect(order.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
            expect(order.price).toBeGreaterThan(0);
            expect(order.amount).toBeGreaterThan(0);
            expect(Object.keys(serum_types_1.OrderSide)).toContain(order.side);
            expect(order.status).toBe(serum_types_1.OrderStatus.OPEN);
        }
    }
}));
it('cancelOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.cancelOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const canceledOrdersMap = new Map(Object.entries(response.body));
    expect(canceledOrdersMap).toBeDefined();
    expect(canceledOrdersMap.size).toBe(numberOfAllowedMarkets);
    for (const [id, canceledOrder] of canceledOrdersMap) {
        expect(canceledOrder).toBeDefined();
        expect(canceledOrder.id).toBe(id);
        expect(canceledOrder.exchangeId).toBeDefined();
        expect(targetMarkets).toContain(canceledOrder.marketName);
        expect(canceledOrder.ownerAddress).toBe(config_1.default.solana.wallet.owner.publicKey);
        expect(canceledOrder.price).toBeGreaterThan(0);
        expect(canceledOrder.amount).toBeGreaterThan(0);
        expect(Object.keys(serum_types_1.OrderSide)).toContain(canceledOrder.side);
        expect([serum_types_1.OrderStatus.CANCELED, serum_types_1.OrderStatus.CANCELATION_PENDING]).toContain(canceledOrder.status);
    }
}));
it('getOpenOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOpenOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const openOrdersMapMap = new Map(Object.entries(response.body));
    expect(openOrdersMapMap).toBeDefined();
    expect(openOrdersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, openOrdersMapObject] of openOrdersMapMap) {
        const openOrdersMap = new Map(Object.entries(openOrdersMapObject));
        expect(allowedMarkets).toContain(marketName);
        expect(openOrdersMap).toBeDefined();
        expect(openOrdersMap.size).toBe(0);
    }
}));
it('getOrders (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    patches.get('serum/serumMarketLoadFills')();
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.getOrders)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    const ordersMapMap = new Map(Object.entries(response.body));
    expect(ordersMapMap).toBeDefined();
    expect(ordersMapMap.size).toBe(numberOfAllowedMarkets);
    for (const [marketName, ordersMapObject] of ordersMapMap) {
        const ordersMap = new Map(Object.entries(ordersMapObject));
        expect(allowedMarkets).toContain(marketName);
        expect(ordersMap).toBeDefined();
        expect(ordersMap.size).toBe(0);
    }
}));
it('settleFunds ["SOL/USDT"]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/settleFundsForMarket')();
    patches.get('serum/serumMarketLoadFills')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { marketName: marketName, ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.settleFunds)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    expect(response.body).toBeDefined();
}));
it('settleFunds ["SOL/USDT", "SOL/USDC"]', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/settleFundsForMarket')();
    patches.get('serum/serumMarketLoadFills')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { marketNames: targetMarkets, ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.settleFunds)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    expect(response.body).toBeDefined();
}));
it('settleFunds (all)', () => __awaiter(void 0, void 0, void 0, function* () {
    yield patches.get('serum/market/asksBidsForAllMarkets')();
    patches.get('solana/getKeyPair')();
    patches.get('serum/settleFundsForMarket')();
    patches.get('serum/serumMarketLoadFills')();
    yield patches.get('serum/market/loadOrdersForOwner')([]);
    request = Object.assign(Object.assign({}, commonParameters), { ownerAddress: config_1.default.solana.wallet.owner.publicKey });
    response = yield (0, serum_controllers_1.settleFunds)(solana, serum, request);
    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
    expect(response.body).toBeDefined();
}));
//# sourceMappingURL=serum.controllers.test.js.map