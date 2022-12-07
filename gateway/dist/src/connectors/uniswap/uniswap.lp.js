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
exports.UniswapLP = void 0;
const logger_1 = require("../../services/logger");
const uniswap_config_1 = require("./uniswap.config");
const uniV3 = __importStar(require("@uniswap/v3-sdk"));
const ethers_1 = require("ethers");
const uniswap_lp_helper_1 = require("./uniswap.lp.helper");
const MaxUint128 = ethers_1.BigNumber.from(2).pow(128).sub(1);
class UniswapLP extends uniswap_lp_helper_1.UniswapLPHelper {
    constructor(chain, network) {
        super(chain, network);
        this._gasLimitEstimate = uniswap_config_1.UniswapConfig.config.gasLimitEstimate;
    }
    static getInstance(chain, network) {
        if (UniswapLP._instances === undefined) {
            UniswapLP._instances = {};
        }
        if (!(chain + network in UniswapLP._instances)) {
            UniswapLP._instances[chain + network] = new UniswapLP(chain, network);
        }
        return UniswapLP._instances[chain + network];
    }
    get gasLimitEstimate() {
        return this._gasLimitEstimate;
    }
    getPosition(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = this.getContract('nft', this.ethereum.provider);
            const requests = [
                contract.positions(tokenId),
                this.collectFees(this.ethereum.provider, tokenId),
            ];
            const positionInfoReq = yield Promise.allSettled(requests);
            const rejected = positionInfoReq.filter((r) => r.status === 'rejected');
            if (rejected.length > 0)
                throw new Error(`Unable to fetch position with id ${tokenId}`);
            const positionInfo = positionInfoReq.filter((r) => r.status === 'fulfilled').map((r) => r.value);
            const position = positionInfo[0];
            const feeInfo = positionInfo[1];
            const token0 = this.getTokenByAddress(position.token0);
            const token1 = this.getTokenByAddress(position.token1);
            if (!token0 || !token1) {
                throw new Error(`One of the tokens in this position isn't recognized.`);
            }
            const fee = position.fee;
            const poolAddress = uniV3.Pool.getAddress(token0, token1, fee);
            const poolData = yield this.getPoolState(poolAddress, fee);
            const positionInst = new uniV3.Position({
                pool: new uniV3.Pool(token0, token1, poolData.fee, poolData.sqrtPriceX96.toString(), poolData.liquidity.toString(), poolData.tick),
                tickLower: position.tickLower,
                tickUpper: position.tickUpper,
                liquidity: position.liquidity,
            });
            return {
                token0: token0.symbol,
                token1: token1.symbol,
                fee: uniV3.FeeAmount[position.fee],
                lowerPrice: positionInst.token0PriceLower.toFixed(8),
                upperPrice: positionInst.token0PriceUpper.toFixed(8),
                amount0: positionInst.amount0.toFixed(),
                amount1: positionInst.amount1.toFixed(),
                unclaimedToken0: ethers_1.utils.formatUnits(feeInfo.amount0.toString(), token0.decimals),
                unclaimedToken1: ethers_1.utils.formatUnits(feeInfo.amount1.toString(), token1.decimals),
            };
        });
    }
    addPosition(wallet, token0, token1, amount0, amount1, fee, lowerPrice, upperPrice, tokenId = 0, gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const addLiquidityResponse = yield this.addPositionHelper(wallet, token0, token1, amount0, amount1, fee, lowerPrice, upperPrice, tokenId);
            if (nonce === undefined) {
                nonce = yield this.ethereum.nonceManager.getNextNonce(wallet.address);
            }
            const tx = yield wallet.sendTransaction(Object.assign({ data: addLiquidityResponse.calldata, to: addLiquidityResponse.swapRequired ? this.router : this.nftManager }, this.generateOverrides(gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas, addLiquidityResponse.value)));
            logger_1.logger.info(`Uniswap V3 Add position Tx Hash: ${tx.hash}`);
            return tx;
        });
    }
    reducePosition(wallet, tokenId, decreasePercent = 100, gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = this.getContract('nft', wallet);
            const { calldata, value } = yield this.reducePositionHelper(wallet, tokenId, decreasePercent);
            if (nonce === undefined) {
                nonce = yield this.ethereum.nonceManager.getNextNonce(wallet.address);
            }
            const tx = yield contract.multicall([calldata], this.generateOverrides(gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas, value));
            logger_1.logger.info(`Uniswap V3 Remove position Tx Hash: ${tx.hash}`);
            return tx;
        });
    }
    collectFees(wallet, tokenId, gasLimit = this.gasLimitEstimate, gasPrice = 0, nonce, maxFeePerGas, maxPriorityFeePerGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = this.getContract('nft', wallet);
            const collectData = {
                tokenId: tokenId,
                recipient: ethers_1.constants.AddressZero,
                amount0Max: MaxUint128,
                amount1Max: MaxUint128,
            };
            if (wallet instanceof ethers_1.providers.StaticJsonRpcProvider) {
                return yield contract.callStatic.collect(collectData);
            }
            else {
                collectData.recipient = wallet.address;
                if (nonce === undefined) {
                    nonce = yield this.ethereum.nonceManager.getNextNonce(wallet.address);
                }
                return yield contract.collect(collectData, this.generateOverrides(gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas));
            }
        });
    }
    generateOverrides(gasLimit, gasPrice, nonce, maxFeePerGas, maxPriorityFeePerGas, value) {
        const overrides = {
            gasLimit: ethers_1.BigNumber.from(String(gasLimit.toFixed(0))),
        };
        if (maxFeePerGas && maxPriorityFeePerGas) {
            overrides.maxFeePerGas = maxFeePerGas;
            overrides.maxPriorityFeePerGas = maxPriorityFeePerGas;
        }
        else {
            overrides.gasPrice = ethers_1.BigNumber.from(String((gasPrice * 1e9).toFixed(0)));
        }
        if (nonce)
            overrides.nonce = ethers_1.BigNumber.from(String(nonce));
        if (value)
            overrides.value = ethers_1.BigNumber.from(value);
        return overrides;
    }
}
exports.UniswapLP = UniswapLP;
//# sourceMappingURL=uniswap.lp.js.map