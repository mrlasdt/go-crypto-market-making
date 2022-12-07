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
jest.useFakeTimers();
const perp_1 = require("../../../../src/connectors/perp/perp");
const sdk_curie_1 = require("@perp/sdk-curie");
const patch_1 = require("../../../services/patch");
const big_js_1 = require("big.js");
const ethereum_1 = require("../../../../src/chains/ethereum/ethereum");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let ethereum;
let perp;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    ethereum = ethereum_1.Ethereum.getInstance('optimism');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    yield ethereum.init();
    perp = perp_1.Perp.getInstance('ethereum', 'optimism');
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
const patchMarket = () => {
    (0, patch_1.patch)(perp.perp, 'markets', () => {
        return {
            getMarket() {
                return {
                    getPrices() {
                        return {
                            markPrice: new big_js_1.Big('1'),
                            indexPrice: new big_js_1.Big('2'),
                            indexTwapPrice: new big_js_1.Big('3'),
                        };
                    },
                    getStatus() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return sdk_curie_1.MarketStatus.ACTIVE;
                        });
                    },
                };
            },
            get marketMap() {
                return {
                    AAVEUSD: 1,
                    WETHUSD: 2,
                    WBTCUSD: 3,
                };
            },
        };
    });
};
const patchPosition = () => {
    (0, patch_1.patch)(perp.perp, 'positions', () => {
        return {
            getTakerPositionByTickerSymbol() {
                return;
            },
            getTotalPendingFundingPayments() {
                return {};
            },
        };
    });
};
const patchCH = () => {
    (0, patch_1.patch)(perp.perp, 'clearingHouse', () => {
        return {
            createPositionDraft() {
                return;
            },
            openPosition() {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        transaction: {
                            type: 2,
                            chainId: 42,
                            nonce: 115,
                            maxPriorityFeePerGas: { toString: () => '106000000000' },
                            maxFeePerGas: { toString: () => '106000000000' },
                            gasPrice: { toString: () => null },
                            gasLimit: { toString: () => '100000' },
                            to: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
                            value: { toString: () => '0' },
                            data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                            accessList: [],
                            hash: '0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9',
                            v: 0,
                            r: '0xbeb9aa40028d79b9fdab108fcef5de635457a05f3a254410414c095b02c64643',
                            s: '0x5a1506fa4b7f8b4f3826d8648f27ebaa9c0ee4bd67f569414b8cd8884c073100',
                            from: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
                            confirmations: 0,
                        },
                    };
                });
            },
            getAccountValue() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new big_js_1.Big('10');
                });
            },
        };
    });
};
describe('verify market functions', () => {
    it('available pairs should return a list of pairs', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        const pairs = perp.availablePairs();
        expect(pairs).toEqual(['AAVEUSD', 'WETHUSD', 'WBTCUSD']);
    }));
    it('tickerSymbol should return prices', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        const prices = yield perp.prices('AAVEUSD');
        expect(prices.markPrice.toString()).toEqual('1');
        expect(prices.indexPrice.toString()).toEqual('2');
        expect(prices.indexTwapPrice.toString()).toEqual('3');
    }));
    it('market state should return boolean', () => __awaiter(void 0, void 0, void 0, function* () {
        patchMarket();
        const state = yield perp.isMarketActive('AAVEUSD');
        expect(state).toEqual(true);
    }));
});
describe('verify perp position', () => {
    it('getPositions should return data', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPosition();
        const pos = yield perp.getPositions('AAVEUSD');
        expect(pos).toHaveProperty('positionAmt');
        expect(pos).toHaveProperty('positionSide');
        expect(pos).toHaveProperty('unrealizedProfit');
        expect(pos).toHaveProperty('leverage');
        expect(pos).toHaveProperty('entryPrice');
        expect(pos).toHaveProperty('tickerSymbol');
        expect(pos).toHaveProperty('pendingFundingPayment');
    }));
});
describe('verify perp open/close position', () => {
    it('openPosition should return', () => __awaiter(void 0, void 0, void 0, function* () {
        patchCH();
        const pos = yield perp.openPosition(true, 'AAVEUSD', '0.01', '1/10');
        expect(pos.hash).toEqual('0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9');
    }));
    it('getAccountValue should return', () => __awaiter(void 0, void 0, void 0, function* () {
        patchCH();
        const bal = yield perp.getAccountValue();
        expect(bal.toString()).toEqual('10');
    }));
    it('closePosition should throw', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPosition();
        patchCH();
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield perp.closePosition('AAVEUSD', '1/10');
        })).rejects.toThrow(new Error(`No active position on AAVEUSD.`));
    }));
});
describe('getAllowedSlippage', () => {
    it('return value of string when not null', () => {
        const allowedSlippage = perp.getAllowedSlippage('1/100');
        expect(allowedSlippage).toEqual(0.01);
    });
    it('return value from config when string is null', () => {
        const allowedSlippage = perp.getAllowedSlippage();
        expect(allowedSlippage).toEqual(0.02);
    });
    it('return value from config when string is malformed', () => {
        const allowedSlippage = perp.getAllowedSlippage('yo');
        expect(allowedSlippage).toEqual(0.02);
    });
});
//# sourceMappingURL=perp.test.js.map