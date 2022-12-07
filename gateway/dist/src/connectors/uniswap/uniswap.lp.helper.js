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
exports.UniswapLPHelper = void 0;
const error_handler_1 = require("../../services/error-handler");
const uniswap_config_1 = require("./uniswap.config");
const contracts_1 = require("@ethersproject/contracts");
const sdk_core_1 = require("@uniswap/sdk-core");
const uniV3 = __importStar(require("@uniswap/v3-sdk"));
const smart_order_router_1 = require("@uniswap/smart-order-router");
const ethers_1 = require("ethers");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const ethereum_1 = require("../../chains/ethereum/ethereum");
const math = __importStar(require("mathjs"));
class UniswapLPHelper {
    constructor(chain, network) {
        this.tokenList = {};
        this._ready = false;
        this.ethereum = ethereum_1.Ethereum.getInstance(network);
        this._chain = chain;
        this.chainId = this.ethereum.chainId;
        this._alphaRouter = new smart_order_router_1.AlphaRouter({
            chainId: this.chainId,
            provider: this.ethereum.provider,
        });
        this._router =
            uniswap_config_1.UniswapConfig.config.uniswapV3SmartOrderRouterAddress(network);
        this._nftManager = uniswap_config_1.UniswapConfig.config.uniswapV3NftManagerAddress(network);
        this._ttl = uniswap_config_1.UniswapConfig.config.ttl;
        this._routerAbi =
            require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json').abi;
        this._nftAbi =
            require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json').abi;
        this._poolAbi =
            require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json').abi;
        this.abiDecoder = require('abi-decoder');
        this.abiDecoder.addABI(this._nftAbi);
        this.abiDecoder.addABI(this._routerAbi);
    }
    ready() {
        return this._ready;
    }
    get alphaRouter() {
        return this._alphaRouter;
    }
    get router() {
        return this._router;
    }
    get nftManager() {
        return this._nftManager;
    }
    get ttl() {
        return parseInt(String(Date.now() / 1000)) + this._ttl;
    }
    get routerAbi() {
        return this._routerAbi;
    }
    get nftAbi() {
        return this._nftAbi;
    }
    get poolAbi() {
        return this._poolAbi;
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._chain == 'ethereum' && !this.ethereum.ready())
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('ETH'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            for (const token of this.ethereum.storedTokenList) {
                this.tokenList[token.address] = new sdk_core_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
            }
            this._ready = true;
        });
    }
    getPercentage(rawPercent) {
        const slippage = math.fraction(rawPercent);
        return new sdk_core_1.Percent(slippage.n, slippage.d * 100);
    }
    getSlippagePercentage() {
        const allowedSlippage = uniswap_config_1.UniswapConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return new sdk_core_1.Percent(nd[1], nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    getContract(contract, signer) {
        if (contract === 'router') {
            return new contracts_1.Contract(this.router, this.routerAbi, signer);
        }
        else {
            return new contracts_1.Contract(this.nftManager, this.nftAbi, signer);
        }
    }
    getPoolContract(pool, wallet) {
        return new contracts_1.Contract(pool, this.poolAbi, wallet);
    }
    getPoolState(poolAddress, fee) {
        return __awaiter(this, void 0, void 0, function* () {
            const poolContract = this.getPoolContract(poolAddress, this.ethereum.provider);
            const minTick = uniV3.nearestUsableTick(uniV3.TickMath.MIN_TICK, uniV3.TICK_SPACINGS[fee]);
            const maxTick = uniV3.nearestUsableTick(uniV3.TickMath.MAX_TICK, uniV3.TICK_SPACINGS[fee]);
            const poolDataReq = yield Promise.allSettled([
                poolContract.liquidity(),
                poolContract.slot0(),
                poolContract.ticks(minTick),
                poolContract.ticks(maxTick),
            ]);
            const rejected = poolDataReq.filter((r) => r.status === 'rejected');
            if (rejected.length > 0)
                throw new Error('Unable to fetch pool state');
            const poolData = poolDataReq.filter((r) => r.status === 'fulfilled').map((r) => r.value);
            return {
                liquidity: poolData[0],
                sqrtPriceX96: poolData[1][0],
                tick: poolData[1][1],
                observationIndex: poolData[1][2],
                observationCardinality: poolData[1][3],
                observationCardinalityNext: poolData[1][4],
                feeProtocol: poolData[1][5],
                unlocked: poolData[1][6],
                fee: fee,
                tickProvider: [
                    {
                        index: minTick,
                        liquidityNet: poolData[2][1],
                        liquidityGross: poolData[2][0],
                    },
                    {
                        index: maxTick,
                        liquidityNet: poolData[3][1],
                        liquidityGross: poolData[3][0],
                    },
                ],
            };
        });
    }
    poolPrice(token0, token1, tier, period = 1, interval = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchPriceTime = [];
            const prices = [];
            const poolContract = new contracts_1.Contract(uniV3.Pool.getAddress(token0, token1, tier), this.poolAbi, this.ethereum.provider);
            for (let x = Math.ceil(period / interval) * interval; x >= 0; x -= interval) {
                fetchPriceTime.push(x);
            }
            try {
                const response = yield poolContract.observe(fetchPriceTime);
                for (let twap = 0; twap < response.tickCumulatives.length - 1; twap++) {
                    prices.push(uniV3
                        .tickToPrice(token0, token1, Math.ceil(response.tickCumulatives[twap + 1].sub(response.tickCumulatives[twap].toNumber()) / interval))
                        .toFixed(8));
                }
            }
            catch (e) {
                return ['0'];
            }
            return prices;
        });
    }
    getRawPosition(wallet, tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = this.getContract('nft', wallet);
            const requests = [contract.positions(tokenId)];
            const positionInfoReq = yield Promise.allSettled(requests);
            const rejected = positionInfoReq.filter((r) => r.status === 'rejected');
            if (rejected.length > 0)
                throw new Error('Unable to fetch position');
            const positionInfo = positionInfoReq.filter((r) => r.status === 'fulfilled').map((r) => r.value);
            return positionInfo[0];
        });
    }
    getReduceLiquidityData(percent, tokenId, token0, token1, wallet) {
        return {
            tokenId: tokenId,
            liquidityPercentage: this.getPercentage(percent),
            slippageTolerance: this.getSlippagePercentage(),
            deadline: this.ttl,
            burnToken: false,
            collectOptions: {
                expectedCurrencyOwed0: sdk_core_1.CurrencyAmount.fromRawAmount(token0, '0'),
                expectedCurrencyOwed1: sdk_core_1.CurrencyAmount.fromRawAmount(token1, '0'),
                recipient: wallet.address,
            },
        };
    }
    addPositionHelper(wallet, token0, token1, amount0, amount1, fee, lowerPrice, upperPrice, tokenId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (token1.sortsBefore(token0)) {
                [token0, token1] = [token1, token0];
                [amount0, amount1] = [amount1, amount0];
                [lowerPrice, upperPrice] = [1 / upperPrice, 1 / lowerPrice];
            }
            const lowerPriceInFraction = math.fraction(lowerPrice);
            const upperPriceInFraction = math.fraction(upperPrice);
            const poolData = yield this.getPoolState(uniV3.Pool.getAddress(token0, token1, fee), fee);
            const pool = new uniV3.Pool(token0, token1, poolData.fee, poolData.sqrtPriceX96.toString(), poolData.liquidity.toString(), poolData.tick);
            const addLiquidityOptions = tokenId === 0 ? { recipient: wallet.address } : { tokenId: tokenId };
            const swapOptions = {
                recipient: wallet.address,
                slippageTolerance: this.getSlippagePercentage(),
                deadline: this.ttl,
            };
            const tickLower = uniV3.nearestUsableTick(uniV3.priceToClosestTick(new sdk_core_1.Price(token0, token1, ethers_1.utils
                .parseUnits(lowerPriceInFraction.d.toString(), token0.decimals)
                .toString(), ethers_1.utils
                .parseUnits(lowerPriceInFraction.n.toString(), token1.decimals)
                .toString())), uniV3.TICK_SPACINGS[fee]);
            const tickUpper = uniV3.nearestUsableTick(uniV3.priceToClosestTick(new sdk_core_1.Price(token0, token1, ethers_1.utils
                .parseUnits(upperPriceInFraction.d.toString(), token0.decimals)
                .toString(), ethers_1.utils
                .parseUnits(upperPriceInFraction.n.toString(), token1.decimals)
                .toString())), uniV3.TICK_SPACINGS[fee]);
            const position = uniV3.Position.fromAmounts({
                pool: pool,
                tickLower: tickLower === tickUpper
                    ? tickLower - uniV3.TICK_SPACINGS[fee]
                    : tickLower,
                tickUpper: tickUpper,
                amount0: ethers_1.utils.parseUnits(amount0, token0.decimals).toString(),
                amount1: ethers_1.utils.parseUnits(amount1, token1.decimals).toString(),
                useFullPrecision: true,
            });
            const autorouterRoute = yield this.alphaRouter.routeToRatio(sdk_core_1.CurrencyAmount.fromRawAmount(token0, ethers_1.utils.parseUnits(amount0, token0.decimals).toString()), sdk_core_1.CurrencyAmount.fromRawAmount(token1, ethers_1.utils.parseUnits(amount1, token1.decimals).toString()), position, {
                ratioErrorTolerance: new sdk_core_1.Fraction(1, 100),
                maxIterations: 6,
            }, {
                swapOptions: swapOptions,
                addLiquidityOptions: addLiquidityOptions,
            });
            let methodParameters;
            let swapReq = false;
            if (autorouterRoute.status === smart_order_router_1.SwapToRatioStatus.SUCCESS) {
                swapReq = true;
                methodParameters = autorouterRoute.result
                    .methodParameters;
            }
            else if (autorouterRoute.status === smart_order_router_1.SwapToRatioStatus.NO_SWAP_NEEDED) {
                methodParameters = uniV3.NonfungiblePositionManager.addCallParameters(position, Object.assign(Object.assign({}, swapOptions), addLiquidityOptions));
            }
            else {
                throw new Error(`Unable to add liquidity - ${smart_order_router_1.SwapToRatioStatus[autorouterRoute.status]}`);
            }
            return Object.assign(Object.assign({}, methodParameters), { swapRequired: swapReq });
        });
    }
    reducePositionHelper(wallet, tokenId, decreasePercent) {
        return __awaiter(this, void 0, void 0, function* () {
            const positionData = yield this.getRawPosition(wallet, tokenId);
            const token0 = this.getTokenByAddress(positionData.token0);
            const token1 = this.getTokenByAddress(positionData.token1);
            const fee = positionData.fee;
            if (!token0 || !token1) {
                throw new Error(`One of the tokens in this position isn't recognized.`);
            }
            const poolAddress = uniV3.Pool.getAddress(token0, token1, fee);
            const poolData = yield this.getPoolState(poolAddress, fee);
            const position = new uniV3.Position({
                pool: new uniV3.Pool(token0, token1, poolData.fee, poolData.sqrtPriceX96.toString(), poolData.liquidity.toString(), poolData.tick),
                tickLower: positionData.tickLower,
                tickUpper: positionData.tickUpper,
                liquidity: positionData.liquidity,
            });
            return uniV3.NonfungiblePositionManager.removeCallParameters(position, this.getReduceLiquidityData(decreasePercent, tokenId, token0, token1, wallet));
        });
    }
}
exports.UniswapLPHelper = UniswapLPHelper;
//# sourceMappingURL=uniswap.lp.helper.js.map