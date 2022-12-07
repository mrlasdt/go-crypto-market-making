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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disablePatches = exports.enablePatches = void 0;
const market_1 = require("@project-serum/serum/lib/market");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const serum_helpers_1 = require("../../../../../../src/connectors/serum/serum.helpers");
const serum_types_1 = require("../../../../../../src/connectors/serum/serum.types");
const patch_1 = require("../../../../../services/patch");
const config_1 = __importDefault(require("../config"));
const helpers_1 = require("../helpers");
const data_1 = __importDefault(require("./data"));
let usePatches = true;
const allowedMarkets = Object.values(config_1.default.solana.markets).map((market) => market.name);
const enablePatches = () => (usePatches = true);
exports.enablePatches = enablePatches;
const disablePatches = () => (usePatches = false);
exports.disablePatches = disablePatches;
const patches = (solana, serum) => {
    const patches = new Map();
    patches.set('solana/loadTokens', () => {
        if (!usePatches)
            return;
        (0, patch_1.patch)(solana, 'loadTokens', () => {
            return {};
        });
    });
    patches.set('solana/getKeyPair', () => {
        if (!usePatches)
            return;
        (0, patch_1.patch)(solana, 'getKeypair', (address) => {
            if (address === config_1.default.solana.wallet.owner.publicKey)
                return web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(config_1.default.solana.wallet.owner.privateKey));
            throw new Error(`Cannot mock unrecognized address "${address}".`);
        });
    });
    patches.set('serum/serumGetMarketsInformation', () => {
        if (!usePatches)
            return;
        (0, patch_1.patch)(serum, 'serumGetMarketsInformation', () => {
            return data_1.default.get('serum/serumGetMarketsInformation');
        });
    });
    patches.set('serum/market/load', () => {
        if (!usePatches)
            return;
        (0, patch_1.patch)(serum_types_1.SerumMarket, 'load', (_connection, address, _options = {}, _programId, _layoutOverride) => {
            const d = data_1.default.get(`serum/market/${address.toBase58()}`);
            return d;
        });
    });
    patches.set('serum/market/loadAsks', (marketName) => __awaiter(void 0, void 0, void 0, function* () {
        if (!usePatches)
            return;
        const market = yield serum.getMarket(marketName);
        (0, patch_1.patch)(market.market, 'loadAsks', (_connection) => {
            return data_1.default.get(`serum/market/${market.address}/asks`);
        });
    }));
    patches.set('serum/market/loadBids', (marketName) => __awaiter(void 0, void 0, void 0, function* () {
        if (!usePatches)
            return;
        const market = yield serum.getMarket(marketName);
        (0, patch_1.patch)(market.market, 'loadBids', (_connection) => {
            return data_1.default.get(`serum/market/${market.address}/bids`);
        });
    }));
    patches.set('serum/market/asksBidsForAllMarkets', () => __awaiter(void 0, void 0, void 0, function* () {
        if (!usePatches)
            return;
        for (const marketName of allowedMarkets) {
            yield patches.get('serum/market/loadAsks')(marketName);
            yield patches.get('serum/market/loadBids')(marketName);
        }
    }));
    patches.set('serum/market/loadOrdersForOwner', (candidateOrders) => __awaiter(void 0, void 0, void 0, function* () {
        if (!usePatches)
            return;
        for (const marketName of allowedMarkets) {
            const serumMarket = (yield serum.getMarket(marketName)).market;
            (0, patch_1.patch)(serumMarket, 'loadOrdersForOwner', (_connection, _ownerAddress, _cacheDurationMs = 0) => {
                if (!candidateOrders)
                    return [];
                return (0, helpers_1.getNewSerumOrders)(candidateOrders.filter((item) => item.marketName === marketName));
            });
        }
    }));
    patches.set('serum/market/findOpenOrdersAccountsForOwner', (startIndex, orderBooksMap, candidateOrders) => __awaiter(void 0, void 0, void 0, function* () {
        if (!usePatches)
            return;
        const candidateOrdersMap = (0, serum_types_1.IMap)().asMutable();
        candidateOrders === null || candidateOrders === void 0 ? void 0 : candidateOrders.map((item) => {
            var _a;
            if (!candidateOrdersMap.has(item.marketName))
                candidateOrdersMap.set(item.marketName, []);
            (_a = candidateOrdersMap.get(item.marketName)) === null || _a === void 0 ? void 0 : _a.push(item);
        });
        for (const marketName of allowedMarkets) {
            const orderBook = orderBooksMap.get(marketName);
            const serumMarket = (0, serum_helpers_1.getNotNullOrThrowError)(orderBook).market.market;
            let serumOpenOrders = [];
            const candidateOrders = candidateOrdersMap.get(marketName) || [];
            serumOpenOrders = (0, helpers_1.convertToSerumOpenOrders)(startIndex, (0, serum_helpers_1.getNotNullOrThrowError)(orderBook), candidateOrders);
            (0, patch_1.patch)(serumMarket, 'findOpenOrdersAccountsForOwner', (_connection, _ownerAddress, _cacheDurationMs = 0) => {
                return serumOpenOrders;
            });
        }
    }));
    patches.set('serum/getTicker', () => {
        if (!usePatches)
            return;
        (0, patch_1.patch)(serum, 'getTicker', (marketName) => __awaiter(void 0, void 0, void 0, function* () {
            const market = yield serum.getMarket(marketName);
            const raw = data_1.default.get(`serum/getTicker/${market.address.toString()}`);
            return {
                price: parseFloat(raw.price),
                timestamp: new Date(raw.last_updated).getTime(),
            };
        }));
    });
    patches.set('serum/serumMarketLoadFills', () => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'serumMarketLoadFills', (_market, _connection, _limit) => {
            return [];
        });
    });
    patches.set('serum/serumMarketPlaceOrders', () => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'serumMarketPlaceOrders', (_market, _connection, orders) => {
            const shuffle = (target) => [...target].sort(() => Math.random() - 0.5).join('');
            const example = 'AyZgLRoT78G3KUxPiMTWF84MTQam1eL3bwuWBguufqSBU1JKVcrmGJe6XztLKJ4DfzQ8k1NQsLQnxFT4mB5F9yE0';
            return shuffle(example).repeat(orders.length);
        });
    });
    patches.set('serum/serumMarketCancelOrdersAndSettleFunds', () => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'serumMarketCancelOrdersAndSettleFunds', (_market, _connection, _owner, orders) => {
            const shuffle = (target) => [...target].sort(() => Math.random() - 0.5).join('');
            const example = 'AyZgLRoT78G3KUxPiMTWF84MTQam1eL3bwuWBguufqSBU1JKVcrmGJe6XztLKJ4DfzQ8k1NQsLQnxFT4mB5F9yE0';
            return {
                cancelation: shuffle(example).repeat(orders.length),
                fundsSettlement: shuffle(example).repeat(orders.length),
            };
        });
    });
    patches.set('serum/serumSettleFunds', () => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'serumSettleFunds', () => {
            const shuffle = (target) => [...target].sort(() => Math.random() - 0.5).join('');
            const example = 'AyZgLRoT78G3KUxPiMTWF84MTQam1eL3bwuWBguufqSBU1JKVcrmGJe6XztLKJ4DfzQ8k1NQsLQnxFT4mB5F9yE0';
            return shuffle(example);
        });
    });
    patches.set('serum/serumSettleSeveralFunds', (_market, _connection, settlements, _transaction = new web3_js_1.Transaction()) => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'serumSettleSeveralFunds', () => {
            const shuffle = (target) => [...target].sort(() => Math.random() - 0.5).join('');
            const example = 'AyZgLRoT78G3KUxPiMTWF84MTQam1eL3bwuWBguufqSBU1JKVcrmGJe6XztLKJ4DfzQ8k1NQsLQnxFT4mB5F9yE0';
            return shuffle(example).repeat(settlements.length);
        });
    });
    patches.set('serum/market/OpenOrders/findForMarketAndOwner', (_marketName, _ownerAddress) => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(market_1.OpenOrders, 'findForMarketAndOwner', () => {
            throw new Error('Not implemented');
        });
    });
    patches.set('serum/settleFundsForMarket', (_marketName, _ownerAddress) => {
        if (!usePatches)
            return;
        return (0, patch_1.patch)(serum, 'settleFundsForMarket', () => {
            const shuffle = (target) => [...target].sort(() => Math.random() - 0.5).join('');
            const example = 'AyZgLRoT78G3KUxPiMTWF84MTQam1eL3bwuWBguufqSBU1JKVcrmGJe6XztLKJ4DfzQ8k1NQsLQnxFT4mB5F9yE0';
            return shuffle(example).repeat(1);
        });
    });
    return patches;
};
exports.default = patches;
//# sourceMappingURL=patches.js.map