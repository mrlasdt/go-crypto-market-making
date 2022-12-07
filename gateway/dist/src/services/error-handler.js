"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayErrorMiddleware = exports.PRICE_FAILED_ERROR_MESSAGE = exports.UNKNOWN_ERROR_MESSAGE = exports.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE = exports.ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE = exports.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE = exports.SERVICE_UNITIALIZED_ERROR_MESSAGE = exports.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE = exports.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE = exports.INVALID_NONCE_ERROR_MESSAGE = exports.INCOMPLETE_REQUEST_PARAM = exports.TRADE_FAILED_ERROR_MESSAGE = exports.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE = exports.LOAD_WALLET_ERROR_MESSAGE = exports.OUT_OF_GAS_ERROR_MESSAGE = exports.RATE_LIMIT_ERROR_MESSAGE = exports.NETWORK_ERROR_MESSAGE = exports.UNKNOWN_ERROR_ERROR_CODE = exports.ACCOUNT_NOT_SPECIFIED_CODE = exports.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE = exports.INCOMPLETE_REQUEST_PARAM_CODE = exports.PRICE_FAILED_ERROR_CODE = exports.INVALID_NONCE_ERROR_CODE = exports.UNKNOWN_CHAIN_ERROR_CODE = exports.SERVICE_UNITIALIZED_ERROR_CODE = exports.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_CODE = exports.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE = exports.TRADE_FAILED_ERROR_CODE = exports.TOKEN_NOT_SUPPORTED_ERROR_CODE = exports.LOAD_WALLET_ERROR_CODE = exports.TRANSACTION_GAS_PRICE_TOO_LOW = exports.OUT_OF_GAS_ERROR_CODE = exports.RATE_LIMIT_ERROR_CODE = exports.NETWORK_ERROR_CODE = exports.parseTransactionGasError = exports.asyncHandler = exports.InvalidNonceError = exports.UniswapishPriceError = exports.InitializationError = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, errorCode = -1) {
        super(message);
        this.status = status;
        this.message = message;
        this.errorCode = errorCode;
    }
}
exports.HttpException = HttpException;
class InitializationError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
    }
}
exports.InitializationError = InitializationError;
class UniswapishPriceError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.UniswapishPriceError = UniswapishPriceError;
class InvalidNonceError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
    }
}
exports.InvalidNonceError = InvalidNonceError;
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
const parseTransactionGasError = (error) => {
    if ('code' in error && error.code === 'SERVER_ERROR') {
        if ('body' in error) {
            const innerError = JSON.parse(error['body']);
            if ('error' in innerError &&
                'code' in innerError['error'] &&
                innerError['error']['code'] === -32010 &&
                'message' in innerError['error']) {
                const transactionError = {
                    errorCode: exports.TRANSACTION_GAS_PRICE_TOO_LOW,
                    message: innerError['error']['message'],
                };
                return transactionError;
            }
        }
    }
    return null;
};
exports.parseTransactionGasError = parseTransactionGasError;
exports.NETWORK_ERROR_CODE = 1001;
exports.RATE_LIMIT_ERROR_CODE = 1002;
exports.OUT_OF_GAS_ERROR_CODE = 1003;
exports.TRANSACTION_GAS_PRICE_TOO_LOW = 1004;
exports.LOAD_WALLET_ERROR_CODE = 1005;
exports.TOKEN_NOT_SUPPORTED_ERROR_CODE = 1006;
exports.TRADE_FAILED_ERROR_CODE = 1007;
exports.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE = 1008;
exports.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_CODE = 1009;
exports.SERVICE_UNITIALIZED_ERROR_CODE = 1010;
exports.UNKNOWN_CHAIN_ERROR_CODE = 1011;
exports.INVALID_NONCE_ERROR_CODE = 1012;
exports.PRICE_FAILED_ERROR_CODE = 1013;
exports.INCOMPLETE_REQUEST_PARAM_CODE = 1014;
exports.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE = 1015;
exports.ACCOUNT_NOT_SPECIFIED_CODE = 1016;
exports.UNKNOWN_ERROR_ERROR_CODE = 1099;
exports.NETWORK_ERROR_MESSAGE = 'Network error. Please check your node URL, API key, and Internet connection.';
exports.RATE_LIMIT_ERROR_MESSAGE = 'Blockchain node API rate limit exceeded.';
exports.OUT_OF_GAS_ERROR_MESSAGE = 'Transaction out of gas.';
exports.LOAD_WALLET_ERROR_MESSAGE = 'Failed to load wallet: ';
exports.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE = 'Token not supported: ';
exports.TRADE_FAILED_ERROR_MESSAGE = 'Trade query failed: ';
exports.INCOMPLETE_REQUEST_PARAM = 'Incomplete request parameters.';
exports.INVALID_NONCE_ERROR_MESSAGE = 'Invalid Nonce provided: ';
const SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE = (price, limitPrice) => `Swap price ${price} exceeds limitPrice ${limitPrice}`;
exports.SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE = SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE;
const SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE = (price, limitPrice) => `Swap price ${price} lower than limitPrice ${limitPrice}`;
exports.SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE = SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE;
const SERVICE_UNITIALIZED_ERROR_MESSAGE = (service) => `${service} was called before being initialized.`;
exports.SERVICE_UNITIALIZED_ERROR_MESSAGE = SERVICE_UNITIALIZED_ERROR_MESSAGE;
const UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE = (chainName) => `Unrecognized chain name ${chainName}.`;
exports.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE = UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE;
const ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE = () => `AccountID or address not specified.`;
exports.ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE = ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE;
const ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE = (privKey) => `Unable to retrieve wallet address for provided private key: ${privKey.substring(0, 5)}`;
exports.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE = ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE;
exports.UNKNOWN_ERROR_MESSAGE = 'Unknown error.';
exports.PRICE_FAILED_ERROR_MESSAGE = 'Price query failed: ';
const gatewayErrorMiddleware = (err) => {
    const response = {
        message: err.message || exports.UNKNOWN_ERROR_MESSAGE,
        httpErrorCode: 503,
        errorCode: exports.UNKNOWN_ERROR_ERROR_CODE,
        stack: err.stack,
    };
    if (err instanceof HttpException) {
        response.httpErrorCode = err.status;
        response.errorCode = err.errorCode;
    }
    else if (err instanceof InitializationError) {
        response.errorCode = err.errorCode;
    }
    else {
        response.errorCode = exports.UNKNOWN_ERROR_ERROR_CODE;
        response.message = exports.UNKNOWN_ERROR_MESSAGE;
        if ('code' in err) {
            switch (typeof err.code) {
                case 'string':
                    if (['NETWORK_ERROR', 'TIMEOUT'].includes(err.code)) {
                        response.errorCode = exports.NETWORK_ERROR_CODE;
                        response.message = exports.NETWORK_ERROR_MESSAGE;
                    }
                    else if (err.code === 'SERVER_ERROR') {
                        const transactionError = (0, exports.parseTransactionGasError)(err);
                        if (transactionError) {
                            response.errorCode = transactionError.errorCode;
                            response.message = transactionError.message;
                        }
                        else {
                            response.errorCode = exports.NETWORK_ERROR_CODE;
                            response.message = exports.NETWORK_ERROR_MESSAGE;
                        }
                    }
                    break;
                case 'number':
                    if (err.code === -32005) {
                        response.errorCode = exports.RATE_LIMIT_ERROR_CODE;
                        response.message = exports.RATE_LIMIT_ERROR_MESSAGE;
                    }
                    else if (err.code === -32010) {
                        response.errorCode = exports.TRANSACTION_GAS_PRICE_TOO_LOW;
                        response.message = err.message;
                    }
                    break;
            }
        }
    }
    return response;
};
exports.gatewayErrorMiddleware = gatewayErrorMiddleware;
//# sourceMappingURL=error-handler.js.map