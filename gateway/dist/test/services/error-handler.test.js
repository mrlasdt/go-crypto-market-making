"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../../src/services/error-handler");
require("jest-extended");
describe('parseTransactionGasError', () => {
    test('return null for a normal Error', () => {
        expect((0, error_handler_1.parseTransactionGasError)(new Error())).toEqual(null);
    });
    test('return errorCode and message for gas price error', () => {
        expect((0, error_handler_1.parseTransactionGasError)({
            code: 'SERVER_ERROR',
            body: '{"error":{"message":"ERROR","code":-32010}}',
        })).toEqual({ errorCode: error_handler_1.TRANSACTION_GAS_PRICE_TOO_LOW, message: 'ERROR' });
    });
});
class NetworkError extends Error {
    constructor(message) {
        super(message);
        this.code = 'NETWORK_ERROR';
    }
}
class ServerError extends Error {
    constructor(message) {
        super(message);
        this.code = 'SERVER_ERROR';
    }
}
class TransactionGasError extends Error {
    constructor(message) {
        super(message);
        this.code = 'SERVER_ERROR';
        this.body = '{"error":{"code":-32010,"message":"need more gas"}}';
    }
}
class GasPriceTooLowError extends Error {
    constructor(message) {
        super(message);
        this.code = -32010;
    }
}
class RateLimit extends Error {
    constructor(message) {
        super(message);
        this.code = -32005;
    }
}
describe('gatewayErrorMiddleware', () => {
    test('return 503 and UNKNOWN message and code for a normal error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new Error('there was an error'))).toEqual(expect.objectContaining({
            message: error_handler_1.UNKNOWN_ERROR_MESSAGE,
            httpErrorCode: 503,
            errorCode: error_handler_1.UNKNOWN_ERROR_ERROR_CODE,
        }));
    });
    test('pass values from HttpException to response error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new error_handler_1.HttpException(403, 'error', 100))).toEqual(expect.objectContaining({
            message: 'error',
            httpErrorCode: 403,
            errorCode: 100,
        }));
    });
    test('return NETWORK_ERROR_CODE and NETWORK_ERROR_MESSAGE for network error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new NetworkError('error2'))).toEqual(expect.objectContaining({
            message: error_handler_1.NETWORK_ERROR_MESSAGE,
            httpErrorCode: 503,
            errorCode: error_handler_1.NETWORK_ERROR_CODE,
        }));
    });
    test('return Infura RateLimit error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new RateLimit('error3'))).toEqual(expect.objectContaining({
            message: error_handler_1.RATE_LIMIT_ERROR_MESSAGE,
            httpErrorCode: 503,
            errorCode: error_handler_1.RATE_LIMIT_ERROR_CODE,
        }));
    });
    test('return NETWORK_ERROR_CODE and NETWORK_ERROR_MESSAGE for network error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new error_handler_1.InitializationError('error4', 123))).toEqual(expect.objectContaining({
            message: 'error4',
            errorCode: 123,
        }));
    });
    test('return NETWORK_ERROR_CODE and NETWORK_ERROR_MESSAGE for server error if not a transaction gas error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new ServerError('error5'))).toEqual(expect.objectContaining({
            message: error_handler_1.NETWORK_ERROR_MESSAGE,
            httpErrorCode: 503,
            errorCode: error_handler_1.NETWORK_ERROR_CODE,
        }));
    });
    test('return transaction errorCode and message if it is a transaction gas error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new TransactionGasError('error6'))).toEqual(expect.objectContaining({
            message: 'need more gas',
            httpErrorCode: 503,
            errorCode: error_handler_1.TRANSACTION_GAS_PRICE_TOO_LOW,
        }));
    });
    test('return transaction errorCode and message if it is a transaction gas error', () => {
        expect((0, error_handler_1.gatewayErrorMiddleware)(new GasPriceTooLowError('error7'))).toEqual(expect.objectContaining({
            errorCode: error_handler_1.TRANSACTION_GAS_PRICE_TOO_LOW,
        }));
    });
});
//# sourceMappingURL=error-handler.test.js.map