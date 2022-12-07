"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSettleAllFundsRequest = exports.validateSettleFundsSeveralRequest = exports.validateSettleFundsRequest = exports.validateGetFilledOrdersRequest = exports.validateGetFilledOrderRequest = exports.validateGetOpenOrdersRequest = exports.validateGetOpenOrderRequest = exports.validateCancelAllOrdersRequest = exports.validateCancelOrdersRequest = exports.validateCancelOrderRequest = exports.validateCreateOrdersRequest = exports.validateCreateOrderRequest = exports.validateGetAllOrdersRequest = exports.validateGetOrdersRequest = exports.validateGetOrderRequest = exports.validateGetTickersRequest = exports.validateGetTickerRequest = exports.validateGetOrderBooksRequest = exports.validateGetOrderBookRequest = exports.validateGetMarketsRequest = exports.validateGetMarketRequest = exports.validateOrderType = exports.validateOrderAmount = exports.validateOrderPrice = exports.validateOrderSide = exports.validateOrderOwnerAddress = exports.validateOrderMarketNames = exports.validateOrderMarketName = exports.validateOrderExchangeIds = exports.validateOrderExchangeId = exports.validateOrderClientIds = exports.validateOrderClientId = exports.throwIfErrorsExist = exports.createBatchValidator = exports.createRequestValidator = void 0;
const http_status_codes_1 = require("http-status-codes");
const error_handler_1 = require("../../services/error-handler");
const validators_1 = require("../../services/validators");
const serum_types_1 = require("./serum.types");
const createValidator = (accessor, validation, error, optional = false) => {
    return (item, index) => {
        const warnings = [];
        const errors = [];
        let target;
        if (item === undefined && accessor) {
            errors.push(`Request with undefined value informed when it shouldn't.`);
        }
        else if (item === null && accessor) {
            errors.push(`Request with null value informed when it shouldn't.`);
        }
        else if (!accessor) {
            target = item;
        }
        else if (typeof accessor === 'string') {
            if (!(`${accessor}` in item) && !optional) {
                errors.push(`The request is missing the key/property "${accessor}".`);
            }
            else {
                target = item[accessor];
            }
        }
        else {
            target = accessor(item);
        }
        if (!validation(item, target)) {
            if (typeof error === 'string') {
                if (optional) {
                    warnings.push(error);
                }
                else {
                    errors.push(error);
                }
            }
            else {
                if (optional) {
                    warnings.push(error(item, target, accessor, index));
                }
                else {
                    errors.push(error(item, target, accessor, index));
                }
            }
        }
        return {
            warnings,
            errors,
        };
    };
};
const createRequestValidator = (validators, statusCode, headerMessage, errorNumber) => {
    return (request) => {
        let warnings = [];
        let errors = [];
        for (const validator of validators) {
            const result = validator(request);
            warnings = [...warnings, ...result.warnings];
            errors = [...errors, ...result.errors];
        }
        (0, exports.throwIfErrorsExist)(errors, statusCode, request, headerMessage, errorNumber);
        return { warnings, errors };
    };
};
exports.createRequestValidator = createRequestValidator;
const createBatchValidator = (validators, headerItemMessage) => {
    return (items) => {
        let warnings = [];
        let errors = [];
        for (const [index, item] of items.entries()) {
            for (const validator of validators) {
                const itemResult = validator(item, index);
                if (itemResult.warnings && itemResult.warnings.length > 0) {
                    if (headerItemMessage)
                        warnings.push(headerItemMessage(item, index));
                }
                if (itemResult.errors && itemResult.errors.length > 0) {
                    if (headerItemMessage)
                        errors.push(headerItemMessage(item, index));
                }
                warnings = [...warnings, ...itemResult.warnings];
                errors = [...errors, ...itemResult.errors];
            }
        }
        return { warnings, errors };
    };
};
exports.createBatchValidator = createBatchValidator;
const throwIfErrorsExist = (errors, statusCode = http_status_codes_1.StatusCodes.NOT_FOUND, request, headerMessage, errorNumber) => {
    if (errors.length > 0) {
        let message = headerMessage
            ? `${headerMessage(request, errorNumber)}\n`
            : '';
        message += errors.join('\n');
        throw new error_handler_1.HttpException(statusCode, message);
    }
};
exports.throwIfErrorsExist = throwIfErrorsExist;
exports.validateOrderClientId = createValidator('id', (_, value) => (0, validators_1.isNaturalNumberString)(value), (_, value) => `Invalid client id (${value}), it needs to be in big number format.`, true);
exports.validateOrderClientIds = createValidator('ids', (_, values) => {
    let ok = true;
    values === undefined
        ? (ok = true)
        : values.map((item) => (ok = (0, validators_1.isNaturalNumberString)(item) && ok));
    return ok;
}, `Invalid client ids, it needs to be an array of big numbers.`, true);
exports.validateOrderExchangeId = createValidator('exchangeId', (_, value) => value === undefined || (0, validators_1.isNaturalNumberString)(value), (_, value) => `Invalid exchange id (${value}), it needs to be in big number format.`, true);
exports.validateOrderExchangeIds = createValidator('exchangeIds', (_, values) => {
    let ok = true;
    values === undefined
        ? (ok = true)
        : values.map((item) => (ok = (0, validators_1.isNaturalNumberString)(item) && ok));
    return ok;
}, `Invalid client ids, it needs to be an array of big numbers.`, true);
exports.validateOrderMarketName = createValidator('marketName', (_, value) => value.trim().length, (_, value) => `Invalid market name (${value}).`, false);
exports.validateOrderMarketNames = createValidator('marketNames', (_, values) => {
    let ok = true;
    values === undefined
        ? (ok = true)
        : values.map((item) => (ok = item.trim().length && ok));
    return ok;
}, `Invalid market names, it needs to be an array of strings.`, true);
exports.validateOrderOwnerAddress = createValidator('ownerAddress', (_, value) => (0, validators_1.isBase58)(value), (_, value) => `Invalid owner address (${value}).`, false);
exports.validateOrderSide = createValidator('side', (_, value) => value &&
    Object.values(serum_types_1.OrderSide)
        .map((i) => i.toLowerCase())
        .includes(value.toLowerCase()), (_, value) => `Invalid order side (${value}).`, false);
