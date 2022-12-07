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
exports.Market = void 0;
const mango_client_1 = require("@blockworks-foundation/mango-client");
const fees_1 = require("@project-serum/serum/lib/fees");
const instructions_1 = require("@project-serum/serum/lib/instructions");
const market_1 = require("@project-serum/serum/lib/market");
const queue_1 = require("@project-serum/serum/lib/queue");
const token_instructions_1 = require("@project-serum/serum/lib/token-instructions");
const tokens_and_markets_1 = require("@project-serum/serum/lib/tokens_and_markets");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const serum_helpers_1 = require("../serum.helpers");
class Market {
    constructor(decoded, baseMintDecimals, quoteMintDecimals, options = {}, programId, layoutOverride) {
        const { skipPreflight = false, commitment = 'recent' } = options;
        if (!decoded.accountFlags.initialized || !decoded.accountFlags.market) {
            throw new Error('Invalid market state');
        }
        this._decoded = decoded;
        this._baseSplTokenDecimals = baseMintDecimals;
        this._quoteSplTokenDecimals = quoteMintDecimals;
        this._skipPreflight = skipPreflight;
        this._commitment = commitment;
        this._programId = programId;
        this._openOrdersAccountsCache = {};
        this._feeDiscountKeysCache = {};
        this._layoutOverride = layoutOverride;
    }
    static getLayout(programId) {
        if ((0, tokens_and_markets_1.getLayoutVersion)(programId) === 1) {
            return market_1._MARKET_STAT_LAYOUT_V1;
        }
        return market_1.MARKET_STATE_LAYOUT_V2;
    }
    static findAccountsByMints(connection, baseMintAddress, quoteMintAddress, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = [
                {
                    memcmp: {
                        offset: this.getLayout(programId).offsetOf('baseMint'),
                        bytes: baseMintAddress.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: Market.getLayout(programId).offsetOf('quoteMint'),
                        bytes: quoteMintAddress.toBase58(),
                    },
                },
            ];
            return (0, mango_client_1.getFilteredProgramAccounts)(connection, programId, filters);
        });
    }
    static load(connection, address, options = {}, programId, layoutOverride) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, data } = throwIfNull(yield connection.getAccountInfo(address), 'Market not found');
            if (!owner.equals(programId)) {
                throw new Error('Address not owned by program: ' + owner.toBase58());
            }
            const decoded = (layoutOverride !== null && layoutOverride !== void 0 ? layoutOverride : this.getLayout(programId)).decode(data);
            if (!decoded.accountFlags.initialized ||
                !decoded.accountFlags.market ||
                !decoded.ownAddress.equals(address)) {
                throw new Error('Invalid market');
            }
            const [baseMintDecimals, quoteMintDecimals] = yield Promise.all([
                (0, market_1.getMintDecimals)(connection, decoded.baseMint),
                (0, market_1.getMintDecimals)(connection, decoded.quoteMint),
            ]);
            return new Market(decoded, baseMintDecimals, quoteMintDecimals, options, programId, layoutOverride);
        });
    }
    get programId() {
        return this._programId;
    }
    get address() {
        return this._decoded.ownAddress;
    }
    get publicKey() {
        return this.address;
    }
    get baseMintAddress() {
        return this._decoded.baseMint;
    }
    get quoteMintAddress() {
        return this._decoded.quoteMint;
    }
    get bidsAddress() {
        return this._decoded.bids;
    }
    get asksAddress() {
        return this._decoded.asks;
    }
    get decoded() {
        return this._decoded;
    }
    loadBids(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.bids));
            return market_1.Orderbook.decode(this, data);
        });
    }
    loadAsks(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.asks));
            return market_1.Orderbook.decode(this, data);
        });
    }
    loadOrdersForOwner(connection, ownerAddress, cacheDurationMs = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const [bids, asks, openOrdersAccounts] = yield Promise.all([
                this.loadBids(connection),
                this.loadAsks(connection),
                this.findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs),
            ]);
            return this.filterForOpenOrders(bids, asks, openOrdersAccounts);
        });
    }
    filterForOpenOrders(bids, asks, openOrdersAccounts) {
        return [...bids, ...asks].filter((order) => openOrdersAccounts.some((openOrders) => order.openOrdersAddress.equals(openOrders.address)));
    }
    findBaseTokenAccountsForOwner(connection, ownerAddress, includeUnwrappedSol = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.baseMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) && includeUnwrappedSol) {
                const [wrapped, unwrapped] = yield Promise.all([
                    this.findBaseTokenAccountsForOwner(connection, ownerAddress, false),
                    connection.getAccountInfo(ownerAddress),
                ]);
                if (unwrapped !== null) {
                    return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
                }
                return wrapped;
            }
            return yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, this.baseMintAddress);
        });
    }
    getTokenAccountsByOwnerForMint(connection, ownerAddress, mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield connection.getTokenAccountsByOwner(ownerAddress, {
                mint: mintAddress,
            })).value;
        });
    }
    findQuoteTokenAccountsForOwner(connection, ownerAddress, includeUnwrappedSol = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.quoteMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) && includeUnwrappedSol) {
                const [wrapped, unwrapped] = yield Promise.all([
                    this.findQuoteTokenAccountsForOwner(connection, ownerAddress, false),
                    connection.getAccountInfo(ownerAddress),
                ]);
                if (unwrapped !== null) {
                    return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
                }
                return wrapped;
            }
            return yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, this.quoteMintAddress);
        });
    }
    findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const strOwner = ownerAddress.toBase58();
            const now = new Date().getTime();
            if (strOwner in this._openOrdersAccountsCache &&
                now - this._openOrdersAccountsCache[strOwner].ts < cacheDurationMs) {
                return this._openOrdersAccountsCache[strOwner].accounts;
            }
            const openOrdersAccountsForOwner = yield market_1.OpenOrders.findForMarketAndOwner(connection, this.address, ownerAddress, this._programId);
            this._openOrdersAccountsCache[strOwner] = {
                accounts: openOrdersAccountsForOwner,
                ts: now,
            };
            return openOrdersAccountsForOwner;
        });
    }
    replaceOrders(connection, accounts, orders, cacheDurationMs = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!accounts.openOrdersAccount && !accounts.openOrdersAddressKey) {
                const ownerAddress = (_a = accounts.owner.publicKey) !== null && _a !== void 0 ? _a : accounts.owner;
                const openOrdersAccounts = yield this.findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs);
                accounts.openOrdersAddressKey = openOrdersAccounts[0].address;
            }
            const transaction = new web3_js_1.Transaction();
            transaction.add(this.makeReplaceOrdersByClientIdsInstruction(accounts, orders));
            return yield this._sendTransaction(connection, transaction, [
                accounts.owner,
            ]);
        });
    }
    placeOrder(connection, { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey, maxTs, replaceIfExists = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transaction, signers } = yield this.makePlaceOrderTransaction(connection, {
                owner,
                payer,
                side,
                price,
                size,
                orderType,
                clientId,
                openOrdersAddressKey,
                openOrdersAccount,
                feeDiscountPubkey,
                maxTs,
                replaceIfExists,
            });
            return yield this._sendTransaction(connection, transaction, [
                owner,
                ...signers,
            ]);
        });
    }
    placeOrders(connection, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionSignatures = new Array();
            const ownersMap = new Map();
            for (const { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey, maxTs, replaceIfExists = false, } of orders) {
                let item = ownersMap.get(owner);
                if (!item) {
                    item = { transaction: new web3_js_1.Transaction(), signers: [] };
                    ownersMap.set(owner, item);
                }
                const transaction = item.transaction;
                const signers = item.signers;
                const partial = yield this.makePlaceOrderTransactionForBatch(transaction, connection, {
                    owner,
                    payer,
                    side,
                    price,
                    size,
                    orderType,
                    clientId,
                    openOrdersAddressKey,
                    openOrdersAccount,
                    feeDiscountPubkey,
                    maxTs,
                    replaceIfExists,
                });
                signers.push(...partial.signers);
            }
            const sendTransaction = (entry) => __awaiter(this, void 0, void 0, function* () {
                transactionSignatures.push(yield this._sendTransaction(connection, entry[1].transaction, [
                    entry[0],
                    ...entry[1].signers,
                ]));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(sendTransaction, Array.from(ownersMap.entries()));
            return transactionSignatures;
        });
    }
    getSplTokenBalanceFromAccountInfo(accountInfo, decimals) {
        return divideBnToNumber(new bn_js_1.default(accountInfo.data.slice(64, 72), 10, 'le'), new bn_js_1.default(10).pow(new bn_js_1.default(decimals)));
    }
    get supportsSrmFeeDiscounts() {
        return (0, fees_1.supportsSrmFeeDiscounts)(this._programId);
    }
    get supportsReferralFees() {
        return (0, tokens_and_markets_1.getLayoutVersion)(this._programId) > 1;
    }
    get usesRequestQueue() {
        return (0, tokens_and_markets_1.getLayoutVersion)(this._programId) <= 2;
    }
    findFeeDiscountKeys(connection, ownerAddress, cacheDurationMs = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let sortedAccounts = [];
            const now = new Date().getTime();
            const strOwner = ownerAddress.toBase58();
            if (strOwner in this._feeDiscountKeysCache &&
                now - this._feeDiscountKeysCache[strOwner].ts < cacheDurationMs) {
                return this._feeDiscountKeysCache[strOwner].accounts;
            }
            if (this.supportsSrmFeeDiscounts) {
                const msrmAccounts = (yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, token_instructions_1.MSRM_MINT)).map(({ pubkey, account }) => {
                    const balance = this.getSplTokenBalanceFromAccountInfo(account, token_instructions_1.MSRM_DECIMALS);
                    return {
                        pubkey,
                        mint: token_instructions_1.MSRM_MINT,
                        balance,
                        feeTier: (0, fees_1.getFeeTier)(balance, 0),
                    };
                });
                const srmAccounts = (yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, token_instructions_1.SRM_MINT)).map(({ pubkey, account }) => {
                    const balance = this.getSplTokenBalanceFromAccountInfo(account, token_instructions_1.SRM_DECIMALS);
                    return {
                        pubkey,
                        mint: token_instructions_1.SRM_MINT,
                        balance,
                        feeTier: (0, fees_1.getFeeTier)(0, balance),
                    };
                });
                sortedAccounts = msrmAccounts.concat(srmAccounts).sort((a, b) => {
                    if (a.feeTier > b.feeTier) {
                        return -1;
                    }
                    else if (a.feeTier < b.feeTier) {
                        return 1;
                    }
                    else {
                        if (a.balance > b.balance) {
                            return -1;
                        }
                        else if (a.balance < b.balance) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                });
            }
            this._feeDiscountKeysCache[strOwner] = {
                accounts: sortedAccounts,
                ts: now,
            };
            return sortedAccounts;
        });
    }
    findBestFeeDiscountKey(connection, ownerAddress, cacheDurationMs = 30000) {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this.findFeeDiscountKeys(connection, ownerAddress, cacheDurationMs);
            if (accounts.length > 0) {
                return {
                    pubkey: accounts[0].pubkey,
                    feeTier: accounts[0].feeTier,
                };
            }
            return {
                pubkey: null,
                feeTier: 0,
            };
        });
    }
    makePlaceOrderTransaction(connection, { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey = undefined, selfTradeBehavior = 'decrementTake', maxTs, replaceIfExists = false, }, cacheDurationMs = 0, feeDiscountPubkeyCacheDurationMs = 0) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const ownerAddress = (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
            const openOrdersAccounts = yield this.findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs);
            const transaction = new web3_js_1.Transaction();
            const signers = [];
            let useFeeDiscountPubkey;
            if (feeDiscountPubkey) {
                useFeeDiscountPubkey = feeDiscountPubkey;
            }
            else if (feeDiscountPubkey === undefined &&
                this.supportsSrmFeeDiscounts) {
                useFeeDiscountPubkey = (yield this.findBestFeeDiscountKey(connection, ownerAddress, feeDiscountPubkeyCacheDurationMs)).pubkey;
            }
            else {
                useFeeDiscountPubkey = null;
            }
            let openOrdersAddress;
            if (openOrdersAccounts.length === 0) {
                let account;
                if (openOrdersAccount) {
                    account = openOrdersAccount;
                }
                else {
                    account = new web3_js_1.Account();
                }
                transaction.add(yield market_1.OpenOrders.makeCreateAccountTransaction(connection, this.address, ownerAddress, account.publicKey, this._programId));
                openOrdersAddress = account.publicKey;
                signers.push(account);
                this._openOrdersAccountsCache[ownerAddress.toBase58()].ts = 0;
            }
            else if (openOrdersAccount) {
                openOrdersAddress = openOrdersAccount.publicKey;
            }
            else if (openOrdersAddressKey) {
                openOrdersAddress = openOrdersAddressKey;
            }
            else {
                openOrdersAddress = openOrdersAccounts[0].address;
            }
            let wrappedSolAccount = null;
            if (payer.equals(ownerAddress)) {
                if ((side === 'buy' && this.quoteMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT)) ||
                    (side === 'sell' && this.baseMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT))) {
                    wrappedSolAccount = new web3_js_1.Account();
                    let lamports;
                    if (side === 'buy') {
                        lamports = Math.round(price * size * 1.01 * web3_js_1.LAMPORTS_PER_SOL);
                        if (openOrdersAccounts.length > 0) {
                            lamports -= openOrdersAccounts[0].quoteTokenFree.toNumber();
                        }
                    }
                    else {
                        lamports = Math.round(size * web3_js_1.LAMPORTS_PER_SOL);
                        if (openOrdersAccounts.length > 0) {
                            lamports -= openOrdersAccounts[0].baseTokenFree.toNumber();
                        }
                    }
                    lamports = Math.max(lamports, 0) + 1e7;
                    transaction.add(web3_js_1.SystemProgram.createAccount({
                        fromPubkey: ownerAddress,
                        newAccountPubkey: wrappedSolAccount.publicKey,
                        lamports,
                        space: 165,
                        programId: token_instructions_1.TOKEN_PROGRAM_ID,
                    }));
                    transaction.add((0, token_instructions_1.initializeAccount)({
                        account: wrappedSolAccount.publicKey,
                        mint: token_instructions_1.WRAPPED_SOL_MINT,
                        owner: ownerAddress,
                    }));
                    signers.push(wrappedSolAccount);
                }
                else {
                    throw new Error('Invalid payer account');
                }
            }
            const placeOrderInstruction = this.makePlaceOrderInstruction(connection, {
                owner,
                payer: (_b = wrappedSolAccount === null || wrappedSolAccount === void 0 ? void 0 : wrappedSolAccount.publicKey) !== null && _b !== void 0 ? _b : payer,
                side,
                price,
                size,
                orderType,
                clientId,
                openOrdersAddressKey: openOrdersAddress,
                feeDiscountPubkey: useFeeDiscountPubkey,
                selfTradeBehavior,
                maxTs,
                replaceIfExists,
            });
            transaction.add(placeOrderInstruction);
            if (wrappedSolAccount) {
                transaction.add((0, token_instructions_1.closeAccount)({
                    source: wrappedSolAccount.publicKey,
                    destination: ownerAddress,
                    owner: ownerAddress,
                }));
            }
            return { transaction, signers, payer: owner };
        });
    }
    makePlaceOrderTransactionForBatch(transaction, connection, { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey = undefined, selfTradeBehavior = 'decrementTake', maxTs, replaceIfExists = false, }, cacheDurationMs = 0, feeDiscountPubkeyCacheDurationMs = 0) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const ownerAddress = (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
            const openOrdersAccounts = yield this.findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs);
            const signers = [];
            let useFeeDiscountPubkey;
            if (feeDiscountPubkey) {
                useFeeDiscountPubkey = feeDiscountPubkey;
            }
            else if (feeDiscountPubkey === undefined &&
                this.supportsSrmFeeDiscounts) {
                useFeeDiscountPubkey = (yield this.findBestFeeDiscountKey(connection, ownerAddress, feeDiscountPubkeyCacheDurationMs)).pubkey;
            }
            else {
                useFeeDiscountPubkey = null;
            }
            let openOrdersAddress;
            if (openOrdersAccounts.length === 0) {
                let account;
                if (openOrdersAccount) {
                    account = openOrdersAccount;
                }
                else {
                    account = new web3_js_1.Account();
                }
                transaction.add(yield market_1.OpenOrders.makeCreateAccountTransaction(connection, this.address, ownerAddress, account.publicKey, this._programId));
                openOrdersAddress = account.publicKey;
                signers.push(account);
                this._openOrdersAccountsCache[ownerAddress.toBase58()].ts = 0;
            }
            else if (openOrdersAccount) {
                openOrdersAddress = openOrdersAccount.publicKey;
            }
            else if (openOrdersAddressKey) {
                openOrdersAddress = openOrdersAddressKey;
            }
            else {
                openOrdersAddress = openOrdersAccounts[0].address;
            }
            let wrappedSolAccount = null;
            if (payer.equals(ownerAddress)) {
                if ((side === 'buy' && this.quoteMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT)) ||
                    (side === 'sell' && this.baseMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT))) {
                    wrappedSolAccount = new web3_js_1.Account();
                    let lamports;
                    if (side === 'buy') {
                        lamports = Math.round(price * size * 1.01 * web3_js_1.LAMPORTS_PER_SOL);
                        if (openOrdersAccounts.length > 0) {
                            lamports -= openOrdersAccounts[0].quoteTokenFree.toNumber();
                        }
                    }
                    else {
                        lamports = Math.round(size * web3_js_1.LAMPORTS_PER_SOL);
                        if (openOrdersAccounts.length > 0) {
                            lamports -= openOrdersAccounts[0].baseTokenFree.toNumber();
                        }
                    }
                    lamports = Math.max(lamports, 0) + 1e7;
                    transaction.add(web3_js_1.SystemProgram.createAccount({
                        fromPubkey: ownerAddress,
                        newAccountPubkey: wrappedSolAccount.publicKey,
                        lamports,
                        space: 165,
                        programId: token_instructions_1.TOKEN_PROGRAM_ID,
                    }));
                    transaction.add((0, token_instructions_1.initializeAccount)({
                        account: wrappedSolAccount.publicKey,
                        mint: token_instructions_1.WRAPPED_SOL_MINT,
                        owner: ownerAddress,
                    }));
                    signers.push(wrappedSolAccount);
                }
                else {
                    throw new Error('Invalid payer account');
                }
            }
            const placeOrderInstruction = this.makePlaceOrderInstruction(connection, {
                owner,
                payer: (_b = wrappedSolAccount === null || wrappedSolAccount === void 0 ? void 0 : wrappedSolAccount.publicKey) !== null && _b !== void 0 ? _b : payer,
                side,
                price,
                size,
                orderType,
                clientId,
                openOrdersAddressKey: openOrdersAddress,
                feeDiscountPubkey: useFeeDiscountPubkey,
                selfTradeBehavior,
                maxTs,
                replaceIfExists,
            });
            transaction.add(placeOrderInstruction);
            if (wrappedSolAccount) {
                transaction.add((0, token_instructions_1.closeAccount)({
                    source: wrappedSolAccount.publicKey,
                    destination: ownerAddress,
                    owner: ownerAddress,
                }));
            }
            return { transaction, signers, payer: owner };
        });
    }
    makePlaceOrderInstruction(_connection, params) {
        var _a;
        const { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey = null, } = params;
        const ownerAddress = (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
        if (this.baseSizeNumberToLots(size).lte(new bn_js_1.default(0))) {
            throw new Error('size too small');
        }
        if (this.priceNumberToLots(price).lte(new bn_js_1.default(0))) {
            throw new Error('invalid price');
        }
        if (this.usesRequestQueue) {
            return instructions_1.DexInstructions.newOrder({
                market: this.address,
                requestQueue: this._decoded.requestQueue,
                baseVault: this._decoded.baseVault,
                quoteVault: this._decoded.quoteVault,
                openOrders: openOrdersAccount
                    ? openOrdersAccount.publicKey
                    : openOrdersAddressKey,
                owner: ownerAddress,
                payer,
                side,
                limitPrice: this.priceNumberToLots(price),
                maxQuantity: this.baseSizeNumberToLots(size),
                orderType,
                clientId,
                programId: this._programId,
                feeDiscountPubkey: this.supportsSrmFeeDiscounts
                    ? feeDiscountPubkey
                    : null,
            });
        }
        else {
            return this.makeNewOrderV3Instruction(params);
        }
    }
    makeNewOrderV3Instruction(params) {
        var _a;
        const { owner, payer, side, price, size, orderType = 'limit', clientId, openOrdersAddressKey, openOrdersAccount, feeDiscountPubkey = null, selfTradeBehavior = 'decrementTake', programId, maxTs, replaceIfExists, } = params;
        const ownerAddress = (_a = owner.publicKey) !== null && _a !== void 0 ? _a : owner;
        return instructions_1.DexInstructions.newOrderV3({
            market: this.address,
            bids: this._decoded.bids,
            asks: this._decoded.asks,
            requestQueue: this._decoded.requestQueue,
            eventQueue: this._decoded.eventQueue,
            baseVault: this._decoded.baseVault,
            quoteVault: this._decoded.quoteVault,
            openOrders: openOrdersAccount
                ? openOrdersAccount.publicKey
                : openOrdersAddressKey,
            owner: ownerAddress,
            payer,
            side,
            limitPrice: this.priceNumberToLots(price),
            maxBaseQuantity: this.baseSizeNumberToLots(size),
            maxQuoteQuantity: new bn_js_1.default(this._decoded.quoteLotSize.toNumber()).mul(this.baseSizeNumberToLots(size).mul(this.priceNumberToLots(price))),
            orderType,
            clientId,
            programId: programId !== null && programId !== void 0 ? programId : this._programId,
            selfTradeBehavior,
            feeDiscountPubkey: this.supportsSrmFeeDiscounts
                ? feeDiscountPubkey
                : null,
            maxTs,
            replaceIfExists,
        });
    }
    makeReplaceOrdersByClientIdsInstruction(accounts, orders) {
        var _a, _b;
        const ownerAddress = (_a = accounts.owner.publicKey) !== null && _a !== void 0 ? _a : accounts.owner;
        return instructions_1.DexInstructions.replaceOrdersByClientIds({
            market: this.address,
            bids: this._decoded.bids,
            asks: this._decoded.asks,
            requestQueue: this._decoded.requestQueue,
            eventQueue: this._decoded.eventQueue,
            baseVault: this._decoded.baseVault,
            quoteVault: this._decoded.quoteVault,
            openOrders: accounts.openOrdersAccount
                ? accounts.openOrdersAccount.publicKey
                : accounts.openOrdersAddressKey,
            owner: ownerAddress,
            payer: accounts.payer,
            programId: (_b = accounts.programId) !== null && _b !== void 0 ? _b : this._programId,
            feeDiscountPubkey: this.supportsSrmFeeDiscounts
                ? accounts.feeDiscountPubkey
                : null,
            orders: orders.map((order) => {
                var _a;
                return ({
                    side: order.side,
                    limitPrice: this.priceNumberToLots(order.price),
                    maxBaseQuantity: this.baseSizeNumberToLots(order.size),
                    maxQuoteQuantity: new bn_js_1.default(this._decoded.quoteLotSize.toNumber()).mul(this.baseSizeNumberToLots(order.size).mul(this.priceNumberToLots(order.price))),
                    orderType: order.orderType,
                    clientId: order.clientId,
                    programId: (_a = accounts.programId) !== null && _a !== void 0 ? _a : this._programId,
                    selfTradeBehavior: order.selfTradeBehavior,
                    maxTs: order.maxTs,
                });
            }),
        });
    }
    _sendTransaction(connection, transaction, signers) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield connection.sendTransaction(transaction, signers, {
                skipPreflight: this._skipPreflight,
            });
            const { value } = yield connection.confirmTransaction(signature, this._commitment);
            if (value === null || value === void 0 ? void 0 : value.err) {
                throw new Error(JSON.stringify(value.err));
            }
            return signature;
        });
    }
    cancelOrderByClientId(connection, owner, openOrders, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.makeCancelOrderByClientIdTransaction(connection, owner.publicKey, openOrders, clientId);
            return yield this._sendTransaction(connection, transaction, [owner]);
        });
    }
    cancelOrdersByClientIds(connection, owner, openOrders, clientIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.makeCancelOrdersByClientIdsTransaction(connection, owner.publicKey, openOrders, clientIds);
            return yield this._sendTransaction(connection, transaction, [owner]);
        });
    }
    makeCancelOrderByClientIdTransaction(_connection, owner, openOrders, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = new web3_js_1.Transaction();
            if (this.usesRequestQueue) {
                transaction.add(instructions_1.DexInstructions.cancelOrderByClientId({
                    market: this.address,
                    owner,
                    openOrders,
                    requestQueue: this._decoded.requestQueue,
                    clientId,
                    programId: this._programId,
                }));
            }
            else {
                transaction.add(instructions_1.DexInstructions.cancelOrderByClientIdV2({
                    market: this.address,
                    openOrders,
                    owner,
                    bids: this._decoded.bids,
                    asks: this._decoded.asks,
                    eventQueue: this._decoded.eventQueue,
                    clientId,
                    programId: this._programId,
                }));
            }
            return transaction;
        });
    }
    makeCancelOrdersByClientIdsTransaction(_connection, owner, openOrders, clientIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = new web3_js_1.Transaction();
            transaction.add(instructions_1.DexInstructions.cancelOrdersByClientIds({
                market: this.address,
                openOrders,
                owner,
                bids: this._decoded.bids,
                asks: this._decoded.asks,
                eventQueue: this._decoded.eventQueue,
                clientIds,
                programId: this._programId,
            }));
            return transaction;
        });
    }
    cancelOrder(connection, owner, order) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.makeCancelOrderTransaction(connection, owner.publicKey, order);
            return yield this._sendTransaction(connection, transaction, [owner]);
        });
    }
    cancelOrders(connection, owner, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!orders.length)
                throw new Error('No orders provided');
            const transaction = new web3_js_1.Transaction();
            for (const order of orders) {
                yield this.makeCancelOrderTransactionForBatch(transaction, connection, owner.publicKey, order);
            }
            return yield this._sendTransaction(connection, transaction, [owner]);
        });
    }
    makeCancelOrderTransaction(connection, owner, order) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = new web3_js_1.Transaction();
            transaction.add(this.makeCancelOrderInstruction(connection, owner, order));
            return transaction;
        });
    }
    makeCancelOrderTransactionForBatch(transaction, connection, owner, order) {
        return __awaiter(this, void 0, void 0, function* () {
            transaction.add(this.makeCancelOrderInstruction(connection, owner, order));
            return transaction;
        });
    }
    makeCancelOrderInstruction(_connection, owner, order) {
        if (this.usesRequestQueue) {
            return instructions_1.DexInstructions.cancelOrder({
                market: this.address,
                owner,
                openOrders: order.openOrdersAddress,
                requestQueue: this._decoded.requestQueue,
                side: order.side,
                orderId: order.orderId,
                openOrdersSlot: order.openOrdersSlot,
                programId: this._programId,
            });
        }
        else {
            return instructions_1.DexInstructions.cancelOrderV2({
                market: this.address,
                owner,
                openOrders: order.openOrdersAddress,
                bids: this._decoded.bids,
                asks: this._decoded.asks,
                eventQueue: this._decoded.eventQueue,
                side: order.side,
                orderId: order.orderId,
                openOrdersSlot: order.openOrdersSlot,
                programId: this._programId,
            });
        }
    }
    makeConsumeEventsInstruction(openOrdersAccounts, limit) {
        return instructions_1.DexInstructions.consumeEvents({
            market: this.address,
            eventQueue: this._decoded.eventQueue,
            coinFee: this._decoded.eventQueue,
            pcFee: this._decoded.eventQueue,
            openOrdersAccounts,
            limit,
            programId: this._programId,
        });
    }
    makeConsumeEventsPermissionedInstruction(openOrdersAccounts, limit) {
        return instructions_1.DexInstructions.consumeEventsPermissioned({
            market: this.address,
            eventQueue: this._decoded.eventQueue,
            crankAuthority: this._decoded.consumeEventsAuthority,
            openOrdersAccounts,
            limit,
            programId: this._programId,
        });
    }
    settleFunds(connection, owner, openOrders, baseWallet, quoteWallet, referrerQuoteWallet = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!openOrders.owner.equals(owner.publicKey)) {
                throw new Error('Invalid open orders account');
            }
            if (referrerQuoteWallet && !this.supportsReferralFees) {
                throw new Error('This program ID does not support referrerQuoteWallet');
            }
            const { transaction, signers } = yield this.makeSettleFundsTransaction(connection, openOrders, baseWallet, quoteWallet, referrerQuoteWallet);
            return yield this._sendTransaction(connection, transaction, [
                owner,
                ...signers,
            ]);
        });
    }
    settleSeveralFunds(connection, settlements, transaction = new web3_js_1.Transaction()) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionSignatures = new Array();
            const ownersMap = new Map();
            const onwersCount = new Set(settlements.map((item) => item.owner)).size;
            for (const { owner, openOrders, baseWallet, quoteWallet, referrerQuoteWallet = null, } of settlements) {
                if (!openOrders.owner.equals(owner.publicKey)) {
                    throw new Error('Invalid open orders account');
                }
                if (referrerQuoteWallet && !this.supportsReferralFees) {
                    throw new Error('This program ID does not support referrerQuoteWallet');
                }
                let item = ownersMap.get(owner);
                if (!item) {
                    item = { transaction: new web3_js_1.Transaction(), signers: [] };
                    ownersMap.set(owner, item);
                }
                const targetTransaction = onwersCount == 1 ? transaction : item.transaction;
                const signers = item.signers;
                const partial = yield this.makeSettleFundsTransactionForBatch(targetTransaction, connection, openOrders, baseWallet, quoteWallet, referrerQuoteWallet);
                signers.push(...partial.signers);
            }
            const sendTransaction = (entry) => __awaiter(this, void 0, void 0, function* () {
                transactionSignatures.push(yield this._sendTransaction(connection, entry[1].transaction, [
                    entry[0],
                    ...entry[1].signers,
                ]));
            });
            yield (0, serum_helpers_1.promiseAllInBatches)(sendTransaction, Array.from(ownersMap.entries()));
            return transactionSignatures;
        });
    }
    makeSettleFundsTransaction(connection, openOrders, baseWallet, quoteWallet, referrerQuoteWallet = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const vaultSigner = yield web3_js_1.PublicKey.createProgramAddress([
                this.address.toBuffer(),
                this._decoded.vaultSignerNonce.toArrayLike(buffer_1.Buffer, 'le', 8),
            ], this._programId);
            const transaction = new web3_js_1.Transaction();
            const signers = [];
            let wrappedSolAccount = null;
            if ((this.baseMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) &&
                baseWallet.equals(openOrders.owner)) ||
                (this.quoteMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) &&
                    quoteWallet.equals(openOrders.owner))) {
                wrappedSolAccount = new web3_js_1.Account();
                transaction.add(web3_js_1.SystemProgram.createAccount({
                    fromPubkey: openOrders.owner,
                    newAccountPubkey: wrappedSolAccount.publicKey,
                    lamports: yield connection.getMinimumBalanceForRentExemption(165),
                    space: 165,
                    programId: token_instructions_1.TOKEN_PROGRAM_ID,
                }));
                transaction.add((0, token_instructions_1.initializeAccount)({
                    account: wrappedSolAccount.publicKey,
                    mint: token_instructions_1.WRAPPED_SOL_MINT,
                    owner: openOrders.owner,
                }));
                signers.push(wrappedSolAccount);
            }
            transaction.add(instructions_1.DexInstructions.settleFunds({
                market: this.address,
                openOrders: openOrders.address,
                owner: openOrders.owner,
                baseVault: this._decoded.baseVault,
                quoteVault: this._decoded.quoteVault,
                baseWallet: baseWallet.equals(openOrders.owner) && wrappedSolAccount
                    ? wrappedSolAccount.publicKey
                    : baseWallet,
                quoteWallet: quoteWallet.equals(openOrders.owner) && wrappedSolAccount
                    ? wrappedSolAccount.publicKey
                    : quoteWallet,
                vaultSigner,
                programId: this._programId,
                referrerQuoteWallet,
            }));
            if (wrappedSolAccount) {
                transaction.add((0, token_instructions_1.closeAccount)({
                    source: wrappedSolAccount.publicKey,
                    destination: openOrders.owner,
                    owner: openOrders.owner,
                }));
            }
            return { transaction, signers, payer: openOrders.owner };
        });
    }
    makeSettleFundsTransactionForBatch(transaction, connection, openOrders, baseWallet, quoteWallet, referrerQuoteWallet = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const vaultSigner = yield web3_js_1.PublicKey.createProgramAddress([
                this.address.toBuffer(),
                this._decoded.vaultSignerNonce.toArrayLike(buffer_1.Buffer, 'le', 8),
            ], this._programId);
            const signers = [];
            let wrappedSolAccount = null;
            if ((this.baseMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) &&
                baseWallet.equals(openOrders.owner)) ||
                (this.quoteMintAddress.equals(token_instructions_1.WRAPPED_SOL_MINT) &&
                    quoteWallet.equals(openOrders.owner))) {
                wrappedSolAccount = new web3_js_1.Account();
                transaction.add(web3_js_1.SystemProgram.createAccount({
                    fromPubkey: openOrders.owner,
                    newAccountPubkey: wrappedSolAccount.publicKey,
                    lamports: yield connection.getMinimumBalanceForRentExemption(165),
                    space: 165,
                    programId: token_instructions_1.TOKEN_PROGRAM_ID,
                }));
                transaction.add((0, token_instructions_1.initializeAccount)({
                    account: wrappedSolAccount.publicKey,
                    mint: token_instructions_1.WRAPPED_SOL_MINT,
                    owner: openOrders.owner,
                }));
                signers.push(wrappedSolAccount);
            }
            transaction.add(instructions_1.DexInstructions.settleFunds({
                market: this.address,
                openOrders: openOrders.address,
                owner: openOrders.owner,
                baseVault: this._decoded.baseVault,
                quoteVault: this._decoded.quoteVault,
                baseWallet: baseWallet.equals(openOrders.owner) && wrappedSolAccount
                    ? wrappedSolAccount.publicKey
                    : baseWallet,
                quoteWallet: quoteWallet.equals(openOrders.owner) && wrappedSolAccount
                    ? wrappedSolAccount.publicKey
                    : quoteWallet,
                vaultSigner,
                programId: this._programId,
                referrerQuoteWallet,
            }));
            if (wrappedSolAccount) {
                transaction.add((0, token_instructions_1.closeAccount)({
                    source: wrappedSolAccount.publicKey,
                    destination: openOrders.owner,
                    owner: openOrders.owner,
                }));
            }
            return { transaction, signers, payer: openOrders.owner };
        });
    }
    matchOrders(connection, feePayer, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = this.makeMatchOrdersTransaction(limit);
            return yield this._sendTransaction(connection, tx, [feePayer]);
        });
    }
    makeMatchOrdersTransaction(limit) {
        const tx = new web3_js_1.Transaction();
        tx.add(instructions_1.DexInstructions.matchOrders({
            market: this.address,
            requestQueue: this._decoded.requestQueue,
            eventQueue: this._decoded.eventQueue,
            bids: this._decoded.bids,
            asks: this._decoded.asks,
            baseVault: this._decoded.baseVault,
            quoteVault: this._decoded.quoteVault,
            limit,
            programId: this._programId,
        }));
        return tx;
    }
    loadRequestQueue(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.requestQueue));
            return (0, queue_1.decodeRequestQueue)(data);
        });
    }
    loadEventQueue(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.eventQueue));
            return (0, queue_1.decodeEventQueue)(data);
        });
    }
    loadFills(connection, limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.eventQueue));
            const events = (0, queue_1.decodeEventQueue)(data, limit);
            return events
                .filter((event) => event.eventFlags.fill && event.nativeQuantityPaid.gtn(0))
                .map(this.parseFillEvent.bind(this));
        });
    }
    parseFillEvent(event) {
        let size, price, side, priceBeforeFees;
        if (event.eventFlags.bid) {
            side = 'buy';
            priceBeforeFees = event.eventFlags.maker
                ? event.nativeQuantityPaid.add(event.nativeFeeOrRebate)
                : event.nativeQuantityPaid.sub(event.nativeFeeOrRebate);
            price = divideBnToNumber(priceBeforeFees.mul(this._baseSplTokenMultiplier), this._quoteSplTokenMultiplier.mul(event.nativeQuantityReleased));
            size = divideBnToNumber(event.nativeQuantityReleased, this._baseSplTokenMultiplier);
        }
        else {
            side = 'sell';
            priceBeforeFees = event.eventFlags.maker
                ? event.nativeQuantityReleased.sub(event.nativeFeeOrRebate)
                : event.nativeQuantityReleased.add(event.nativeFeeOrRebate);
            price = divideBnToNumber(priceBeforeFees.mul(this._baseSplTokenMultiplier), this._quoteSplTokenMultiplier.mul(event.nativeQuantityPaid));
            size = divideBnToNumber(event.nativeQuantityPaid, this._baseSplTokenMultiplier);
        }
        return Object.assign(Object.assign({}, event), { side,
            price, feeCost: this.quoteSplSizeToNumber(event.nativeFeeOrRebate) *
                (event.eventFlags.maker ? -1 : 1), size });
    }
    get _baseSplTokenMultiplier() {
        return new bn_js_1.default(10).pow(new bn_js_1.default(this._baseSplTokenDecimals));
    }
    get _quoteSplTokenMultiplier() {
        return new bn_js_1.default(10).pow(new bn_js_1.default(this._quoteSplTokenDecimals));
    }
    priceLotsToNumber(price) {
        return divideBnToNumber(price.mul(this._decoded.quoteLotSize).mul(this._baseSplTokenMultiplier), this._decoded.baseLotSize.mul(this._quoteSplTokenMultiplier));
    }
    priceNumberToLots(price) {
        return new bn_js_1.default(Math.round((price *
            Math.pow(10, this._quoteSplTokenDecimals) *
            this._decoded.baseLotSize.toNumber()) /
            (Math.pow(10, this._baseSplTokenDecimals) *
                this._decoded.quoteLotSize.toNumber())));
    }
    baseSplSizeToNumber(size) {
        return divideBnToNumber(size, this._baseSplTokenMultiplier);
    }
    quoteSplSizeToNumber(size) {
        return divideBnToNumber(size, this._quoteSplTokenMultiplier);
    }
    baseSizeLotsToNumber(size) {
        return divideBnToNumber(size.mul(this._decoded.baseLotSize), this._baseSplTokenMultiplier);
    }
    baseSizeNumberToLots(size) {
        const native = new bn_js_1.default(Math.round(size * Math.pow(10, this._baseSplTokenDecimals)));
        return native.div(this._decoded.baseLotSize);
    }
    quoteSizeLotsToNumber(size) {
        return divideBnToNumber(size.mul(this._decoded.quoteLotSize), this._quoteSplTokenMultiplier);
    }
    quoteSizeNumberToLots(size) {
        const native = new bn_js_1.default(Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)));
        return native.div(this._decoded.quoteLotSize);
    }
    get minOrderSize() {
        return this.baseSizeLotsToNumber(new bn_js_1.default(1));
    }
    get tickSize() {
        return this.priceLotsToNumber(new bn_js_1.default(1));
    }
}
exports.Market = Market;
function divideBnToNumber(numerator, denominator) {
    const quotient = numerator.div(denominator).toNumber();
    const rem = numerator.umod(denominator);
    const gcd = rem.gcd(denominator);
    return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}
function throwIfNull(value, message = 'account not found') {
    if (value === null) {
        throw new Error(message);
    }
    return value;
}
//# sourceMappingURL=market.js.map