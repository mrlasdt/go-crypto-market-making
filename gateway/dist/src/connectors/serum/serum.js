"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.Serum = void 0;
const serum_1 = require("@project-serum/serum");
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const bn_js_1 = __importDefault(require("bn.js"));
const node_ts_cache_1 = require("node-ts-cache");
const node_ts_cache_storage_memory_1 = require("node-ts-cache-storage-memory");
const solana_1 = require("../../chains/solana/solana");
const solana_config_1 = require("../../chains/solana/solana.config");
const serum_config_1 = require("./serum.config");
const serum_constants_1 = __importDefault(require("./serum.constants"));
const serum_convertors_1 = require("./serum.convertors");
const serum_helpers_1 = require("./serum.helpers");
const serum_types_1 = require("./serum.types");
const caches = {
    instances: new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage()),
    markets: new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage()),
    serumFindQuoteTokenAccountsForOwner: new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage()),
    serumFindBaseTokenAccountsForOwner: new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage()),
};
class Serum {
    constructor(chain, network) {
        this.initializing = false;
        this._ready = false;
        this.connector = 'serum';
        this.chain = chain;
        this.network = network;
        this.config = serum_config_1.SerumConfig.config;
        this.solanaConfig = (0, solana_config_1.getSolanaConfig)(chain, network);
        this.connection = new web3_js_1.Connection(this.solanaConfig.network.nodeUrl);
    }
    serumGetMarketsInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            const marketsURL = this.config.markets.url ||
                'https://raw.githubusercontent.com/project-serum/serum-ts/master/packages/serum/src/markets.json';
            let marketsInformation;
            try {
                marketsInformation = (yield (0, serum_helpers_1.runWithRetryAndTimeout)(axios_1.default, axios_1.default.get, [marketsURL])).data;
            }
            catch (e) {
                marketsInformation = serum_1.MARKETS;
            }
            return marketsInformation;
        });
    }
    serumLoadMarket(connection, address, options, programId, layoutOverride) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(serum_types_1.SerumMarket, serum_types_1.SerumMarket.load, [
                connection,
                address,
                options,
                programId,
                layoutOverride,
            ]);
        });
    }
    serumMarketLoadBids(market, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.loadBids, [connection]);
        });
    }
    serumMarketLoadAsks(market, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.loadAsks, [connection]);
        });
    }
    serumMarketLoadFills(market, connection, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.loadFills, [connection, limit]);
        });
    }
    serumMarketLoadOrdersForOwner(market, connection, ownerAddress, cacheDurationMs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.loadOrdersForOwner, [connection, ownerAddress, cacheDurationMs]);
        });
    }
    serumMarketPlaceOrders(market, connection, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.placeOrders, [connection, orders]);
        });
    }
    serumMarketCancelOrdersAndSettleFunds(market, connection, owner, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancellationSignature = yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.cancelOrders, [connection, owner, orders]);
            const fundsSettlements = [];
            for (const openOrders of yield this.serumFindOpenOrdersAccountsForOwner(market, connection, owner.publicKey)) {
                if (openOrders.baseTokenFree.gt(new bn_js_1.default(0)) ||
                    openOrders.quoteTokenFree.gt(new bn_js_1.default(0))) {
                    const base = yield this.serumFindBaseTokenAccountsForOwner(market, this.connection, owner.publicKey, true);
                    const baseWallet = base[0].pubkey;
                    const quote = yield this.serumFindQuoteTokenAccountsForOwner(market, this.connection, owner.publicKey, true);
                    const quoteWallet = quote[0].pubkey;
                    fundsSettlements.push({
                        owner,
                        openOrders,
                        baseWallet,
                        quoteWallet,
                        referrerQuoteWallet: null,
                    });
                }
            }
            try {
                const fundsSettlementSignature = (yield this.serumSettleSeveralFunds(market, connection, fundsSettlements, new web3_js_1.Transaction()))[0];
                return {
                    cancellation: cancellationSignature,
                    fundsSettlement: fundsSettlementSignature,
                };
            }
            catch (exception) {
                if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                    throw new serum_types_1.FundsSettlementError(`Unknown state when settling the funds for the market: ${exception.message}`);
                }
                else {
                    throw exception;
                }
            }
        });
    }
    serumFindOpenOrdersAccountsForOwner(market, connection, ownerAddress, cacheDurationMs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.findOpenOrdersAccountsForOwner, [connection, ownerAddress, cacheDurationMs]);
        });
    }
    serumFindBaseTokenAccountsForOwner(market, connection, ownerAddress, includeUnwrappedSol) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.findBaseTokenAccountsForOwner, [
                connection,
                ownerAddress,
                includeUnwrappedSol,
            ]);
        });
    }
    serumFindQuoteTokenAccountsForOwner(market, connection, ownerAddress, includeUnwrappedSol) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.findQuoteTokenAccountsForOwner, [
                connection,
                ownerAddress,
                includeUnwrappedSol,
            ]);
        });
    }
    serumSettleFunds(market, connection, owner, openOrders, baseWallet, quoteWallet, referrerQuoteWallet) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.settleFunds, [
                connection,
                owner,
                openOrders,
                baseWallet,
                quoteWallet,
                referrerQuoteWallet,
            ]);
        });
    }
    serumSettleSeveralFunds(market, connection, settlements, transaction = new web3_js_1.Transaction()) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(market, market.settleSeveralFunds, [connection, settlements, transaction]);
        });
    }
    getSolanaAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.solana, this.solana.getAccount, [address]);
        });
    }
    static getInstance(chain, network) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Serum(chain, network);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._ready && !this.initializing) {
                this.initializing = true;
                this.solana = yield solana_1.Solana.getInstance(this.network);
                yield this.solana.init();
                yield this.getAllMarkets();
                this._ready = true;
                this.initializing = false;
            }
        });
    }
    ready() {
        return this._ready;
    }
    getConnection() {
        return this.connection;
    }
    getMarket(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name)
                throw new serum_types_1.MarketNotFoundError(`No market informed.`);
            const markets = yield this.getAllMarkets();
            const market = markets.get(name);
            if (!market)
                throw new serum_types_1.MarketNotFoundError(`Market "${name}" not found.`);
            return market;
        });
    }
    getMarkets(names) {
        return __awaiter(this, void 0, void 0, function* () {
            const markets = (0, serum_types_1.IMap)().asMutable();
            const getMarket = (name) => __awaiter(this, void 0, void 0, function* () {
                const market = yield this.getMarket(name);
                markets.set(name, market);
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getMarket, names);
            return markets;
        });
    }
    getAllMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            const allMarkets = (0, serum_types_1.IMap)().asMutable();
            let marketsInformation = yield this.serumGetMarketsInformation();
            marketsInformation = marketsInformation.filter((item) => {
                var _a, _b;
                return !item.deprecated &&
                    (((_a = this.config.markets.blacklist) === null || _a === void 0 ? void 0 : _a.length)
                        ? !this.config.markets.blacklist.includes(item.name)
                        : true) &&
                    (((_b = this.config.markets.whiteList) === null || _b === void 0 ? void 0 : _b.length)
                        ? this.config.markets.whiteList.includes(item.name)
                        : true);
            });
            const loadMarket = (market) => __awaiter(this, void 0, void 0, function* () {
                const serumMarket = yield this.serumLoadMarket(this.connection, new web3_js_1.PublicKey(market.address), {}, new web3_js_1.PublicKey(market.programId));
                allMarkets.set(market.name, (0, serum_convertors_1.convertSerumMarketToMarket)(serumMarket, market));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(loadMarket, marketsInformation);
            return allMarkets;
        });
    }
    getOrderBook(marketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(marketName);
            const asks = yield this.serumMarketLoadAsks(market.market, this.connection);
            const bids = yield this.serumMarketLoadBids(market.market, this.connection);
            return (0, serum_convertors_1.convertMarketBidsAndAsksToOrderBook)(market, asks, bids);
        });
    }
    getOrderBooks(marketNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderBooks = (0, serum_types_1.IMap)().asMutable();
            const getOrderBook = (marketName) => __awaiter(this, void 0, void 0, function* () {
                const orderBook = yield this.getOrderBook(marketName);
                orderBooks.set(marketName, orderBook);
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOrderBook, marketNames);
            return orderBooks;
        });
    }
    getAllOrderBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return this.getOrderBooks(marketNames);
        });
    }
    getTicker(marketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(marketName);
            try {
                if (this.config.tickers.source === serum_types_1.TickerSource.NOMIMCS) {
                    const url = (this.config.tickers.url ||
                        'https://nomics.com/data/exchange-markets-ticker?convert=USD&exchange=serum_dex&interval=1d&market=${marketAddress}').replace('${marketAddress}', market.address.toString());
                    const result = (yield axios_1.default.get(url)).data.items[0];
                    return (0, serum_convertors_1.convertToTicker)(result);
                }
            }
            catch (exception) {
                throw new serum_types_1.TickerNotFoundError(`Ticker data is currently not available for market "${marketName}".`);
            }
            throw new serum_types_1.TickerNotFoundError(`Ticker source (${this.config.tickers.source}) not supported, check your serum configuration file.`);
        });
    }
    getTickers(marketNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const tickers = (0, serum_types_1.IMap)().asMutable();
            const getTicker = (marketName) => __awaiter(this, void 0, void 0, function* () {
                const ticker = yield this.getTicker(marketName);
                tickers.set(marketName, ticker);
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getTicker, marketNames);
            return tickers;
        });
    }
    getAllTickers() {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return yield this.getTickers(marketNames);
        });
    }
    getOpenOrder(target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!target.id && !target.exchangeId)
                throw new serum_types_1.OrderNotFoundError('No client id or exchange id provided.');
            if (!target.ownerAddress)
                throw new serum_types_1.OrderNotFoundError(`No owner address provided for order "${target.id} / ${target.exchangeId}".`);
            if (target.marketName) {
                const openOrder = (yield this.getOpenOrdersForMarket(target.marketName, target.ownerAddress)).find((order) => order.id === target.id || order.exchangeId === target.exchangeId);
                if (!openOrder)
                    throw new serum_types_1.OrderNotFoundError(`No open order found with id / exchange id "${target.id} / ${target.exchangeId}".`);
                openOrder.status = serum_types_1.OrderStatus.OPEN;
                return openOrder;
            }
            const mapOfOpenOrdersForMarkets = yield this.getAllOpenOrders(target.ownerAddress);
            for (const mapOfOpenOrdersForMarket of mapOfOpenOrdersForMarkets.values()) {
                for (const openOrder of mapOfOpenOrdersForMarket.values()) {
                    if (openOrder.id === target.id ||
                        openOrder.exchangeId === target.exchangeId) {
                        openOrder.status = serum_types_1.OrderStatus.OPEN;
                        return openOrder;
                    }
                }
            }
            throw new serum_types_1.OrderNotFoundError(`No open order found with id / exchange id "${target.id} / ${target.exchangeId}".`);
        });
    }
    getOpenOrders(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = (0, serum_types_1.IMap)().asMutable();
            const temporary = (0, serum_types_1.IMap)().asMutable();
            const getOrders = (target) => __awaiter(this, void 0, void 0, function* () {
                if (target.marketName) {
                    temporary.concat(yield this.getOpenOrdersForMarket(target.marketName, target.ownerAddress));
                }
                else {
                    (yield this.getAllOpenOrders(target.ownerAddress)).reduce((acc, mapOfOrders) => {
                        return acc.concat(mapOfOrders);
                    }, temporary);
                }
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOrders, targets);
            for (const target of targets) {
                orders.concat(temporary.filter((order) => {
                    var _a, _b, _c, _d;
                    return (order.ownerAddress === target.ownerAddress &&
                        (target.marketName
                            ? order.marketName === target.marketName
                            : true) &&
                        (((_a = target.ids) === null || _a === void 0 ? void 0 : _a.length) || ((_b = target.exchangeIds) === null || _b === void 0 ? void 0 : _b.length)
                            ? ((_c = target.ids) === null || _c === void 0 ? void 0 : _c.includes(order.id)) ||
                                ((_d = target.exchangeIds) === null || _d === void 0 ? void 0 : _d.includes(order.exchangeId))
                            : true));
                }));
            }
            return orders;
        });
    }
    getOpenOrdersForMarket(marketName, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(marketName);
            const owner = yield this.getSolanaAccount(ownerAddress);
            const serumOpenOrders = yield this.serumMarketLoadOrdersForOwner(market.market, this.connection, owner.publicKey);
            return (0, serum_convertors_1.convertArrayOfSerumOrdersToMapOfOrders)(market, serumOpenOrders, ownerAddress, serum_types_1.OrderStatus.OPEN);
        });
    }
    getOpenOrdersForMarkets(marketNames, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, serum_types_1.IMap)().asMutable();
            const markets = yield this.getMarkets(marketNames);
            const getOpenOrders = (market) => __awaiter(this, void 0, void 0, function* () {
                result.set(market.name, yield this.getOpenOrdersForMarket(market.name, ownerAddress));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOpenOrders, Array.from(markets.values()));
            return result;
        });
    }
    getAllOpenOrders(ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return yield this.getOpenOrdersForMarkets(marketNames, ownerAddress);
        });
    }
    getFilledOrder(target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!target.id && !target.exchangeId)
                throw new serum_types_1.OrderNotFoundError('No client id or exchange id provided.');
            if (!target.ownerAddress)
                throw new serum_types_1.OrderNotFoundError(`No owner address provided for order "${target.id} / ${target.exchangeId}".`);
            if (target.marketName) {
                const filledOrder = (yield this.getFilledOrdersForMarket(target.marketName)).find((order) => order.id === target.id || order.exchangeId === target.exchangeId);
                if (!filledOrder)
                    throw new serum_types_1.OrderNotFoundError(`No open order found with id / exchange id "${target.id} / ${target.exchangeId}".`);
                filledOrder.status = serum_types_1.OrderStatus.FILLED;
                return filledOrder;
            }
            const mapOfFilledOrdersForMarkets = yield this.getAllFilledOrders();
            for (const mapOfFilledOrdersForMarket of mapOfFilledOrdersForMarkets.values()) {
                for (const filledOrder of mapOfFilledOrdersForMarket.values()) {
                    if (filledOrder.id === target.id ||
                        filledOrder.exchangeId === target.exchangeId) {
                        filledOrder.status = serum_types_1.OrderStatus.FILLED;
                        return filledOrder;
                    }
                }
            }
            throw new serum_types_1.OrderNotFoundError(`No filled order found with id / exchange id "${target.id} / ${target.exchangeId}".`);
        });
    }
    getFilledOrders(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = (0, serum_types_1.IMap)().asMutable();
            const temporary = (0, serum_types_1.IMap)().asMutable();
            const getOrders = (target) => __awaiter(this, void 0, void 0, function* () {
                if (target.marketName) {
                    temporary.concat(yield this.getFilledOrdersForMarket(target.marketName));
                }
                else {
                    (yield this.getAllFilledOrders()).reduce((acc, mapOfOrders) => {
                        return acc.concat(mapOfOrders);
                    }, temporary);
                }
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOrders, targets);
            for (const target of targets) {
                orders.concat(temporary.filter((order) => {
                    var _a, _b, _c, _d;
                    return (order.ownerAddress === target.ownerAddress &&
                        (target.marketName
                            ? order.marketName === target.marketName
                            : true) &&
                        (((_a = target.ids) === null || _a === void 0 ? void 0 : _a.length) || ((_b = target.exchangeIds) === null || _b === void 0 ? void 0 : _b.length)
                            ? ((_c = target.ids) === null || _c === void 0 ? void 0 : _c.includes(order.id)) ||
                                ((_d = target.exchangeIds) === null || _d === void 0 ? void 0 : _d.includes(order.exchangeId))
                            : true));
                }));
            }
            if (!orders.size)
                throw new serum_types_1.OrderNotFoundError('No filled orders found.');
            return orders;
        });
    }
    getFilledOrdersForMarket(marketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(marketName);
            const orders = yield this.serumMarketLoadFills(market.market, this.connection, 0);
            return (0, serum_convertors_1.convertArrayOfSerumOrdersToMapOfOrders)(market, orders, undefined, serum_types_1.OrderStatus.FILLED);
        });
    }
    getFilledOrdersForMarkets(marketNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, serum_types_1.IMap)().asMutable();
            const markets = yield this.getMarkets(marketNames);
            const getFilledOrders = (market) => __awaiter(this, void 0, void 0, function* () {
                result.set(market.name, yield this.getFilledOrdersForMarket(market.name));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getFilledOrders, Array.from(markets.values()));
            return result;
        });
    }
    getAllFilledOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return yield this.getFilledOrdersForMarkets(marketNames);
        });
    }
    getOrder(target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!target.id && !target.exchangeId)
                throw new serum_types_1.OrderNotFoundError('No client id or exchange id provided.');
            try {
                return yield this.getOpenOrder(target);
            }
            catch (exception) {
                if (exception instanceof serum_types_1.OrderNotFoundError) {
                    try {
                        return yield this.getFilledOrder(target);
                    }
                    catch (exception2) {
                        if (exception2 instanceof serum_types_1.OrderNotFoundError) {
                            throw new serum_types_1.OrderNotFoundError(`No order found with id / exchange id "${target.id} / ${target.exchangeId}".`);
                        }
                    }
                }
                throw exception;
            }
        });
    }
    getOrders(targets) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = (0, serum_types_1.IMap)().asMutable();
            const temporary = (0, serum_types_1.IMap)().asMutable();
            const getOrders = (target) => __awaiter(this, void 0, void 0, function* () {
                if (target.marketName) {
                    const openOrders = yield this.getOpenOrdersForMarket(target.marketName, target.ownerAddress);
                    const filledOrders = yield this.getFilledOrdersForMarket(target.marketName);
                    temporary.concat(openOrders).concat(filledOrders);
                }
                else {
                    (yield this.getAllOpenOrders(target.ownerAddress)).reduce((acc, mapOfOrders) => {
                        return acc.concat(mapOfOrders);
                    }, temporary);
                    (yield this.getAllFilledOrders()).reduce((acc, mapOfOrders) => {
                        return acc.concat(mapOfOrders);
                    }, temporary);
                }
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOrders, targets);
            for (const target of targets) {
                orders.concat(temporary.filter((order) => {
                    var _a, _b, _c, _d;
                    return (order.ownerAddress === target.ownerAddress &&
                        (target.marketName
                            ? order.marketName === target.marketName
                            : true) &&
                        (((_a = target.ids) === null || _a === void 0 ? void 0 : _a.length) || ((_b = target.exchangeIds) === null || _b === void 0 ? void 0 : _b.length)
                            ? ((_c = target.ids) === null || _c === void 0 ? void 0 : _c.includes(order.id)) ||
                                ((_d = target.exchangeIds) === null || _d === void 0 ? void 0 : _d.includes(order.exchangeId))
                            : true));
                }));
            }
            return orders;
        });
    }
    getOrdersForMarket(marketName, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.getOpenOrdersForMarket(marketName, ownerAddress);
            orders.concat(yield this.getFilledOrdersForMarket(marketName));
            return orders;
        });
    }
    getOrdersForMarkets(marketNames, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (0, serum_types_1.IMap)().asMutable();
            const markets = yield this.getMarkets(marketNames);
            const getOrders = (market) => __awaiter(this, void 0, void 0, function* () {
                result.set(market.name, yield this.getOrdersForMarket(market.name, ownerAddress));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(getOrders, Array.from(markets.values()));
            return result;
        });
    }
    getAllOrders(ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return yield this.getOrdersForMarkets(marketNames, ownerAddress);
        });
    }
    createOrder(candidate) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.createOrders([candidate])).first();
        });
    }
    createOrders(candidates) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ordersMap = (0, serum_types_1.IMap)().asMutable();
            for (const candidate of candidates) {
                const market = yield this.getMarket(candidate.marketName);
                let marketMap = ordersMap.get(market);
                if (!marketMap) {
                    marketMap = (0, serum_types_1.IMap)().asMutable();
                    ordersMap.set(market, (0, serum_helpers_1.getNotNullOrThrowError)(marketMap));
                }
                const owner = yield this.getSolanaAccount(candidate.ownerAddress);
                let ownerOrders = marketMap === null || marketMap === void 0 ? void 0 : marketMap.get(owner);
                if (!ownerOrders) {
                    ownerOrders = [];
                    marketMap === null || marketMap === void 0 ? void 0 : marketMap.set(owner, ownerOrders);
                }
                let payer;
                if (candidate.payerAddress) {
                    payer = new web3_js_1.PublicKey(candidate.payerAddress);
                }
                else {
                    if (candidate.side == serum_types_1.OrderSide.SELL) {
                        payer = new web3_js_1.PublicKey((0, serum_helpers_1.getNotNullOrThrowError)(candidate.payerAddress));
                    }
                    else if (candidate.side == serum_types_1.OrderSide.BUY) {
                        const quoteToken = candidate.marketName.split('/')[1];
                        const keypair = yield this.solana.getKeypair(candidate.ownerAddress);
                        const tokenInfo = (0, serum_helpers_1.getNotNullOrThrowError)(this.solana.getTokenForSymbol(quoteToken));
                        const mintAddress = new web3_js_1.PublicKey(tokenInfo.address);
                        const account = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.solana, this.solana.getOrCreateAssociatedTokenAccount, [keypair, mintAddress]);
                        payer = (0, serum_helpers_1.getNotNullOrThrowError)(account).address;
                    }
                    else {
                        throw new Error(`Invalid order side: ${candidate.side}`);
                    }
                }
                const candidateSerumOrder = {
                    side: (0, serum_convertors_1.convertOrderSideToSerumSide)(candidate.side),
                    price: candidate.price,
                    size: candidate.amount,
                    orderType: (0, serum_convertors_1.convertOrderTypeToSerumType)(candidate.type),
                    clientId: candidate.id ? new bn_js_1.default(candidate.id) : (0, serum_helpers_1.getRandonBN)(),
                    owner: owner,
                    payer: payer,
                };
                ownerOrders.push({ request: candidate, serum: candidateSerumOrder });
            }
            const createdOrders = (0, serum_types_1.IMap)().asMutable();
            for (const [market, marketMap] of ordersMap.entries()) {
                for (const [owner, orders] of marketMap.entries()) {
                    let status;
                    let signatures;
                    try {
                        signatures = yield this.serumMarketPlaceOrders(market.market, this.connection, orders.map((order) => order.serum));
                        status = serum_types_1.OrderStatus.OPEN;
                    }
                    catch (exception) {
                        if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                            signatures = [];
                            status = serum_types_1.OrderStatus.CREATION_PENDING;
                        }
                        else {
                            throw exception;
                        }
                    }
                    for (const order of orders) {
                        createdOrders.set((0, serum_helpers_1.getNotNullOrThrowError)((_a = order.serum.clientId) === null || _a === void 0 ? void 0 : _a.toString(), 'Client id is not defined.'), (0, serum_convertors_1.convertSerumOrderToOrder)(market, undefined, order.request, order.serum, owner.publicKey.toString(), status, signatures[0]));
                    }
                }
            }
            return createdOrders;
        });
    }
    cancelOrder(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(target.marketName);
            const owner = yield this.getSolanaAccount(target.ownerAddress);
            const order = yield this.getOpenOrder(Object.assign({}, target));
            try {
                order.signature = (yield this.serumMarketCancelOrdersAndSettleFunds(market.market, this.connection, owner, [(0, serum_helpers_1.getNotNullOrThrowError)(order.order)])).cancellation;
                order.status = serum_types_1.OrderStatus.CANCELED;
                return order;
            }
            catch (exception) {
                if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                    order.status = serum_types_1.OrderStatus.CANCELATION_PENDING;
                    return order;
                }
                else {
                    throw exception;
                }
            }
        });
    }
    cancelOrders(targets) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const ordersMap = (0, serum_types_1.IMap)().asMutable();
            for (const target of targets) {
                const market = yield this.getMarket(target.marketName);
                const openOrders = yield this.getOpenOrders([Object.assign({}, target)]);
                let marketMap = ordersMap.get(market);
                if (!marketMap) {
                    marketMap = (0, serum_types_1.IMap)().asMutable();
                    ordersMap.set(market, (0, serum_helpers_1.getNotNullOrThrowError)(marketMap));
                }
                const owner = yield this.getSolanaAccount(target.ownerAddress);
                let ownerOrders = marketMap === null || marketMap === void 0 ? void 0 : marketMap.get(owner);
                if (!ownerOrders) {
                    ownerOrders = [];
                    marketMap === null || marketMap === void 0 ? void 0 : marketMap.set(owner, ownerOrders);
                }
                ownerOrders.push(...openOrders.values());
            }
            const canceledOrders = (0, serum_types_1.IMap)().asMutable();
            for (const [market, marketMap] of ordersMap.entries()) {
                for (const [owner, orders] of marketMap.entries()) {
                    const serumOrders = orders.map((order) => (0, serum_helpers_1.getNotNullOrThrowError)(order.order));
                    if (!serumOrders.length)
                        continue;
                    let status;
                    let signature;
                    try {
                        signature = (yield this.serumMarketCancelOrdersAndSettleFunds(market.market, this.connection, owner, serumOrders)).cancellation;
                        status = serum_types_1.OrderStatus.CANCELED;
                    }
                    catch (exception) {
                        if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                            signature = '';
                            status = serum_types_1.OrderStatus.CANCELATION_PENDING;
                        }
                        else {
                            throw exception;
                        }
                    }
                    if (orders.length) {
                        for (const order of orders) {
                            order.status = status;
                            order.signature = signature;
                            canceledOrders.set((0, serum_helpers_1.getNotNullOrThrowError)((_b = (_a = order.order) === null || _a === void 0 ? void 0 : _a.clientId) === null || _b === void 0 ? void 0 : _b.toString(), 'Client id is not defined.'), order);
                        }
                    }
                }
            }
            return canceledOrders;
        });
    }
    cancelAllOrders(ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            const requests = marketNames.map((marketName) => ({
                marketName,
                ownerAddress,
            }));
            return this.cancelOrders(requests);
        });
    }
    settleFundsForMarket(marketName, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarket(marketName);
            const owner = yield this.getSolanaAccount(ownerAddress);
            const signatures = [];
            for (const openOrders of yield this.serumFindOpenOrdersAccountsForOwner(market.market, this.connection, owner.publicKey)) {
                if (openOrders.baseTokenFree.gt(new bn_js_1.default(0)) ||
                    openOrders.quoteTokenFree.gt(new bn_js_1.default(0))) {
                    const base = yield this.serumFindBaseTokenAccountsForOwner(market.market, this.connection, owner.publicKey, true);
                    const baseWallet = base[0].pubkey;
                    const quote = yield this.serumFindQuoteTokenAccountsForOwner(market.market, this.connection, owner.publicKey, true);
                    const quoteWallet = quote[0].pubkey;
                    try {
                        signatures.push(yield this.serumSettleFunds(market.market, this.connection, owner, openOrders, baseWallet, quoteWallet, null));
                    }
                    catch (exception) {
                        if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                            throw new serum_types_1.FundsSettlementError(`Unknown state when settling the funds for the market "${marketName}": ${exception.message}`);
                        }
                        else {
                            throw exception;
                        }
                    }
                }
            }
            return signatures;
        });
    }
    settleFundsForMarkets(marketNames, ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const funds = (0, serum_types_1.IMap)().asMutable();
            const settleFunds = (marketName) => __awaiter(this, void 0, void 0, function* () {
                const signatures = yield this.settleFundsForMarket(marketName, ownerAddress);
                funds.set(marketName, signatures);
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(settleFunds, marketNames);
            return funds;
        });
    }
    settleAllFunds(ownerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketNames = Array.from((yield this.getAllMarkets()).keys());
            return this.settleFundsForMarkets(marketNames, ownerAddress);
        });
    }
}
__decorate([
    (0, node_ts_cache_1.Cache)(caches.serumFindBaseTokenAccountsForOwner, { isCachedForever: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [serum_types_1.SerumMarket,
        web3_js_1.Connection,
        web3_js_1.PublicKey, Boolean]),
    __metadata("design:returntype", Promise)
], Serum.prototype, "serumFindBaseTokenAccountsForOwner", null);
__decorate([
    (0, node_ts_cache_1.Cache)(caches.serumFindQuoteTokenAccountsForOwner, { isCachedForever: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [serum_types_1.SerumMarket,
        web3_js_1.Connection,
        web3_js_1.PublicKey, Boolean]),
    __metadata("design:returntype", Promise)
], Serum.prototype, "serumFindQuoteTokenAccountsForOwner", null);
__decorate([
    (0, node_ts_cache_1.Cache)(caches.markets, { ttl: serum_constants_1.default.cache.markets }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Serum.prototype, "getAllMarkets", null);
__decorate([
    (0, node_ts_cache_1.Cache)(caches.instances, { isCachedForever: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], Serum, "getInstance", null);
exports.Serum = Serum;
//# sourceMappingURL=serum.js.map