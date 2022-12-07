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
exports.Perp = void 0;
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const perp_config_1 = require("./perp.config");
const sdk_curie_1 = require("@perp/sdk-curie");
const sdk_1 = require("@uniswap/sdk");
const big_js_1 = require("big.js");
const logger_1 = require("../../services/logger");
const config_manager_v2_1 = require("../../services/config-manager-v2");
const ethereum_1 = require("../../chains/ethereum/ethereum");
class Perp {
    constructor(chain, network, address) {
        this.tokenList = {};
        this._ready = false;
        this.gasLimit = 16000000;
        this._chain = chain;
        this.ethereum = ethereum_1.Ethereum.getInstance(network);
        this.chainId = this.ethereum.chainId;
        this._perp = new sdk_curie_1.PerpetualProtocol({
            chainId: this.chainId,
            providerConfigs: [{ rpcUrl: this.ethereum.rpcUrl }],
        });
        this._address = address ? address : '';
    }
    get perp() {
        return this._perp;
    }
    static getInstance(chain, network, address) {
        if (Perp._instances === undefined) {
            Perp._instances = {};
        }
        if (!(chain + network + address in Perp._instances)) {
            Perp._instances[chain + network + address] = new Perp(chain, network, address);
        }
        return Perp._instances[chain + network + address];
    }
    getTokenByAddress(address) {
        return this.tokenList[address];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._chain == 'ethereum' && !this.ethereum.ready())
                throw new error_handler_1.InitializationError((0, error_handler_1.SERVICE_UNITIALIZED_ERROR_MESSAGE)('ETH'), error_handler_1.SERVICE_UNITIALIZED_ERROR_CODE);
            for (const token of this.ethereum.storedTokenList) {
                this.tokenList[token.address] = new sdk_1.Token(this.chainId, token.address, token.decimals, token.symbol, token.name);
            }
            yield this._perp.init();
            if (this._address !== '') {
                try {
                    this._wallet = yield this.ethereum.getWallet(this._address);
                }
                catch (err) {
                    logger_1.logger.error(`Wallet ${this._address} not available.`);
                    throw new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + err, error_handler_1.LOAD_WALLET_ERROR_CODE);
                }
                yield this._perp.connect({ signer: this._wallet });
                logger_1.logger.info(`${this._wallet.address} wallet connected on perp ${this._chain}.`);
            }
            this._ready = true;
        });
    }
    ready() {
        return this._ready;
    }
    getAllowedSlippage(allowedSlippageStr) {
        let allowedSlippage;
        if (allowedSlippageStr != null && (0, validators_1.isFractionString)(allowedSlippageStr)) {
            allowedSlippage = allowedSlippageStr;
        }
        else
            allowedSlippage = perp_config_1.PerpConfig.config.allowedSlippage;
        const nd = allowedSlippage.match(config_manager_v2_1.percentRegexp);
        if (nd)
            return Number(nd[1]) / Number(nd[2]);
        throw new Error('Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.');
    }
    availablePairs() {
        return Object.keys(this._perp.markets.marketMap);
    }
    prices(tickerSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = this._perp.markets.getMarket({ tickerSymbol });
            return yield market.getPrices({ cache: false });
        });
    }
    isMarketActive(tickerSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = this._perp.markets.getMarket({ tickerSymbol });
            return (yield market.getStatus()) === sdk_curie_1.MarketStatus.ACTIVE ? true : false;
        });
    }
    getPositions(tickerSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const positions = this._perp.positions;
            let positionAmt = '0', positionSide = '', unrealizedProfit = '0', leverage = '1', entryPrice = '0', pendingFundingPayment = '0';
            if (positions && tickerSymbol) {
                const fp = yield positions.getTotalPendingFundingPayments({
                    cache: false,
                });
                for (const [key, value] of Object.entries(fp)) {
                    if (key === tickerSymbol)
                        pendingFundingPayment = value.toString();
                }
                const position = yield positions.getTakerPositionByTickerSymbol(tickerSymbol, { cache: false });
                if (position) {
                    positionSide = sdk_curie_1.PositionSide[position.side];
                    unrealizedProfit = (yield position.getUnrealizedPnl({ cache: false })).toString();
                    leverage = '1';
                    entryPrice = position.entryPrice.toString();
                    positionAmt = position.sizeAbs.toString();
                }
            }
            return {
                positionAmt,
                positionSide,
                unrealizedProfit,
                leverage,
                entryPrice,
                tickerSymbol,
                pendingFundingPayment,
            };
        });
    }
    openPosition(isLong, tickerSymbol, minBaseAmount, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            let slippage;
            if (allowedSlippage)
                slippage = new big_js_1.Big(this.getAllowedSlippage(allowedSlippage).toString());
            else
                slippage = new big_js_1.Big(this.getAllowedSlippage().toString());
            const amountInput = new big_js_1.Big(minBaseAmount);
            const side = isLong ? sdk_curie_1.PositionSide.LONG : sdk_curie_1.PositionSide.SHORT;
            const isAmountInputBase = false;
            const clearingHouse = this._perp.clearingHouse;
            const newPositionDraft = clearingHouse.createPositionDraft({
                tickerSymbol,
                side,
                amountInput,
                isAmountInputBase,
            });
            return (yield clearingHouse.openPosition(newPositionDraft, slippage))
                .transaction;
        });
    }
    closePosition(tickerSymbol, allowedSlippage) {
        return __awaiter(this, void 0, void 0, function* () {
            let slippage;
            if (allowedSlippage)
                slippage = new big_js_1.Big(this.getAllowedSlippage(allowedSlippage).toString());
            else
                slippage = new big_js_1.Big(this.getAllowedSlippage().toString());
            const clearingHouse = this._perp.clearingHouse;
            const positions = this._perp.positions;
            const position = yield positions.getTakerPositionByTickerSymbol(tickerSymbol);
            if (!position) {
                throw new Error(`No active position on ${tickerSymbol}.`);
            }
            return (yield clearingHouse.closePosition(position, slippage))
                .transaction;
        });
    }
    getAccountValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const clearingHouse = this._perp.clearingHouse;
            return yield clearingHouse.getAccountValue();
        });
    }
}
exports.Perp = Perp;
//# sourceMappingURL=perp.js.map