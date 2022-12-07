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
exports.runWithRetryAndTimeout = exports.getRandonBN = exports.promiseAllInBatches = exports.sleep = exports.getNotNullOrThrowError = void 0;
const web3_1 = __importDefault(require("web3"));
const solana_constants_1 = __importDefault(require("./../../chains/solana/solana.constants"));
const getNotNullOrThrowError = (value, errorMessage = 'Value is null or undefined') => {
    if (value === undefined || value === null)
        throw new Error(errorMessage);
    return value;
};
exports.getNotNullOrThrowError = getNotNullOrThrowError;
const sleep = (milliseconds) => new Promise((callback) => setTimeout(callback, milliseconds));
exports.sleep = sleep;
const promiseAllInBatches = (task, items, batchSize = solana_constants_1.default.parallel.all.batchSize, delayBetweenBatches = solana_constants_1.default.parallel.all.delayBetweenBatches) => __awaiter(void 0, void 0, void 0, function* () {
    let position = 0;
    let results = [];
    if (!batchSize) {
        batchSize = items.length;
    }
    while (position < items.length) {
        const itemsForBatch = items.slice(position, position + batchSize);
        results = [
            ...results,
            ...(yield Promise.all(itemsForBatch.map((item) => task(item)))),
        ];
        position += batchSize;
        if (position < items.length) {
            if (delayBetweenBatches > 0) {
                yield (0, exports.sleep)(delayBetweenBatches);
            }
        }
    }
    return results;
});
exports.promiseAllInBatches = promiseAllInBatches;
const getRandonBN = () => {
    return web3_1.default.utils.toBN(web3_1.default.utils.randomHex(32));
};
exports.getRandonBN = getRandonBN;
const runWithRetryAndTimeout = (targetObject, targetFunction, targetParameters, maxNumberOfRetries = solana_constants_1.default.retry.all.maxNumberOfRetries, delayBetweenRetries = solana_constants_1.default.retry.all.delayBetweenRetries, timeout = solana_constants_1.default.timeout.all, timeoutMessage = 'Timeout exceeded.') => __awaiter(void 0, void 0, void 0, function* () {
    let retryCount = 0;
    let timer;
    if (timeout > 0) {
        timer = setTimeout(() => new Error(timeoutMessage), timeout);
    }
    do {
        try {
            const result = yield targetFunction.apply(targetObject, targetParameters);
            if (timeout > 0) {
                clearTimeout(timer);
            }
            return result;
        }
        catch (error) {
            retryCount++;
            if (retryCount < maxNumberOfRetries) {
                if (delayBetweenRetries > 0) {
                    yield (0, exports.sleep)(delayBetweenRetries);
                }
            }
            else {
                throw error;
            }
        }
    } while (retryCount < maxNumberOfRetries);
    throw Error('Unknown error.');
});
exports.runWithRetryAndTimeout = runWithRetryAndTimeout;
//# sourceMappingURL=serum.helpers.js.map