exports.validateOrderPrice = createValidator('price', (_, value) => typeof value === 'number' || (0, validators_1.isFloatString)(value), (_, value) => `Invalid order price (${value}).`, false);
exports.validateOrderAmount = createValidator('amount', (_, value) => typeof value === 'number' || (0, validators_1.isFloatString)(value), (_, value) => `Invalid order amount (${value}).`, false);
exports.validateOrderType = createValidator('type', (_, value) => value === undefined
    ? true
    : Object.values(serum_types_1.OrderType)
        .map((item) => item.toLowerCase())
        .includes(value.toLowerCase()), (_, value) => `Invalid order type (${value}).`, true);
exports.validateGetMarketRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.name, `No market was informed. If you want to get a market, please inform the parameter "name".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetMarketsRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.names && request.names.length, `No markets were informed. If you want to get all markets, please do not inform the parameter "names".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetOrderBookRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.marketName, `No market name was informed. If you want to get an order book, please inform the parameter "marketName".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetOrderBooksRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.marketNames && request.marketNames.length, `No market names were informed. If you want to get all order books, please do not inform the parameter "marketNames".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetTickerRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.marketName, `No market name was informed. If you want to get a ticker, please inform the parameter "marketName".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetTickersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (request) => request.marketNames && request.marketNames.length, `No market names were informed. If you want to get all tickers, please do not inform the parameter "marketNames".`, false),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetOrderRequest = (0, exports.createRequestValidator)([
    exports.validateOrderClientId,
    exports.validateOrderExchangeId,
    createValidator(null, (request) => !(request &&
        request.id === undefined &&
        request.exchangeId === undefined), `No client id or exchange id were informed.`, false),
    exports.validateOrderOwnerAddress,
], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to get order "${request.id}"`);
exports.validateGetOrdersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (values) => values && values.length, `No orders were informed.`, false),
    (0, exports.createBatchValidator)([
        exports.validateOrderClientId,
        exports.validateOrderExchangeId,
        createValidator(null, (request) => !(request &&
            request.ids === undefined &&
            request.exchangeIds === undefined), `No client ids or exchange ids were informed.`, false),
        exports.validateOrderOwnerAddress,
    ], (_, index) => `Invalid get orders request at position ${index}:`),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetAllOrdersRequest = (0, exports.createRequestValidator)([exports.validateOrderOwnerAddress], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateCreateOrderRequest = (0, exports.createRequestValidator)([
    exports.validateOrderClientId,
    exports.validateOrderMarketName,
    exports.validateOrderOwnerAddress,
    exports.validateOrderSide,
    exports.validateOrderPrice,
    exports.validateOrderAmount,
    exports.validateOrderType,
], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to create order "${request.id}"`);
exports.validateCreateOrdersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (values) => values && values.length, `No orders were informed.`, false),
    (0, exports.createBatchValidator)([
        exports.validateOrderClientId,
        exports.validateOrderMarketName,
        exports.validateOrderOwnerAddress,
        exports.validateOrderSide,
        exports.validateOrderPrice,
        exports.validateOrderAmount,
        exports.validateOrderType,
    ], (item, index) => `Invalid create orders request at position ${index} with id / exchange id "${item.id} / ${item.exchangeId}":`),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateCancelOrderRequest = (0, exports.createRequestValidator)([
    exports.validateOrderClientId,
    exports.validateOrderExchangeId,
    exports.validateOrderMarketName,
    exports.validateOrderOwnerAddress,
], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to cancel order "${request.id}"`);
exports.validateCancelOrdersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (values) => values && values.length, `No orders were informed.`, false),
    (0, exports.createBatchValidator)([
        exports.validateOrderClientIds,
        exports.validateOrderExchangeIds,
        exports.validateOrderMarketName,
        exports.validateOrderOwnerAddress,
    ], (_, index) => `Invalid cancel orders request at position ${index}:`),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateCancelAllOrdersRequest = (0, exports.createRequestValidator)([exports.validateOrderOwnerAddress], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetOpenOrderRequest = (0, exports.createRequestValidator)([
    exports.validateOrderClientId,
    exports.validateOrderExchangeId,
    createValidator(null, (request) => !(request &&
        request.id === undefined &&
        request.exchangeId === undefined), `No client id or exchange id were informed.`, false),
    exports.validateOrderOwnerAddress,
], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to get open order "${request.id}"`);
exports.validateGetOpenOrdersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (values) => values && values.length, `No orders were informed.`, false),
    (0, exports.createBatchValidator)([
        exports.validateOrderClientIds,
        exports.validateOrderExchangeIds,
        createValidator(null, (request) => !(request &&
            request.ids === undefined &&
            request.exchangeIds === undefined), `No client ids or exchange ids were informed.`, false),
        exports.validateOrderOwnerAddress,
    ], (_, index) => `Invalid get open orders request at position ${index}:`),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateGetFilledOrderRequest = (0, exports.createRequestValidator)([
    exports.validateOrderClientId,
    exports.validateOrderExchangeId,
    createValidator(null, (request) => !(request &&
        request.id === undefined &&
        request.exchangeId === undefined), `No client id or exchange id were informed.`, false),
    exports.validateOrderOwnerAddress,
], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to get filled order "${request.id}"`);
exports.validateGetFilledOrdersRequest = (0, exports.createRequestValidator)([
    createValidator(null, (values) => values && values.length, `No orders were informed.`, false),
    (0, exports.createBatchValidator)([
        exports.validateOrderClientIds,
        exports.validateOrderExchangeIds,
        createValidator(null, (request) => !(request &&
            request.ids === undefined &&
            request.exchangeIds === undefined), `No client ids or exchange ids were informed.`, false),
        exports.validateOrderOwnerAddress,
    ], (_, index) => `Invalid get filled orders request at position ${index}:`),
], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateSettleFundsRequest = (0, exports.createRequestValidator)([exports.validateOrderMarketName, exports.validateOrderOwnerAddress], http_status_codes_1.StatusCodes.BAD_REQUEST, (request) => `Error when trying to settle funds for market "${request.marketName}."`);
exports.validateSettleFundsSeveralRequest = (0, exports.createRequestValidator)([exports.validateOrderMarketNames, exports.validateOrderOwnerAddress], http_status_codes_1.StatusCodes.BAD_REQUEST);
exports.validateSettleAllFundsRequest = (0, exports.createRequestValidator)([exports.validateOrderOwnerAddress], http_status_codes_1.StatusCodes.BAD_REQUEST);
//# sourceMappingURL=serum.validators.js.map