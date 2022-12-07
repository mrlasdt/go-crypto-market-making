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
exports.NearBase = void 0;
const near_api_js_1 = require("near-api-js");
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const base_1 = require("../../services/base");
const node_cache_1 = __importDefault(require("node-cache"));
const evm_tx_storage_1 = require("../../services/evm.tx-storage");
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_manager_cert_passphrase_1 = require("../../services/config-manager-cert-passphrase");
const logger_1 = require("../../services/logger");
const refcounting_closeable_1 = require("../../services/refcounting-closeable");
const path_1 = __importDefault(require("path"));
const paths_1 = require("../../paths");
const ethers_1 = require("ethers");
const bn_js_1 = __importDefault(require("bn.js"));
const borsh_1 = require("borsh");
class NearBase {
    constructor(chainName, rpcUrl, network, tokenListSource, tokenListType, gasPriceConstant, gasLimitTransaction, transactionDbPath) {
        this._tokenMap = {};
        this._ready = false;
        this._initializing = false;
        this._initPromise = Promise.resolve();
        this._provider = new near_api_js_1.providers.JsonRpcProvider({ url: rpcUrl });
        this.rpcUrl = rpcUrl;
        this.chainName = chainName;
        this.network = network;
        this.gasPriceConstant = gasPriceConstant;
        this.tokenListSource = tokenListSource;
        this.tokenListType = tokenListType;
        this._refCountingHandle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
        this.cache = new node_cache_1.default({ stdTTL: 3600 });
        this._gasLimitTransaction = gasLimitTransaction;
        this._txStorage = evm_tx_storage_1.EvmTxStorage.getInstance(this.resolveDBPath(transactionDbPath), this._refCountingHandle);
        this._txStorage.declareOwnership(this._refCountingHandle);
        this._keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
    }
    ready() {
        return this._ready;
    }
    get provider() {
        return this._provider;
    }
    get gasLimitTransaction() {
        return this._gasLimitTransaction;
    }
    resolveDBPath(oldPath) {
        if (oldPath.charAt(0) === '/')
            return oldPath;
        const dbDir = path_1.default.join((0, paths_1.rootPath)(), 'db/');
        fs_extra_1.default.mkdirSync(dbDir, { recursive: true });
        return path_1.default.join(dbDir, oldPath);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready() && !this._initializing) {
                this._initializing = true;
                this._connection = yield this.connectProvider();
                this._initPromise = this.loadTokens(this.tokenListSource, this.tokenListType).then(() => {
                    this._ready = true;
                    this._initializing = false;
                });
            }
            return this._initPromise;
        });
    }
    connectProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, near_api_js_1.connect)({
                networkId: this.network,
                keyStore: this._keyStore,
                nodeUrl: this.rpcUrl,
            });
        });
    }
    loadTokens(tokenListSource, tokenListType) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenList = yield this.getTokenList(tokenListSource, tokenListType);
            if (tokenList) {
                for (const [key, value] of Object.entries(tokenList)) {
                    this._tokenMap[value.symbol] = Object.assign(Object.assign({}, value), { address: key });
                }
            }
            this.tokenList = Object.values(this._tokenMap);
        });
    }
    getTokenList(tokenListSource, tokenListType) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            if (tokenListType === 'URL') {
                ({ data } = yield axios_1.default.get(tokenListSource));
            }
            else {
                ({ data } = JSON.parse(yield fs_1.promises.readFile(tokenListSource, 'utf8')));
            }
            return data;
        });
    }
    get txStorage() {
        return this._txStorage;
    }
    get storedTokenList() {
        return this.tokenList;
    }
    getTokenForSymbol(symbol) {
        return this._tokenMap[symbol] ? this._tokenMap[symbol] : null;
    }
    getWalletFromPrivateKey(privateKey, accountId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._connection) {
                yield this.init();
            }
            const keyPair = near_api_js_1.KeyPair.fromString(privateKey);
            const accounts = yield this._keyStore.getAccounts(this.network);
            if (!accounts.includes(accountId)) {
                yield this._keyStore.setKey(this.network, accountId, keyPair);
            }
            return yield ((_a = this._connection) === null || _a === void 0 ? void 0 : _a.account(accountId));
        });
    }
    getWallet(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${base_1.walletPath}/${this.chainName}`;
            const encryptedPrivateKey = yield fs_extra_1.default.readFile(`${path}/${address}.json`, 'utf8');
            const passphrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
            if (!passphrase) {
                throw new Error('missing passphrase');
            }
            const privateKey = this.decrypt(encryptedPrivateKey, passphrase);
            return yield this.getWalletFromPrivateKey(privateKey, address);
        });
    }
    encrypt(privateKey, password) {
        const iv = (0, crypto_1.randomBytes)(16);
        const key = Buffer.alloc(32);
        key.write(password);
        const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(privateKey),
            cipher.final(),
        ]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }
    decrypt(encryptedPrivateKey, password) {
        const [iv, encryptedKey] = encryptedPrivateKey.split(':');
        const key = Buffer.alloc(32);
        key.write(password);
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, Buffer.from(iv, 'hex'));
        const decrpyted = Buffer.concat([
            decipher.update(Buffer.from(encryptedKey, 'hex')),
            decipher.final(),
        ]);
        return decrpyted.toString();
    }
    getNativeBalance(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield account.getAccountBalance()).available;
        });
    }
    getFungibleTokenBalance(contract) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Requesting balance for owner ' + contract.account.accountId + '.');
            let balance;
            try {
                balance = yield contract.ft_balance_of({
                    account_id: contract.account.accountId,
                });
            }
            catch (_e) {
                balance = '0';
            }
            logger_1.logger.info(`Raw balance of ${contract.contractId} for ` +
                `${contract.account.accountId}: ${balance}`);
            return balance;
        });
    }
    getFungibleTokenAllowance(_contract, _wallet, _spender, _decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            return { value: ethers_1.BigNumber.from('0'), decimals: 0 };
        });
    }
    getTransaction(txHash, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._provider.txStatus(txHash, accountId);
        });
    }
    approveFungibleToken(_contract, _wallet, _spender, _amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    getTokenBySymbol(tokenSymbol) {
        return this._tokenMap[tokenSymbol];
    }
    getCurrentBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this._provider.status();
            return status.sync_info.latest_block_height;
        });
    }
    cancelTx(account, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield account.connection.provider.block({
                finality: 'final',
            });
            const blockHash = block.header.hash;
            const [txHash, signedTx] = yield near_api_js_1.transactions.signTransaction(account.accountId, nonce, [near_api_js_1.transactions.transfer(new bn_js_1.default(0))], (0, borsh_1.baseDecode)(blockHash), account.connection.signer, account.accountId, account.connection.networkId);
            yield account.connection.provider.sendTransaction(signedTx);
            return txHash.toString();
        });
    }
    getGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                yield this.init();
            }
            const feeData = yield this._provider.gasPrice(null);
            if (feeData.gas_price !== null) {
                return feeData.gas_price;
            }
            else {
                return null;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._txStorage.close(this._refCountingHandle);
        });
    }
}
exports.NearBase = NearBase;
//# sourceMappingURL=near.base.js.map