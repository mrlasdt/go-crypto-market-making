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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const ethereum_1 = require("../../../../src/chains/ethereum/ethereum");
const uniswap_lp_1 = require("../../../../src/connectors/uniswap/uniswap.lp");
const amm_routes_1 = require("../../../../src/amm/amm.routes");
const patch_1 = require("../../../services/patch");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let app;
let ethereum;
let uniswap;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    ethereum = ethereum_1.Ethereum.getInstance('kovan');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    yield ethereum.init();
    uniswap = uniswap_lp_1.UniswapLP.getInstance('ethereum', 'kovan');
    yield uniswap.init();
    app.use('/amm/liquidity', amm_routes_1.AmmLiquidityRoutes.router);
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield ethereum.close();
}));
const address = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';
const patchGetWallet = () => {
    (0, patch_1.patch)(ethereum, 'getWallet', () => {
        return {
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        };
    });
};
const patchInit = () => {
    (0, patch_1.patch)(uniswap, 'init', () => __awaiter(void 0, void 0, void 0, function* () {
        return;
    }));
};
const patchStoredTokenList = () => {
    (0, patch_1.patch)(ethereum, 'tokenList', () => {
        return [
            {
                chainId: 42,
                name: 'WETH',
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
            },
            {
                chainId: 42,
                name: 'DAI',
                symbol: 'DAI',
                address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                decimals: 18,
            },
        ];
    });
};
const patchGetTokenBySymbol = () => {
    (0, patch_1.patch)(ethereum, 'getTokenBySymbol', (symbol) => {
        if (symbol === 'WETH') {
            return {
                chainId: 42,
                name: 'WETH',
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                decimals: 18,
            };
        }
        else {
            return {
                chainId: 42,
                name: 'DAI',
                symbol: 'DAI',
                address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                decimals: 18,
            };
        }
    });
};
const patchGetTokenByAddress = () => {
    (0, patch_1.patch)(uniswap, 'getTokenByAddress', () => {
        return {
            chainId: 42,
            name: 'WETH',
            symbol: 'WETH',
            address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
            decimals: 18,
        };
    });
};
const patchGasPrice = () => {
    (0, patch_1.patch)(ethereum, 'gasPrice', () => 100);
};
const patchGetNonce = () => {
    (0, patch_1.patch)(ethereum.nonceManager, 'getNonce', () => 21);
};
const patchAddPosition = () => {
    (0, patch_1.patch)(uniswap, 'addPosition', () => {
        return { nonce: 21, hash: '000000000000000' };
    });
};
const patchRemovePosition = () => {
    (0, patch_1.patch)(uniswap, 'reducePosition', () => {
        return { nonce: 21, hash: '000000000000000' };
    });
};
const patchCollectFees = () => {
    (0, patch_1.patch)(uniswap, 'collectFees', () => {
        return { nonce: 21, hash: '000000000000000' };
    });
};
const patchPosition = () => {
    (0, patch_1.patch)(uniswap, 'getPosition', () => {
        return {
            token0: 'DAI',
            token1: 'WETH',
            fee: 300,
            lowerPrice: '1',
            upperPrice: '5',
            amount0: '1',
            amount1: '1',
            unclaimedToken0: '1',
            unclaimedToken1: '1',
        };
    });
};
describe('POST /liquidity/add', () => {
    it('should return 200 when all parameter are OK', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchAddPosition();
        patchGetNonce();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/add`)
            .send({
            address: address,
            token0: 'DAI',
            token1: 'WETH',
            amount0: '1',
            amount1: '1',
            fee: 'LOW',
            lowerPrice: '1',
            upperPrice: '5',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 500 for unrecognized token0 symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/add`)
            .send({
            address: address,
            token0: 'DOGE',
            token1: 'WETH',
            amount0: '1',
            amount1: '1',
            fee: 'LOW',
            lowerPrice: '1',
            upperPrice: '5',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
    it('should return 404 for invalid fee tier', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/add`)
            .send({
            address: address,
            token0: 'DAI',
            token1: 'WETH',
            amount0: '1',
            amount1: '1',
            fee: 300,
            lowerPrice: '1',
            upperPrice: '5',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
    it('should return 500 when the helper operation fails', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        (0, patch_1.patch)(uniswap, 'addPositionHelper', () => {
            return 'error';
        });
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/add`)
            .send({
            address: address,
            token0: 'DAI',
            token1: 'WETH',
            amount0: '1',
            amount1: '1',
            fee: 'LOW',
            lowerPrice: '1',
            upperPrice: '5',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(500);
    }));
});
describe('POST /liquidity/remove', () => {
    const patchForBuy = () => {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchGasPrice();
        patchRemovePosition();
        patchGetNonce();
    };
    it('should return 200 when all parameter are OK', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/remove`)
            .send({
            address: address,
            tokenId: 2732,
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 404 when the tokenId is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/remove`)
            .send({
            address: address,
            tokenId: 'Invalid',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
});
describe('POST /liquidity/collect_fees', () => {
    const patchForBuy = () => {
        patchGetWallet();
        patchInit();
        patchGasPrice();
        patchCollectFees();
        patchGetNonce();
    };
    it('should return 200 when all parameter are OK', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/collect_fees`)
            .send({
            address: address,
            tokenId: 2732,
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 404 when the tokenId is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/collect_fees`)
            .send({
            address: address,
            tokenId: 'Invalid',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
});
describe('POST /liquidity/position', () => {
    it('should return 200 when all parameter are OK', () => __awaiter(void 0, void 0, void 0, function* () {
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        patchPosition();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/position`)
            .send({
            tokenId: 2732,
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 404 when the tokenId is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/position`)
            .send({
            tokenId: 'Invalid',
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
});
describe('POST /liquidity/price', () => {
    const patchForBuy = () => {
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        (0, patch_1.patch)(uniswap, 'poolPrice', () => {
            return ['100', '105'];
        });
    };
    it('should return 200 when all parameter are OK', () => __awaiter(void 0, void 0, void 0, function* () {
        patchForBuy();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/price`)
            .send({
            token0: 'DAI',
            token1: 'WETH',
            fee: 'LOW',
            period: 120,
            interval: 60,
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(200);
    }));
    it('should return 404 when the fee is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        patchGetWallet();
        patchInit();
        patchStoredTokenList();
        patchGetTokenBySymbol();
        patchGetTokenByAddress();
        yield (0, supertest_1.default)(app)
            .post(`/amm/liquidity/price`)
            .send({
            token0: 'DAI',
            token1: 'WETH',
            fee: 11,
            period: 120,
            interval: 60,
            chain: 'ethereum',
            network: 'kovan',
            connector: 'uniswapLP',
        })
            .set('Accept', 'application/json')
            .expect(404);
    }));
});
//# sourceMappingURL=uniswap.lp.routes.test.js.map