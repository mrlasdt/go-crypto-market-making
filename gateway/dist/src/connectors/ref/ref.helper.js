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
exports.sendTransactions = exports.getSignedTransactions = void 0;
const near_api_js_1 = require("near-api-js");
const bn_js_1 = __importDefault(require("bn.js"));
const coinalpha_ref_sdk_1 = require("coinalpha-ref-sdk");
const validateAccessKey = (transaction, accessKey) => {
    if (accessKey.permission === 'FullAccess') {
        return accessKey;
    }
    const { receiver_id, method_names } = accessKey.permission.FunctionCall;
    if (transaction.receiverId !== receiver_id) {
        return null;
    }
    return transaction.actions.every((action) => {
        if (action.type !== 'FunctionCall') {
            return false;
        }
        const { methodName, deposit } = action.params;
        if (method_names.length && method_names.includes(methodName)) {
            return false;
        }
        return parseFloat(deposit) <= 0;
    });
};
const getSignedTransactions = ({ transactionsRef, account, }) => __awaiter(void 0, void 0, void 0, function* () {
    const AccountId = account.accountId;
    const networkId = account.connection.networkId;
    const transactions = (0, coinalpha_ref_sdk_1.transformTransactions)(transactionsRef, AccountId);
    const block = yield account.connection.provider.block({ finality: 'final' });
    const signedTransactions = [];
    const publicKey = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
    if (!publicKey) {
        throw 'Wallet not properly initialized.';
    }
    const accessKey = yield account.connection.provider.query({
        request_type: 'view_access_key',
        finality: 'final',
        account_id: AccountId,
        public_key: publicKey.toString(),
    });
    for (let i = 0; i < transactions.length; i += 1) {
        const transaction = transactions[i];
        if (!validateAccessKey(transaction, accessKey)) {
            throw 'Account does not have access.';
        }
        const tx = near_api_js_1.transactions.createTransaction(AccountId, near_api_js_1.utils.PublicKey.from(publicKey.toString()), transactions[i].receiverId, accessKey.nonce + i + 1, transaction.actions.map((action) => {
            const { methodName, args, gas, deposit } = action.params;
            return near_api_js_1.transactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }), near_api_js_1.utils.serialize.base_decode(block.header.hash));
        const [, signedTx] = yield near_api_js_1.transactions.signTransaction(tx, account.connection.signer, transactions[i].signerId, networkId);
        signedTransactions.push(signedTx);
    }
    return signedTransactions;
});
exports.getSignedTransactions = getSignedTransactions;
const sendTransactions = ({ signedTransactions, provider, }) => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    for (const signedTransaction of signedTransactions) {
        results.push(yield provider.sendTransactionAsync(signedTransaction));
    }
    return results;
});
exports.sendTransactions = sendTransactions;
//# sourceMappingURL=ref.helper.js.map