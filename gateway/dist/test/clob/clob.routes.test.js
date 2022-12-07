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
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
require("jest-extended");
const supertest_1 = __importDefault(require("supertest"));
const solana_1 = require("../../src/chains/solana/solana");
const clob_routes_1 = require("../../src/clob/clob.routes");
const serum_2 = require("../../src/connectors/serum/serum");
const serum_helpers_1 = require("../../src/connectors/serum/serum.helpers");
const serum_types_1 = require("../../src/connectors/serum/serum.types");
const config_manager_v2_1 = require("../../src/services/config-manager-v2");
const config_1 = __importDefault(require("../../test/chains/solana/serum/fixtures/config"));
const helpers_1 = require("../chains/solana/serum/fixtures/helpers");
const patch_1 = require("../services/patch");
const patches_1 = __importStar(require("../../test/chains/solana/serum/fixtures/patches/patches"));
(0, patches_1.enablePatches)();
jest.setTimeout(5 * 60 * 1000);
let app;
let solana;
let serum;
let patches;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const configManager = config_manager_v2_1.ConfigManagerV2.getInstance();
    configManager.set('solana.timeout.all', 1);
    configManager.set('solana.retry.all.maxNumberOfRetries', 1);
    configManager.set('solana.retry.all.delayBetweenRetries', 1);
    configManager.set('solana.parallel.all.batchSize', 100);
    configManager.set('solana.parallel.all.delayBetweenBatches', 1);
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/clob', clob_routes_1.ClobRoutes.router);
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
const allowedMarkets = Object.values(config_1.default.solana.markets).map((market) => market.name);
const numberOfAllowedMarkets = allowedMarkets.length;
const targetMarkets = allowedMarkets.slice(0, 2);
const targetMarket = targetMarkets[0];
const candidateOrders = (0, helpers_1.getNewCandidateOrdersTemplates)(10, 0);
const orderPairs = (0, helpers_1.getOrderPairsFromCandidateOrders)(candidateOrders);
describe(`/clob`, () => {
    describe(`GET /clob`, () => {
        it('Get the API status', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .then((response) => {
                expect(response.body.chain).toBe(config_1.default.serum.chain);
                expect(response.body.network).toBe(config_1.default.serum.network);
                expect(response.body.connector).toBe(config_1.default.serum.connector);
                expect(response.body.connection).toBe(true);
                expect(response.body.timestamp).toBeLessThanOrEqual(Date.now());
                expect(response.body.timestamp).toBeGreaterThanOrEqual(Date.now() - 60 * 60 * 1000);
            });
        }));
    });
});
describe(`/clob/markets`, () => {
    describe(`GET /clob/markets`, () => {
        it('Get a specific market by its name', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                name: targetMarket,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .then((response) => {
                const market = response.body;
                expect(market).toBeDefined();
                const found = serum_1.MARKETS.find((market) => market.name === targetMarket && !market.deprecated);
                expect(found).toBeDefined();
                expect(market.name).toBe(found === null || found === void 0 ? void 0 : found.name);
                expect(market.address.toString()).toBe(found === null || found === void 0 ? void 0 : found.address.toString());
                expect(market.programId.toString()).toBe(found === null || found === void 0 ? void 0 : found.programId.toString());
                expect(market.deprecated).toBe(found === null || found === void 0 ? void 0 : found.deprecated);
                expect(market.minimumOrderSize).toBeGreaterThan(0);
                expect(market.tickSize).toBeGreaterThan(0);
                expect(market.minimumBaseIncrement).toBeDefined();
                expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
            });
        }));
        it('Get a map of markets by their names', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                names: targetMarkets,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Get a map with all markets', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Fail when trying to get a market without informing its name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = '';
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                name: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .expect('Content-Type', 'text/html; charset=utf-8')
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No market was informed. If you want to get a market, please inform the parameter "name".`);
                }
            });
        }));
        it('Fail when trying to get a non existing market', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = 'ABC/XYZ';
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                name: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketName}" not found.`);
                }
            });
        }));
        it('Fail when trying to get a map of markets but without informing any of their names', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = [];
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                names: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No markets were informed. If you want to get all markets, please do not inform the parameter "names".`);
                }
            });
        }));
        it('Fail when trying to get a map of markets but including a non existing market name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = ['SOL/USDT', 'ABC/XYZ', 'SRM/SOL'];
            yield (0, supertest_1.default)(app)
                .get(`/clob/markets`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                names: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketNames[1]}" not found.`);
                }
            });
        }));
    });
});
describe(`/clob/orderBooks`, () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(allowedMarkets.flatMap((marketName) => __awaiter(void 0, void 0, void 0, function* () {
            yield patches.get('serum/market/loadAsks')(marketName);
            yield patches.get('serum/market/loadBids')(marketName);
        })));
    }));
    describe(`GET /clob/orderBooks`, () => {
        it('Get a specific order book by its market name', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: targetMarket,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .then((response) => {
                const orderBook = response.body;
                expect(orderBook).toBeDefined();
                expect(orderBook.market).toBeDefined();
                const market = orderBook.market;
                const found = serum_1.MARKETS.find((market) => market.name === targetMarket && !market.deprecated);
                expect(found).toBeDefined();
                expect(market.name).toBe(found === null || found === void 0 ? void 0 : found.name);
                expect(market.address.toString()).toBe(found === null || found === void 0 ? void 0 : found.address.toString());
                expect(market.programId.toString()).toBe(found === null || found === void 0 ? void 0 : found.programId.toString());
                expect(market.deprecated).toBe(found === null || found === void 0 ? void 0 : found.deprecated);
                expect(market.minimumOrderSize).toBeGreaterThan(0);
                expect(market.tickSize).toBeGreaterThan(0);
                expect(market.minimumBaseIncrement).toBeDefined();
                expect(new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(market.minimumBaseIncrement)).gt(new bn_js_1.default(0)));
                expect(Object.entries(orderBook.bids).length).toBeGreaterThan(0);
                expect(Object.entries(orderBook.bids).length).toBeGreaterThan(0);
            });
        }));
        it('Get a map of order books by their market names', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: targetMarkets,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Get a map with all order books', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Fail when trying to get an order book without informing its market name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = '';
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .expect('Content-Type', 'text/html; charset=utf-8')
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No market name was informed. If you want to get an order book, please inform the parameter "marketName".`);
                }
            });
        }));
        it('Fail when trying to get a non existing order book', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = 'ABC/XYZ';
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketName}" not found.`);
                }
            });
        }));
        it('Fail when trying to get a map of order books but without informing any of their market names', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = [];
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No market names were informed. If you want to get all order books, please do not inform the parameter "marketNames".`);
                }
            });
        }));
        it('Fail when trying to get a map of order books but including a non existing market name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = ['SOL/USDT', 'ABC/XYZ', 'SRM/SOL'];
            yield (0, supertest_1.default)(app)
                .get(`/clob/orderBooks`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketNames[1]}" not found.`);
                }
            });
        }));
    });
});
describe(`/clob/tickers`, () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        patches.get('serum/getTicker')();
    }));
    describe(`GET /clob/tickers`, () => {
        it('Get a specific ticker by its market name', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: targetMarket,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .then((response) => {
                const ticker = response.body;
                expect(ticker).toBeDefined();
                const found = serum_1.MARKETS.find((market) => market.name === targetMarket && !market.deprecated);
                expect(found).toBeDefined();
                expect(ticker.price).toBeGreaterThan(0);
                expect(ticker.timestamp).toBeGreaterThan(0);
                expect(new Date(ticker.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
            });
        }));
        it('Get a map of tickers by their market names', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: targetMarkets,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Get a map with all tickers', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .then((response) => {
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
            });
        }));
        it('Fail when trying to get a ticker without informing its market name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = '';
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .expect('Content-Type', 'text/html; charset=utf-8')
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No market name was informed. If you want to get a ticker, please inform the parameter "marketName".`);
                }
            });
        }));
        it('Fail when trying to get a non existing ticker', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketName = 'ABC/XYZ';
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketName: 'ABC/XYZ',
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketName}" not found.`);
                }
            });
        }));
        it('Fail when trying to get a map of tickers but without informing any of their market names', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = [];
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No market names were informed. If you want to get all tickers, please do not inform the parameter "marketNames".`);
                }
            });
        }));
        it('Fail when trying to get a map of tickers but including a non existing market name', () => __awaiter(void 0, void 0, void 0, function* () {
            const marketNames = ['SOL/USDT', 'ABC/XYZ', 'SRM/SOL'];
            yield (0, supertest_1.default)(app)
                .get(`/clob/tickers`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                marketNames: marketNames,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`Market "${marketNames[1]}" not found.`);
                }
            });
        }));
    });
});
describe(`/clob/orders`, () => {
    describe(`GET /clob/orders`, () => {
        it('Fail when trying to get one or more orders without informing any parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get(`/clob/orders`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .then((response) => {
                expect(response.error).not.toBeFalsy();
                if (response.error) {
                    expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`The request is missing the key/property "ownerAddress"`);
                }
            });
        }));
        describe('Single order', () => {
            let target;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                target = orderPairs[0];
            }));
            it('Get a specific order by its id and owner address', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.request]);
                patches.get('serum/serumMarketLoadFills')();
                const orderId = target.response.id;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
            it('Get a specific order by its id, owner address and market name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.request]);
                patches.get('serum/serumMarketLoadFills')();
                const orderId = target.response.id;
                const marketName = target.response.marketName;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        marketName: marketName,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
            it('Get a specific order by its exchange id and owner address', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.response]);
                patches.get('serum/serumMarketLoadFills')();
                const exchangeId = target.response.exchangeId;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        exchangeId: exchangeId,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
            it('Get a specific order by its exchange id, owner address and market name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.response]);
                patches.get('serum/serumMarketLoadFills')();
                const exchangeId = target.response.exchangeId;
                const marketName = target.response.marketName;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        exchangeId: exchangeId,
                        marketName: marketName,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
            it('Fail when trying to get an order without informing its owner address', () => __awaiter(void 0, void 0, void 0, function* () {
                const exchangeId = target.response.exchangeId;
                const marketName = target.response.marketName;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        exchangeId: exchangeId,
                        marketName: marketName,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .then((response) => {
                    expect(response.error).not.toBeFalsy();
                    if (response.error) {
                        expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`The request is missing the key/property "ownerAddress"`);
                    }
                });
            }));
            it('Fail when trying to get an order without informing its id and exchange id', () => __awaiter(void 0, void 0, void 0, function* () {
                const marketName = target.response.marketName;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        marketName: marketName,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .then((response) => {
                    expect(response.error).not.toBeFalsy();
                    if (response.error) {
                        expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No client id or exchange id were informed`);
                    }
                });
            }));
            it('Fail when trying to get a non existing order', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')([]);
                patches.get('serum/serumMarketLoadFills')();
                const orderId = target.response.id;
                const ownerAddress = target.response.ownerAddress;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        ownerAddress: ownerAddress,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .then((response) => {
                    expect(response.error).not.toBeFalsy();
                    if (response.error) {
                        expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`No order found with id / exchange id "${orderId}`);
                    }
                });
            }));
        });
        describe('Multiple orders', () => {
            let targets;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                targets = orderPairs.slice(0, 3);
            }));
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                yield patches.get('serum/market/loadOrdersForOwner')(targets.map((order) => order.response));
                patches.get('serum/serumMarketLoadFills')();
            }));
            it('Get a map of orders by their ids and owner addresses', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    orders: [
                        {
                            ids: targets.map((item) => item.request.id),
                            ownerAddress: targets[0].request.ownerAddress,
                        },
                    ],
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const orders = new Map(Object.entries(response.body));
                    for (const [orderId, order] of orders) {
                        const found = targets.find((item) => item.response.id === orderId);
                        expect(found).not.toBeUndefined();
                        expect(order.id).toEqual(orderId);
                        expect(order.exchangeId).toBeDefined();
                        expect(order.marketName).toEqual(found === null || found === void 0 ? void 0 : found.response.marketName);
                        expect(order.ownerAddress).toEqual(found === null || found === void 0 ? void 0 : found.response.ownerAddress);
                        expect(order.price).toEqual(found === null || found === void 0 ? void 0 : found.response.price);
                        expect(order.amount).toEqual(found === null || found === void 0 ? void 0 : found.response.amount);
                        expect(order.side).toEqual(found === null || found === void 0 ? void 0 : found.response.side);
                        expect(order.status).toEqual(serum_types_1.OrderStatus.OPEN);
                    }
                });
            }));
            it('Get a map of orders by their ids, owner addresses and market names', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    orders: targets.map((item) => ({
                        ids: [item.request.id],
                        ownerAddress: item.request.ownerAddress,
                        marketName: item.request.marketName,
                    })),
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const orders = new Map(Object.entries(response.body));
                    for (const [orderId, order] of orders) {
                        const found = targets.find((item) => item.response.id === orderId);
                        expect(found).not.toBeUndefined();
                        expect(order.id).toEqual(orderId);
                        expect(order.exchangeId).toBeDefined();
                        expect(order.marketName).toEqual(found === null || found === void 0 ? void 0 : found.response.marketName);
                        expect(order.ownerAddress).toEqual(found === null || found === void 0 ? void 0 : found.response.ownerAddress);
                        expect(order.price).toEqual(found === null || found === void 0 ? void 0 : found.response.price);
                        expect(order.amount).toEqual(found === null || found === void 0 ? void 0 : found.response.amount);
                        expect(order.side).toEqual(found === null || found === void 0 ? void 0 : found.response.side);
                        expect(order.status).toEqual(serum_types_1.OrderStatus.OPEN);
                    }
                });
            }));
            it('Get a map of orders by their exchange ids and owner addresses', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    orders: [
                        {
                            exchangeIds: targets.map((item) => item.response.exchangeId),
                            ownerAddress: targets[0].request.ownerAddress,
                        },
                    ],
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const orders = new Map(Object.entries(response.body));
                    for (const [orderId, order] of orders) {
                        const found = targets.find((item) => item.response.id === orderId);
                        expect(found).not.toBeUndefined();
                        expect(order.id).toEqual(orderId);
                        expect(order.exchangeId).toBeDefined();
                        expect(order.marketName).toEqual(found === null || found === void 0 ? void 0 : found.response.marketName);
                        expect(order.ownerAddress).toEqual(found === null || found === void 0 ? void 0 : found.response.ownerAddress);
                        expect(order.price).toEqual(found === null || found === void 0 ? void 0 : found.response.price);
                        expect(order.amount).toEqual(found === null || found === void 0 ? void 0 : found.response.amount);
                        expect(order.side).toEqual(found === null || found === void 0 ? void 0 : found.response.side);
                        expect(order.status).toEqual(serum_types_1.OrderStatus.OPEN);
                    }
                });
            }));
            it('Get a map of orders by their exchange ids, owner addresses and market names', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    orders: targets.map((item) => ({
                        exchangeIds: [item.response.exchangeId],
                        ownerAddress: item.request.ownerAddress,
                        marketName: item.request.marketName,
                    })),
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const orders = new Map(Object.entries(response.body));
                    for (const [orderId, order] of orders) {
                        const found = targets.find((item) => item.response.id === orderId);
                        expect(found).not.toBeUndefined();
                        expect(order.id).toEqual(orderId);
                        expect(order.exchangeId).toBeDefined();
                        expect(order.marketName).toEqual(found === null || found === void 0 ? void 0 : found.response.marketName);
                        expect(order.ownerAddress).toEqual(found === null || found === void 0 ? void 0 : found.response.ownerAddress);
                        expect(order.price).toEqual(found === null || found === void 0 ? void 0 : found.response.price);
                        expect(order.amount).toEqual(found === null || found === void 0 ? void 0 : found.response.amount);
                        expect(order.side).toEqual(found === null || found === void 0 ? void 0 : found.response.side);
                        expect(order.status).toEqual(serum_types_1.OrderStatus.OPEN);
                    }
                });
            }));
            it('Fail when trying to get a map of orders without informing their owner addresses', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    orders: targets.map((item) => ({
                        exchangeIds: [item.response.exchangeId],
                        marketName: item.request.marketName,
                    })),
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .then((response) => {
                    expect(response.error).not.toBeFalsy();
                    if (response.error) {
                        expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`The request is missing the key/property "ownerAddress"`);
                    }
                });
            }));
        });
    });
    describe(`POST /serum/orders`, () => {
        describe('Single order', () => {
            it('Create an order and receive a response with the new information', () => __awaiter(void 0, void 0, void 0, function* () {
                patches.get('solana/getKeyPair')();
                patches.get('serum/serumMarketPlaceOrders')();
                yield patches.get('serum/market/loadOrdersForOwner')([
                    orderPairs[0].response,
                ]);
                const candidateOrder = orderPairs[0].request;
                yield (0, supertest_1.default)(app)
                    .post(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: candidateOrder,
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order.id).toBe(orderPairs[0].response.id);
                    expect(order.marketName).toBe(candidateOrder.marketName);
                    expect(order.ownerAddress).toBe(candidateOrder.ownerAddress);
                    expect(order.price).toBe(candidateOrder.price);
                    expect(order.amount).toBe(candidateOrder.amount);
                    expect(order.side).toBe(candidateOrder.side);
                    expect(order.status).toBe(serum_types_1.OrderStatus.OPEN);
                });
            }));
        });
    });
    describe(`DELETE /clob/orders`, () => {
        describe('Single order', () => {
            let target;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                target = orderPairs[0];
            }));
            it('Cancel a specific order by its id, owner address and market name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.request]);
                const orderId = target.response.id;
                const ownerAddress = target.response.ownerAddress;
                const marketName = target.response.marketName;
                yield (0, supertest_1.default)(app)
                    .delete(`/clob/orders`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        ownerAddress: ownerAddress,
                        marketName: marketName,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
        });
    });
});
describe(`/clob/orders/open`, () => {
    describe(`GET /clob/orders/open`, () => {
        describe('Single order', () => {
            let target;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                target = orderPairs[0];
            }));
            it('Get a specific open order by its id, owner address and market name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.request]);
                const orderId = target.response.id;
                const ownerAddress = target.response.ownerAddress;
                const marketName = target.response.marketName;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders/open`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        ownerAddress: ownerAddress,
                        marketName: marketName,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.OK)
                    .then((response) => {
                    const order = response.body;
                    expect(order).toBeDefined();
                });
            }));
        });
    });
});
describe(`/clob/orders/filled`, () => {
    describe(`GET /clob/orders/filled`, () => {
        describe('Single order', () => {
            let target;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                target = orderPairs[0];
            }));
            it('Get a specific filled order by its id, owner address and market name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield patches.get('serum/market/asksBidsForAllMarkets')();
                patches.get('solana/getKeyPair')();
                patches.get('serum/serumMarketCancelOrdersAndSettleFunds')();
                yield patches.get('serum/market/loadOrdersForOwner')([target.request]);
                patches.get('serum/serumMarketLoadFills')([target.request]);
                const orderId = target.response.id;
                const ownerAddress = target.response.ownerAddress;
                const marketName = target.response.marketName;
                yield (0, supertest_1.default)(app)
                    .get(`/clob/orders/filled`)
                    .send({
                    chain: config_1.default.serum.chain,
                    network: config_1.default.serum.network,
                    connector: config_1.default.serum.connector,
                    order: {
                        id: orderId,
                        ownerAddress: ownerAddress,
                        marketName: marketName,
                    },
                })
                    .set('Accept', 'application/json')
                    .expect(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .then((response) => {
                    expect(response.error).not.toBeFalsy();
                    if (response.error) {
                        expect(response.error.text.replace(/&quot;/gi, '"')).toContain(`found with id / exchange id "${target.request.id}`);
                    }
                });
            }));
        });
    });
});
describe(`/clob/settleFunds`, () => {
    describe(`GET /clob/settleFunds`, () => {
        let target;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            target = orderPairs[0];
        }));
        it('Settle funds for as specific market by its market name and owner address', () => __awaiter(void 0, void 0, void 0, function* () {
            yield patches.get('serum/market/asksBidsForAllMarkets')();
            patches.get('solana/getKeyPair')();
            patches.get('serum/settleFundsForMarket')();
            patches.get('serum/serumMarketLoadFills')();
            yield patches.get('serum/market/loadOrdersForOwner')([]);
            const ownerAddress = target.response.ownerAddress;
            const marketName = target.response.marketName;
            yield (0, supertest_1.default)(app)
                .post(`/clob/settleFunds`)
                .send({
                chain: config_1.default.serum.chain,
                network: config_1.default.serum.network,
                connector: config_1.default.serum.connector,
                ownerAddress: ownerAddress,
                marketName: marketName,
            })
                .set('Accept', 'application/json')
                .expect(http_status_codes_1.StatusCodes.OK)
                .then((response) => {
                const order = response.body;
                expect(order).toBeDefined();
            });
        }));
    });
});
//# sourceMappingURL=clob.routes.test.js.map