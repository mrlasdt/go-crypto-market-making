"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePoolPriceRequest = exports.validatePositionRequest = exports.validateCollectFeeRequest = exports.validateRemoveLiquidityRequest = exports.validateAddLiquidityRequest = exports.validateEstimateGasRequest = exports.validatePerpCloseTradeRequest = exports.validatePerpOpenTradeRequest = exports.validatePerpPairsRequest = exports.validatePerpMarketStatusRequest = exports.validatePerpBalanceRequest = exports.validatePerpPositionRequest = exports.validateTradeRequest = exports.validatePriceRequest = exports.validateAllowedSlippage = exports.validateDecreasePercent = exports.validateInterval = exports.validatePeriod = exports.validateTokenId = exports.validateLimitPrice = exports.validateUpperPrice = exports.validateLowerPrice = exports.validateFee = exports.validatePerpSide = exports.validateSide = exports.validateAmount1 = exports.validateAmount0 = exports.validateAmount = exports.validateToken1 = exports.validateToken0 = exports.validateBase = exports.validateQuote = exports.validateConnector = exports.invalidAllowedSlippageError = exports.invalidDecreasePercentError = exports.invalidTimeError = exports.invalidTokenIdError = exports.invalidLPPriceError = exports.invalidLimitPriceError = exports.invalidFeeTier = exports.invalidPerpSideError = exports.invalidSideError = exports.invalidAmountError = exports.invalidTokenError = exports.invalidBaseError = exports.invalidQuoteError = exports.invalidConnectorError = void 0;
const validators_1 = require("../services/validators");
const ethereum_validators_1 = require("../chains/ethereum/ethereum.validators");
const v3_sdk_1 = require("@uniswap/v3-sdk");
exports.invalidConnectorError = 'The connector param is not a string.';
exports.invalidQuoteError = 'The quote param is not a string.';
exports.invalidBaseError = 'The base param is not a string.';
exports.invalidTokenError = 'One of the token params is not a string.';
exports.invalidAmountError = 'The amount param must be a string of a non-negative integer.';
exports.invalidSideError = 'The side param must be a string of "BUY" or "SELL".';
exports.invalidPerpSideError = 'The side param must be a string of "LONG" or "SHORT".';
exports.invalidFeeTier = 'Incorrect fee tier';
exports.invalidLimitPriceError = 'The limitPrice param may be null or a string of a float or integer number.';
exports.invalidLPPriceError = 'One of the LP prices may be null or a string of a float or integer number.';
exports.invalidTokenIdError = 'If tokenId is included it must be a non-negative integer.';
exports.invalidTimeError = 'Period or interval has to be a non-negative integer.';
exports.invalidDecreasePercentError = 'If decreasePercent is included it must be a non-negative integer.';
exports.invalidAllowedSlippageError = 'The allowedSlippage param may be null or a string of a fraction.';
exports.validateConnector = (0, validators_1.mkValidator)('connector', exports.invalidConnectorError, (val) => typeof val === 'string');
exports.validateQuote = (0, validators_1.mkValidator)('quote', exports.invalidQuoteError, (val) => typeof val === 'string');
exports.validateBase = (0, validators_1.mkValidator)('base', exports.invalidBaseError, (val) => typeof val === 'string');
exports.validateToken0 = (0, validators_1.mkValidator)('token0', exports.invalidTokenError, (val) => typeof val === 'string');
exports.validateToken1 = (0, validators_1.mkValidator)('token1', exports.invalidTokenError, (val) => typeof val === 'string');
exports.validateAmount = (0, validators_1.mkValidator)('amount', exports.invalidAmountError, (val) => typeof val === 'string' && (0, validators_1.isFloatString)(val));
exports.validateAmount0 = (0, validators_1.mkValidator)('amount0', exports.invalidAmountError, (val) => typeof val === 'string');
exports.validateAmount1 = (0, validators_1.mkValidator)('amount1', exports.invalidAmountError, (val) => typeof val === 'string');
exports.validateSide = (0, validators_1.mkValidator)('side', exports.invalidSideError, (val) => typeof val === 'string' && (val === 'BUY' || val === 'SELL'));
exports.validatePerpSide = (0, validators_1.mkValidator)('side', exports.invalidPerpSideError, (val) => typeof val === 'string' && (val === 'LONG' || val === 'SHORT'));
exports.validateFee = (0, validators_1.mkValidator)('fee', exports.invalidFeeTier, (val) => typeof val === 'string' &&
    Object.keys(v3_sdk_1.FeeAmount).includes(val.toUpperCase()));
