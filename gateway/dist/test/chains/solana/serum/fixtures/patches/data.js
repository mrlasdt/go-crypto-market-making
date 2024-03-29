"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const market_1 = require("@project-serum/serum/lib/market");
const slab_1 = require("@project-serum/serum/lib/slab");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const serum_types_1 = require("../../../../../../src/connectors/serum/serum.types");
const data = new Map();
const slab = slab_1.Slab.decode(Buffer.from('0900000000000000020000000000000008000000000000000400000000000000010000001e00000000000040952fe4da5c1f3c860200000004000000030000000d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d7b0000000000000000000000000000000200000002000000000000a0ca17726dae0f1e43010000001111111111111111111111111111111111111111111111111111111111111111410100000000000000000000000000000200000001000000d20a3f4eeee073c3f60fe98e010000000d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d7b000000000000000000000000000000020000000300000000000040952fe4da5c1f3c8602000000131313131313131313131313131313131313131313131313131313131313131340e20100000000000000000000000000010000001f0000000500000000000000000000000000000005000000060000000d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d7b0000000000000000000000000000000200000004000000040000000000000000000000000000001717171717171717171717171717171717171717171717171717171717171717020000000000000000000000000000000100000020000000000000a0ca17726dae0f1e430100000001000000020000000d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d7b000000000000000000000000000000040000000000000004000000000000000000000000000000171717171717171717171717171717171717171717171717171717171717171702000000000000000000000000000000030000000700000005000000000000000000000000000000171717171717171717171717171717171717171717171717171717171717171702000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex'));
for (const node of slab.nodes) {
    if (node.leafNode)
        node.leafNode.key = new bn_js_1.default('31219269670346045155772');
    if (node.innerNode)
        node.innerNode.key = new bn_js_1.default('31219269670346045155772');
}
data.set('serum/serumGetMarketsInformation', [
    {
        address: 'B37pZmwrwXHjpgvd9hHDAx1yeDsNevTnbbrN9W12BoGK',
        deprecated: true,
        name: 'soALEPH/soUSDC',
        programId: '4ckmDgGdxQoPDLUkDT3vHgSAkzA3QRdNq5ywwY4sUSJn',
    },
    {
        address: 'jyei9Fpj2GtHLDDGgcuhDacxYLLiSyxU4TY7KxB2xai',
        deprecated: false,
        name: 'SRM/SOL',
        programId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    },
    {
        address: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
        deprecated: false,
        name: 'SOL/USDC',
        programId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    },
    {
        address: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
        deprecated: false,
        name: 'SOL/USDT',
        programId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    },
]);
const markets = data.get('serum/serumGetMarketsInformation');
const SOL_USDC = markets.find((val) => val.name === 'SOL/USDC').address;
data.set(`serum/market/${SOL_USDC}`, new serum_types_1.SerumMarket({
    accountFlags: {
        initialized: true,
        market: true,
        openOrders: false,
        requestQueue: false,
        eventQueue: false,
        bids: false,
        asks: false,
    },
    ownAddress: new web3_js_1.PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    vaultSignerNonce: new bn_js_1.default('01', 'hex'),
    baseMint: new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'),
    quoteMint: new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    baseVault: new web3_js_1.PublicKey('36c6YqAwyGKQG66XEp2dJc5JqjaBNv7sVghEtJv4c7u6'),
    baseDepositsTotal: new bn_js_1.default('38ffa8cfb300', 'hex'),
    baseFeesAccrued: new bn_js_1.default('00', 'hex'),
    quoteVault: new web3_js_1.PublicKey('8CFo8bL8mZQK8abbFyypFMwEDd8tVJjHTTojMLgQTUSZ'),
    quoteDepositsTotal: new bn_js_1.default('0394280a510a', 'hex'),
    quoteFeesAccrued: new bn_js_1.default('8eefb0a13a', 'hex'),
    quoteDustThreshold: new bn_js_1.default('64', 'hex'),
    requestQueue: new web3_js_1.PublicKey('AZG3tFCFtiCqEwyardENBQNpHqxgzbMw8uKeZEw2nRG5'),
    eventQueue: new web3_js_1.PublicKey('5KKsLVU6TcbVDK4BS6K1DGDxnh4Q9xjYJ8XaDCG5t8ht'),
    bids: new web3_js_1.PublicKey('14ivtgssEBoBjuZJtSAPKYgpUK7DmnSwuPMqJoVTSgKJ'),
    asks: new web3_js_1.PublicKey('CEQdAFKdycHugujQg9k2wbmxjcpdYZyVLfV9WerTnafJ'),
    baseLotSize: new bn_js_1.default('05f5e100', 'hex'),
    quoteLotSize: new bn_js_1.default('64', 'hex'),
    feeRateBps: new bn_js_1.default('00', 'hex'),
    referrerRebatesAccrued: new bn_js_1.default('1082ee555a', 'hex'),
}, 9, 6, {}, new web3_js_1.PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')));
data.set(`serum/market/${SOL_USDC}/asks`, new market_1.Orderbook(data.get(`serum/market/${SOL_USDC}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: false,
    asks: true,
}, slab));
data.set(`serum/market/${SOL_USDC}/bids`, new market_1.Orderbook(data.get(`serum/market/${SOL_USDC}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: true,
    asks: false,
}, slab));
const SOL_USDT = markets.find((val) => val.name === 'SOL/USDT').address;
data.set(`serum/market/${SOL_USDT}`, new serum_types_1.SerumMarket({
    accountFlags: {
        initialized: true,
        market: true,
        openOrders: false,
        requestQueue: false,
        eventQueue: false,
        bids: false,
        asks: false,
    },
    ownAddress: new web3_js_1.PublicKey('HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1'),
    vaultSignerNonce: new bn_js_1.default('01', 'hex'),
    baseMint: new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'),
    quoteMint: new web3_js_1.PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    baseVault: new web3_js_1.PublicKey('29cTsXahEoEBwbHwVc59jToybFpagbBMV6Lh45pWEmiK'),
    baseDepositsTotal: new bn_js_1.default('68d96a437e00', 'hex'),
    baseFeesAccrued: new bn_js_1.default('00', 'hex'),
    quoteVault: new web3_js_1.PublicKey('EJwyNJJPbHH4pboWQf1NxegoypuY48umbfkhyfPew4E'),
    quoteDepositsTotal: new bn_js_1.default('05809972e503', 'hex'),
    quoteFeesAccrued: new bn_js_1.default('072ec1dc82', 'hex'),
    quoteDustThreshold: new bn_js_1.default('64', 'hex'),
    requestQueue: new web3_js_1.PublicKey('GKrA1P2XVfpfZbpXaFcd2LNp7PfpnXZCbUusuFXQjfE9'),
    eventQueue: new web3_js_1.PublicKey('GR363LDmwe25NZQMGtD2uvsiX66FzYByeQLcNFr596FK'),
    bids: new web3_js_1.PublicKey('2juozaawVqhQHfYZ9HNcs66sPatFHSHeKG5LsTbrS2Dn'),
    asks: new web3_js_1.PublicKey('ANXcuziKhxusxtthGxPxywY7FLRtmmCwFWDmU5eBDLdH'),
    baseLotSize: new bn_js_1.default('05f5e100', 'hex'),
    quoteLotSize: new bn_js_1.default('64', 'hex'),
    feeRateBps: new bn_js_1.default('00', 'hex'),
    referrerRebatesAccrued: new bn_js_1.default('0458e87c90', 'hex'),
}, 9, 6, {}, new web3_js_1.PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')));
data.set(`serum/market/${SOL_USDT}/asks`, new market_1.Orderbook(data.get(`serum/market/${SOL_USDT}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: false,
    asks: true,
}, slab));
data.set(`serum/market/${SOL_USDT}/bids`, new market_1.Orderbook(data.get(`serum/market/${SOL_USDT}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: true,
    asks: false,
}, slab));
const SRM_SOL = markets.find((val) => val.name === 'SRM/SOL').address;
data.set(`serum/market/${SRM_SOL}`, new serum_types_1.SerumMarket({
    accountFlags: {
        initialized: true,
        market: true,
        openOrders: false,
        requestQueue: false,
        eventQueue: false,
        bids: false,
        asks: false,
    },
    ownAddress: new web3_js_1.PublicKey('jyei9Fpj2GtHLDDGgcuhDacxYLLiSyxU4TY7KxB2xai'),
    vaultSignerNonce: new bn_js_1.default('00', 'hex'),
    baseMint: new web3_js_1.PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
    quoteMint: new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'),
    baseVault: new web3_js_1.PublicKey('EhAJTsW745jiWjViB7Q4xXcgKf6tMF7RcMX9cbTuXVBk'),
    baseDepositsTotal: new bn_js_1.default('16f61d5d00', 'hex'),
    baseFeesAccrued: new bn_js_1.default('00', 'hex'),
    quoteVault: new web3_js_1.PublicKey('HFSNnAxfhDt4DnmY9yVs2HNFnEMaDJ7RxMVNB9Y5Hgjr'),
    quoteDepositsTotal: new bn_js_1.default('d772f76602', 'hex'),
    quoteFeesAccrued: new bn_js_1.default('2dcab54b', 'hex'),
    quoteDustThreshold: new bn_js_1.default('64', 'hex'),
    requestQueue: new web3_js_1.PublicKey('Fx15MivJTQokQZKazxGCsbWxRsx3uGrawkTidoBDrHv8'),
    eventQueue: new web3_js_1.PublicKey('nyZdeD16L5GxJq7Pso8R6KFfLA8R9v7c5A2qNaGWR44'),
    bids: new web3_js_1.PublicKey('4ZTJfhgKPizbkFXNvTRNLEncqg85yJ6pyT7NVHBAgvGw'),
    asks: new web3_js_1.PublicKey('7hLgwZhHD1MRNyiF1qfAjfkMzwvP3VxQMLLTJmKSp4Y3'),
    baseLotSize: new bn_js_1.default('0186a0', 'hex'),
    quoteLotSize: new bn_js_1.default('0186a0', 'hex'),
    feeRateBps: new bn_js_1.default('00', 'hex'),
    referrerRebatesAccrued: new bn_js_1.default('0584531e3a', 'hex'),
}, 6, 9, {}, new web3_js_1.PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')));
data.set(`serum/market/${SRM_SOL}/asks`, new market_1.Orderbook(data.get(`serum/market/${SRM_SOL}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: false,
    asks: true,
}, slab));
data.set(`serum/market/${SRM_SOL}/bids`, new market_1.Orderbook(data.get(`serum/market/${SRM_SOL}`), {
    initialized: true,
    market: false,
    openOrders: false,
    requestQueue: false,
    eventQueue: false,
    bids: true,
    asks: false,
}, slab));
data.set(`serum/getTicker/${SOL_USDC}`, {
    exchange: 'serum_dex',
    market: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    type: 'spot',
    price_exclude: false,
    volume_exclude: false,
    aggregated: true,
    base: 'SOL',
    quote: 'USDC',
    base_symbol: 'SOL',
    quote_symbol: 'USDC',
    price: '56.41405623',
    price_quote: '56.12099838',
    volume_usd: '52623210.03',
    last_updated: '2022-05-15T20:52:00Z',
    status: 'active',
    weight: '1.0000',
    first_candle: '2022-01-18T00:00:00Z',
    '1d': {
        volume: '52623210.03',
        volume_base: '1000523.34',
        volume_change: '-18266892.61',
        volume_base_change: '-414813.97',
        price_change: '6.40205519',
        price_quote_change: '6.10899734',
    },
    base_active: true,
    base_name: 'Solana',
    base_type: 1,
    exchange_integrated: false,
    exchange_name: 'Serum DEX',
    exchange_transparency: 'D',
    quote_active: true,
    quote_name: 'USD Coin',
    quote_type: 1,
});
data.set(`serum/getTicker/${SOL_USDT}`, {
    exchange: 'serum_dex',
    market: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
    type: 'spot',
    price_exclude: false,
    volume_exclude: false,
    aggregated: true,
    base: 'SOL',
    quote: 'USDT',
    base_symbol: 'SOL',
    quote_symbol: 'USDT',
    price: '55.72144534',
    price_quote: '55.49200058',
    volume_usd: '2043320.04',
    last_updated: '2022-05-15T20:52:00Z',
    status: 'active',
    weight: '1.0000',
    first_candle: '2022-01-18T00:00:00Z',
    '1d': {
        volume: '2043320.04',
        volume_base: '38734.24',
        volume_change: '-2930214.18',
        volume_base_change: '-59403.45',
        price_change: '5.49244524',
        price_quote_change: '5.26300049',
    },
    base_active: true,
    base_name: 'Solana',
    base_type: 1,
    exchange_integrated: false,
    exchange_name: 'Serum DEX',
    exchange_transparency: 'D',
    quote_active: true,
    quote_name: 'Tether',
    quote_type: 1,
});
data.set(`serum/getTicker/${SRM_SOL}`, {
    exchange: 'serum_dex',
    market: 'jyei9Fpj2GtHLDDGgcuhDacxYLLiSyxU4TY7KxB2xai',
    type: 'spot',
    price_exclude: false,
    volume_exclude: false,
    aggregated: true,
    base: 'SRMSOL',
    quote: 'SOL',
    base_symbol: 'SRM',
    quote_symbol: 'SOL',
    price: '1.36677691',
    price_quote: '0.024000000',
    volume_usd: '223.30',
    last_updated: '2022-05-15T20:52:00Z',
    status: 'active',
    weight: '1.0000',
    first_candle: '2022-01-18T00:00:00Z',
    '1d': {
        volume: '223.30',
        volume_base: '169.97',
        volume_change: '-18012.00',
        volume_base_change: '-14754.54',
        price_change: '1.34077691',
        price_quote_change: '-0.0020000003',
    },
    base_active: true,
    base_name: 'Serum (Solana)',
    base_type: 1,
    exchange_integrated: false,
    exchange_name: 'Serum DEX',
    exchange_transparency: 'D',
    quote_active: true,
    quote_name: 'Solana',
    quote_type: 1,
});
exports.default = data;
//# sourceMappingURL=data.js.map