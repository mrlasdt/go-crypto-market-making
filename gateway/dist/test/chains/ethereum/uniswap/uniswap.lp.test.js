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
Object.defineProperty(exports, "__esModule", { value: true });
jest.useFakeTimers();
const sdk_core_1 = require("@uniswap/sdk-core");
const uniV3 = __importStar(require("@uniswap/v3-sdk"));
const ethers_1 = require("ethers");
const ethereum_1 = require("../../../../src/chains/ethereum/ethereum");
const uniswap_lp_1 = require("../../../../src/connectors/uniswap/uniswap.lp");
const patch_1 = require("../../../services/patch");
const evm_nonce_mock_1 = require("../../../evm.nonce.mock");
let ethereum;
let uniswapLP;
let wallet;
const WETH = new sdk_core_1.Token(42, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH');
const DAI = new sdk_core_1.Token(42, '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa', 18, 'DAI');
const USDC = new sdk_core_1.Token(42, '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5', 18, 'DAI');
const TX = {
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
};
const POOL_SQRT_RATIO_START = uniV3.encodeSqrtRatioX96(100e6, 100e18);
const POOL_TICK_CURRENT = uniV3.TickMath.getTickAtSqrtRatio(POOL_SQRT_RATIO_START);
const DAI_USDC_POOL = new uniV3.Pool(DAI, USDC, 500, POOL_SQRT_RATIO_START, 0, POOL_TICK_CURRENT, []);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    ethereum = ethereum_1.Ethereum.getInstance('kovan');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(ethereum.nonceManager);
    yield ethereum.init();
    wallet = new ethers_1.Wallet('0000000000000000000000000000000000000000000000000000000000000002', ethereum.provider);
    uniswapLP = uniswap_lp_1.UniswapLP.getInstance('ethereum', 'kovan');
    yield uniswapLP.init();
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
const patchPoolState = () => {
    (0, patch_1.patch)(uniswapLP, 'getPoolContract', () => {
        return {
            liquidity() {
                return DAI_USDC_POOL.liquidity;
            },
            slot0() {
                return [
                    DAI_USDC_POOL.sqrtRatioX96,
                    DAI_USDC_POOL.tickCurrent,
                    0,
                    1,
                    1,
                    0,
                    true,
                ];
            },
            ticks() {
                return ['-118445039955967015140', '118445039955967015140'];
            },
        };
    });
};
const patchAlphaRouter = () => {
    (0, patch_1.patch)(uniswapLP.alphaRouter, 'routeToRatio', () => {
        return { status: 3 };
    });
};
const patchContract = () => {
    (0, patch_1.patch)(uniswapLP, 'getContract', () => {
        return {
            estimateGas: {
                multicall() {
                    return ethers_1.BigNumber.from(5);
                },
            },
            positions() {
                return {
                    token0: WETH.address,
                    token1: USDC.address,
                    fee: 500,
                    tickLower: 0,
                    tickUpper: 23030,
                    liquidity: '6025055903594410671025',
                };
            },
            multicall() {
                return TX;
            },
            collect() {
                return TX;
            },
        };
    });
};
const patchWallet = () => {
    (0, patch_1.patch)(wallet, 'sendTransaction', () => {
        return TX;
    });
};
describe('verify UniswapLP Nft functions', () => {
    it('Should return correct contract addresses', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(uniswapLP.router).toEqual('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45');
        expect(uniswapLP.nftManager).toEqual('0xC36442b4a4522E871399CD717aBDD847Ab11FE88');
    }));
    it('Should return correct contract abi', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(Array.isArray(uniswapLP.routerAbi)).toEqual(true);
        expect(Array.isArray(uniswapLP.nftAbi)).toEqual(true);
        expect(Array.isArray(uniswapLP.poolAbi)).toEqual(true);
    }));
    it('addPositionHelper returns calldata and value', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPoolState();
        patchAlphaRouter();
        const callData = yield uniswapLP.addPositionHelper(wallet, DAI, WETH, '10', '10', 500, 1, 10);
        expect(callData).toHaveProperty('calldata');
        expect(callData).toHaveProperty('value');
    }));
    it('reducePositionHelper returns calldata and value', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPoolState();
        patchContract();
        const callData = yield uniswapLP.reducePositionHelper(wallet, 1, 100);
        expect(callData).toHaveProperty('calldata');
        expect(callData).toHaveProperty('value');
    }));
    it('basic functions should work', () => __awaiter(void 0, void 0, void 0, function* () {
        patchContract();
        patchPoolState();
        expect(uniswapLP.ready()).toEqual(true);
        expect(uniswapLP.gasLimitEstimate).toBeGreaterThan(0);
        expect(typeof uniswapLP.getContract('nft', ethereum.provider)).toEqual('object');
        expect(typeof uniswapLP.getPoolContract('0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa', wallet)).toEqual('object');
    }));
    it('generateOverrides returns overrides correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const overrides = uniswapLP.generateOverrides(1, 2, 3, ethers_1.BigNumber.from(4), ethers_1.BigNumber.from(5), '6');
        expect(overrides.gasLimit).toEqual(ethers_1.BigNumber.from('1'));
        expect(overrides.gasPrice).toBeUndefined();
        expect(overrides.nonce).toEqual(ethers_1.BigNumber.from(3));
        expect(overrides.maxFeePerGas).toEqual(ethers_1.BigNumber.from(4));
        expect(overrides.maxPriorityFeePerGas).toEqual(ethers_1.BigNumber.from(5));
        expect(overrides.value).toEqual(ethers_1.BigNumber.from('6'));
    }));
    it('reducePosition should work', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPoolState();
        patchContract();
        const reduceTx = (yield uniswapLP.reducePosition(wallet, 1, 100, 50000, 10));
        expect(reduceTx.hash).toEqual('0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9');
    }));
    it('addPosition should work', () => __awaiter(void 0, void 0, void 0, function* () {
        patchPoolState();
        patchWallet();
        patchAlphaRouter();
        const addTx = yield uniswapLP.addPosition(wallet, DAI, WETH, '10', '10', 500, 1, 10, 0, 1, 1);
        expect(addTx.hash).toEqual('0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9');
    }));
    it('collectFees should work', () => __awaiter(void 0, void 0, void 0, function* () {
        patchContract();
        const collectTx = (yield uniswapLP.collectFees(wallet, 1));
        expect(collectTx.hash).toEqual('0x75f98675a8f64dcf14927ccde9a1d59b67fa09b72cc2642ad055dae4074853d9');
    }));
});
//# sourceMappingURL=uniswap.lp.test.js.map