exports.validateLowerPrice = (0, validators_1.mkValidator)('lowerPrice', exports.invalidLPPriceError, (val) => typeof val === 'string' && (0, validators_1.isFloatString)(val), true);
exports.validateUpperPrice = (0, validators_1.mkValidator)('upperPrice', exports.invalidLPPriceError, (val) => typeof val === 'string' && (0, validators_1.isFloatString)(val), true);
exports.validateLimitPrice = (0, validators_1.mkValidator)('limitPrice', exports.invalidLimitPriceError, (val) => typeof val === 'string' && (0, validators_1.isFloatString)(val), true);
exports.validateTokenId = (0, validators_1.mkValidator)('tokenId', exports.invalidTokenIdError, (val) => typeof val === 'undefined' ||
    (typeof val === 'number' && val >= 0 && Number.isInteger(val)), true);
exports.validatePeriod = (0, validators_1.mkValidator)('period', exports.invalidTimeError, (val) => typeof val === 'number' && val >= 0 && Number.isInteger(val), true);
exports.validateInterval = (0, validators_1.mkValidator)('interval', exports.invalidTimeError, (val) => typeof val === 'number' && val >= 0 && Number.isInteger(val), true);
exports.validateDecreasePercent = (0, validators_1.mkValidator)('decreasePercent', exports.invalidDecreasePercentError, (val) => typeof val === 'undefined' ||
    (typeof val === 'number' && val >= 0 && Number.isFinite(val)), true);
exports.validateAllowedSlippage = (0, validators_1.mkValidator)('allowedSlippage', exports.invalidAllowedSlippageError, (val) => typeof val === 'string' && (0, validators_1.isFractionString)(val), true);
exports.validatePriceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
    exports.validateAmount,
    exports.validateSide,
    exports.validateAllowedSlippage,
]);
exports.validateTradeRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
    exports.validateAmount,
    exports.validateSide,
    exports.validateLimitPrice,
    ethereum_validators_1.validateNonce,
    ethereum_validators_1.validateMaxFeePerGas,
    ethereum_validators_1.validateMaxPriorityFeePerGas,
    exports.validateAllowedSlippage,
]);
exports.validatePerpPositionRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
    ethereum_validators_1.validateAddress,
]);
exports.validatePerpBalanceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    ethereum_validators_1.validateAddress,
]);
exports.validatePerpMarketStatusRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
]);
exports.validatePerpPairsRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
]);
exports.validatePerpOpenTradeRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
    exports.validateAmount,
    ethereum_validators_1.validateAddress,
    exports.validatePerpSide,
    ethereum_validators_1.validateNonce,
    exports.validateAllowedSlippage,
]);
exports.validatePerpCloseTradeRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateQuote,
    exports.validateBase,
    ethereum_validators_1.validateAddress,
    ethereum_validators_1.validateNonce,
    exports.validateAllowedSlippage,
]);
exports.validateEstimateGasRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
]);
exports.validateAddLiquidityRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateToken0,
    exports.validateToken1,
    exports.validateAmount0,
    exports.validateAmount1,
    ethereum_validators_1.validateAddress,
    exports.validateFee,
    exports.validateUpperPrice,
    exports.validateLowerPrice,
    exports.validateTokenId,
    ethereum_validators_1.validateNonce,
    ethereum_validators_1.validateMaxFeePerGas,
    ethereum_validators_1.validateMaxPriorityFeePerGas,
]);
exports.validateRemoveLiquidityRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    ethereum_validators_1.validateAddress,
    exports.validateTokenId,
    exports.validateDecreasePercent,
    ethereum_validators_1.validateNonce,
    ethereum_validators_1.validateMaxFeePerGas,
    ethereum_validators_1.validateMaxPriorityFeePerGas,
]);
exports.validateCollectFeeRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    ethereum_validators_1.validateAddress,
    exports.validateTokenId,
    ethereum_validators_1.validateNonce,
    ethereum_validators_1.validateMaxFeePerGas,
    ethereum_validators_1.validateMaxPriorityFeePerGas,
]);
exports.validatePositionRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateTokenId,
]);
exports.validatePoolPriceRequest = (0, validators_1.mkRequestValidator)([
    exports.validateConnector,
    ethereum_validators_1.validateChain,
    ethereum_validators_1.validateNetwork,
    exports.validateToken0,
    exports.validateToken1,
    exports.validateFee,
    exports.validateInterval,
    exports.validatePeriod,
]);
//# sourceMappingURL=amm.validators.js.map