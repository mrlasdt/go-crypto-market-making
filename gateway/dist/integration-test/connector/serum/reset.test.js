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
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
require("jest-extended");
const solana_1 = require("../../../src/chains/solana/solana");
const serum_1 = require("../../../src/connectors/serum/serum");
const serum_helpers_1 = require("../../../src/connectors/serum/serum.helpers");
const config_1 = __importDefault(require("../../../test/chains/solana/serum/fixtures/config"));
const helpers_1 = require("../../../test/chains/solana/serum/fixtures/helpers");
const patch_1 = require("../../../test/services/patch");
jest.setTimeout(30 * 60 * 1000);
let solana;
let serum;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    solana = yield solana_1.Solana.getInstance(config_1.default.serum.network);
    serum = yield serum_1.Serum.getInstance(config_1.default.serum.chain, config_1.default.serum.network);
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
const allMarketNames = ['SOL/USDT', 'SOL/USDC', 'SRM/SOL'];
const marketNames = allMarketNames.slice(0, 2);
describe('Reset and Recreate Dummy Orders', () => {
    const delayInMilliseconds = 1000;
    it('Cancel all orders and settle all funds', () => __awaiter(void 0, void 0, void 0, function* () {
        let attempts = 1;
        let error = false;
        do {
            try {
                const connection = serum.getConnection();
                const markets = yield (yield serum_1.Serum.getInstance(commonParameters.chain, commonParameters.network)).getMarkets(marketNames);
                const ownerKeyPair = yield solana.getKeypair(config_1.default.solana.wallet.owner.publicKey);
                const owner = new web3_js_1.Account(ownerKeyPair.secretKey);
                for (const market of Array.from(markets.values())) {
                    console.log(`Resetting market ${market.name}:`);
                    const serumMarket = market.market;
                    const openOrders = yield serumMarket.loadOrdersForOwner(connection, owner.publicKey);
                    console.log('Open orders found:', JSON.stringify(openOrders));
                    for (const openOrder of openOrders) {
                        try {
                            const result = yield serumMarket.cancelOrder(connection, owner, openOrder);
                            console.log(`Cancelling order ${openOrder.orderId}:`, JSON.stringify(result));
                        }
                        catch (exception) {
                            if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                                console.log(exception);
                            }
                            else {
                                throw exception;
                            }
                        }
                    }
                    for (const openOrders of yield serumMarket.findOpenOrdersAccountsForOwner(connection, owner.publicKey)) {
                        console.log(`Settling funds for orders:`, JSON.stringify(openOrders));
                        if (openOrders.baseTokenFree.gt(new bn_js_1.default(0)) ||
                            openOrders.quoteTokenFree.gt(new bn_js_1.default(0))) {
                            const base = yield serumMarket.findBaseTokenAccountsForOwner(connection, owner.publicKey, true);
                            const baseTokenAccount = base[0].pubkey;
                            const quote = yield serumMarket.findQuoteTokenAccountsForOwner(connection, owner.publicKey, true);
                            const quoteTokenAccount = quote[0].pubkey;
                            try {
                                const result = yield serumMarket.settleFunds(connection, owner, openOrders, baseTokenAccount, quoteTokenAccount);
                                console.log(`Result of settling funds:`, JSON.stringify(result));
                            }
                            catch (exception) {
                                if (exception.message.includes('It is unknown if it succeeded or failed.')) {
                                    console.log(exception);
                                }
                                else {
                                    throw exception;
                                }
                            }
                        }
                    }
                }
                error = false;
                console.log('Reset done.');
            }
            catch (exception) {
                console.log(`Cancel all orders and settle all funds, attempt ${attempts} with error: `, exception);
                attempts += 1;
                error = true;
                yield (0, serum_helpers_1.sleep)(delayInMilliseconds);
            }
        } while (error);
    }));
    it('Place dummy orders', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const ownerKeyPair = yield solana.getKeypair(config_1.default.solana.wallet.owner.publicKey);
        const owner = new web3_js_1.Account(ownerKeyPair.secretKey);
        const candidateOrders = (0, helpers_1.getNewCandidateOrdersTemplates)(8, 0);
        for (const candidateOrder of candidateOrders) {
            const market = (yield serum.getMarket(candidateOrder.marketName)).market;
            const payer = new web3_js_1.PublicKey((0, serum_helpers_1.getNotNullOrThrowError)(candidateOrder.payerAddress));
            let attempts = 1;
            let error = false;
            do {
                try {
                    yield market.placeOrder(serum.connection, {
                        owner,
                        payer,
                        side: candidateOrder.side.toLowerCase(),
                        price: candidateOrder.price,
                        size: candidateOrder.amount,
                        orderType: (_a = candidateOrder.type) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                        clientId: new bn_js_1.default(candidateOrder.id),
                    });
                    error = false;
                }
                catch (exception) {
                    if (exception.message.includes('It is unknown if it succeeded or failed.'))
                        break;
                    console.log(`Place dummy order ${candidateOrder.id}, attempt ${attempts} with error: `, exception);
                    attempts += 1;
                    error = true;
                    yield (0, serum_helpers_1.sleep)(delayInMilliseconds);
                }
            } while (error);
        }
    }));
    it('List open orders', () => __awaiter(void 0, void 0, void 0, function* () {
        const connection = serum.getConnection();
        const markets = yield (yield serum_1.Serum.getInstance(commonParameters.chain, commonParameters.network)).getMarkets(marketNames);
        const ownerKeyPair = yield solana.getKeypair(config_1.default.solana.wallet.owner.publicKey);
        const owner = new web3_js_1.Account(ownerKeyPair.secretKey);
        for (const market of Array.from(markets.values())) {
            let attempts = 1;
            let error = false;
            do {
                try {
                    const serumMarket = market.market;
                    const openOrders = yield serumMarket.loadOrdersForOwner(connection, owner.publicKey);
                    console.log('Open orders found:', JSON.stringify(openOrders));
                    error = false;
                }
                catch (exception) {
                    console.log(`List open orders for market ${market.name}, attempt ${attempts} with error: `, exception);
                    attempts += 1;
                    error = true;
                    yield (0, serum_helpers_1.sleep)(delayInMilliseconds);
                }
            } while (error);
        }
    }));
});
//# sourceMappingURL=reset.test.js.map