"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solanaish = exports.Solana = void 0;
const spl_token_1 = require("@solana/spl-token");
const spl_token_registry_1 = require("@solana/spl-token-registry");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const ethers_1 = require("ethers");
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_cache_1 = __importDefault(require("node-cache"));
const node_ts_cache_1 = require("node-ts-cache");
const node_ts_cache_storage_memory_1 = require("node-ts-cache-storage-memory");
const serum_helpers_1 = require("../../connectors/serum/serum.helpers");
const base_1 = require("../../services/base");
const config_manager_cert_passphrase_1 = require("../../services/config-manager-cert-passphrase");
const logger_1 = require("../../services/logger");
const solana_config_1 = require("./solana.config");
const solana_requests_1 = require("./solana.requests");
const crypto = require('crypto').webcrypto;
const caches = {
    instances: new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage()),
};
class Solana {
    constructor(network) {
        this.tokenList = [];
        this._tokenMap = {};
        this._tokenAddressMap = {};
        this._keypairs = {};
        this._ready = false;
        this.initializing = false;
        this._network = network;
        const config = (0, solana_config_1.getSolanaConfig)('solana', network);
        this.rpcUrl = config.network.nodeUrl;
        this._connection = new web3_js_1.Connection(this.rpcUrl, 'processed');
        this.cache = new node_cache_1.default({ stdTTL: 3600 });
        this._nativeTokenSymbol = 'SOL';
        this._tokenProgramAddress = new web3_js_1.PublicKey(config.tokenProgram);
        this.transactionLamports = config.transactionLamports;
        this._lamportPrice = config.lamportsToSol;
        this._lamportDecimals = (0, base_1.countDecimals)(this._lamportPrice);
        this._requestCount = 0;
        this._metricsLogInterval = 300000;
        this.onDebugMessage('all', this.requestCounter.bind(this));
        setInterval(this.metricLogger.bind(this), this.metricsLogInterval);
    }
    get gasPrice() {
        return this._lamportPrice;
    }
    static getInstance(network) {
        if (Solana._instances === undefined) {
            Solana._instances = {};
        }
        if (!(network in Solana._instances)) {
            Solana._instances[network] = new Solana(network);
        }
        return Solana._instances[network];
    }
    static getConnectedInstances() {
        return this._instances;
    }
    get connection() {
        return this._connection;
    }
    onNewSlot(func) {
        this._connection.onSlotUpdate(func);
    }
    onDebugMessage(filter, func) {
        this._connection.onLogs(filter, func);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready() && !this.initializing) {
                this.initializing = true;
                yield this.loadTokens();
                this._ready = true;
                this.initializing = false;
            }
        });
    }
    ready() {
        return this._ready;
    }
    loadTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tokenList = yield this.getTokenList();
            this.tokenList.forEach((token) => {
                this._tokenMap[token.symbol] = token;
                this._tokenAddressMap[token.address] = token;
            });
        });
    }
    getTokenList() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenListProvider = new spl_token_registry_1.TokenListProvider();
            const tokens = yield (0, serum_helpers_1.runWithRetryAndTimeout)(tokenListProvider, tokenListProvider.resolve, []);
            return tokens.filterByClusterSlug(this._network).getList();
        });
    }
    get lamportPrice() {
        return this._lamportPrice;
    }
    get storedTokenList() {
        return Object.values(this._tokenMap);
    }
    getTokenForSymbol(symbol) {
        var _a;
        return (_a = this._tokenMap[symbol]) !== null && _a !== void 0 ? _a : null;
    }
    getTokenForMintAddress(mintAddress) {
        return this._tokenAddressMap[mintAddress.toString()]
            ? this._tokenAddressMap[mintAddress.toString()]
            : null;
    }
    getKeypairFromPrivateKey(privateKey) {
        const decoded = bs58_1.default.decode(privateKey);
        return web3_js_1.Keypair.fromSecretKey(decoded);
    }
    getAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const keypair = yield this.getKeypair(address);
            return new web3_js_1.Account(keypair.secretKey);
        });
    }
    findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenProgramId = this._tokenProgramAddress;
            const splAssociatedTokenAccountProgramId = (yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getParsedTokenAccountsByOwner, [
                walletAddress,
                {
                    programId: this._tokenProgramAddress,
                },
            ])).value.map((item) => item.pubkey)[0];
            const programAddress = (yield (0, serum_helpers_1.runWithRetryAndTimeout)(web3_js_1.PublicKey, web3_js_1.PublicKey.findProgramAddress, [
                [
                    walletAddress.toBuffer(),
                    tokenProgramId.toBuffer(),
                    tokenMintAddress.toBuffer(),
                ],
                splAssociatedTokenAccountProgramId,
            ]))[0];
            return programAddress;
        });
    }
    getKeypair(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._keypairs[address]) {
                const path = `${base_1.walletPath}/solana`;
                const encryptedPrivateKey = JSON.parse(yield fs_extra_1.default.readFile(`${path}/${address}.json`, 'utf8'), (key, value) => {
                    switch (key) {
                        case 'ciphertext':
                        case 'salt':
                        case 'iv':
                            return bs58_1.default.decode(value);
                        default:
                            return value;
                    }
                });
                const passphrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
                if (!passphrase) {
                    throw new Error('missing passphrase');
                }
                this._keypairs[address] = yield this.decrypt(encryptedPrivateKey, passphrase);
            }
            return this._keypairs[address];
        });
    }
    static getKeyMaterial(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const enc = new TextEncoder();
            return yield crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
        });
    }
    static getKey(keyAlgorithm, keyMaterial) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield crypto.subtle.deriveKey(keyAlgorithm, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        });
    }
    encrypt(privateKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const iv = crypto.getRandomValues(new Uint8Array(16));
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const keyMaterial = yield Solana.getKeyMaterial(password);
            const keyAlgorithm = {
                name: 'PBKDF2',
                salt: salt,
                iterations: 500000,
                hash: 'SHA-256',
            };
            const key = yield Solana.getKey(keyAlgorithm, keyMaterial);
            const cipherAlgorithm = {
                name: 'AES-GCM',
                iv: iv,
            };
            const enc = new TextEncoder();
            const ciphertext = (yield crypto.subtle.encrypt(cipherAlgorithm, key, enc.encode(privateKey)));
            return JSON.stringify({
                keyAlgorithm,
                cipherAlgorithm,
                ciphertext: new Uint8Array(ciphertext),
            }, (key, value) => {
                switch (key) {
                    case 'ciphertext':
                    case 'salt':
                    case 'iv':
                        return bs58_1.default.encode(Uint8Array.from(Object.values(value)));
                    default:
                        return value;
                }
            });
        });
    }
    decrypt(encryptedPrivateKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyMaterial = yield Solana.getKeyMaterial(password);
            const key = yield Solana.getKey(encryptedPrivateKey.keyAlgorithm, keyMaterial);
            const decrypted = yield crypto.subtle.decrypt(encryptedPrivateKey.cipherAlgorithm, key, encryptedPrivateKey.ciphertext);
            const dec = new TextDecoder();
            dec.decode(decrypted);
            return web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(dec.decode(decrypted)));
        });
    }
    getBalances(wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = {};
            balances['SOL'] = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this, this.getSolBalance, [
                wallet,
            ]);
            const allSplTokens = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getParsedTokenAccountsByOwner, [wallet.publicKey, { programId: this._tokenProgramAddress }]);
            allSplTokens.value.forEach((tokenAccount) => {
                var _a;
                const tokenInfo = tokenAccount.account.data.parsed['info'];
                const symbol = (_a = this.getTokenForMintAddress(tokenInfo['mint'])) === null || _a === void 0 ? void 0 : _a.symbol;
                if (symbol != null && symbol.toUpperCase() !== 'SOL')
                    balances[symbol.toUpperCase()] = this.tokenResponseToTokenValue(tokenInfo['tokenAmount']);
            });
            return balances;
        });
    }
    getSolBalance(wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const lamports = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getBalance, [wallet.publicKey]);
            return { value: ethers_1.BigNumber.from(lamports), decimals: this._lamportDecimals };
        });
    }
    tokenResponseToTokenValue(account) {
        return {
            value: ethers_1.BigNumber.from(account.amount),
            decimals: account.decimals,
        };
    }
    getSplBalance(walletAddress, mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getParsedTokenAccountsByOwner, [walletAddress, { mint: mintAddress }]);
            if (response['value'].length == 0) {
                throw new Error(`Token account not initialized`);
            }
            return this.tokenResponseToTokenValue(response.value[0].account.data.parsed['info']['tokenAmount']);
        });
    }
    isTokenAccountInitialized(walletAddress, mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getParsedTokenAccountsByOwner, [walletAddress, { programId: this._tokenProgramAddress }]);
            for (const accountInfo of response.value) {
                if (accountInfo.account.data.parsed['info']['mint'] ==
                    mintAddress.toBase58())
                    return true;
            }
            return false;
        });
    }
    getTokenAccount(walletAddress, mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getParsedTokenAccountsByOwner, [walletAddress, { programId: this._tokenProgramAddress }]);
            for (const accountInfo of response.value) {
                if (accountInfo.account.data.parsed['info']['mint'] ==
                    mintAddress.toBase58())
                    return accountInfo;
            }
            return null;
        });
    }
    getOrCreateAssociatedTokenAccount(wallet, tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, spl_token_1.getOrCreateAssociatedTokenAccount)(this._connection, wallet, tokenAddress, wallet.publicKey);
        });
    }
    getTransaction(payerSignature) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache.keys().includes(payerSignature)) {
                return this.cache.get(payerSignature);
            }
            else {
                const fetchedTx = (0, serum_helpers_1.runWithRetryAndTimeout)(this._connection, this._connection.getTransaction, [
                    payerSignature,
                    {
                        commitment: 'confirmed',
                    },
                ]);
                this.cache.set(payerSignature, fetchedTx);
                return fetchedTx;
            }
        });
    }
    getTransactionStatusCode(txData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let txStatus;
            if (!txData) {
                txStatus = solana_requests_1.TransactionResponseStatusCode.FAILED;
            }
            else {
                txStatus =
                    ((_a = txData.meta) === null || _a === void 0 ? void 0 : _a.err) == null
                        ? solana_requests_1.TransactionResponseStatusCode.CONFIRMED
                        : solana_requests_1.TransactionResponseStatusCode.FAILED;
            }
            return txStatus;
        });
    }
    cacheTransactionReceipt(tx) {
        this.cache.set(tx.transaction.signatures[0], tx);
    }
    getTokenBySymbol(tokenSymbol) {
        return this.tokenList.find((token) => token.symbol.toUpperCase() === tokenSymbol.toUpperCase());
    }
    getCurrentSlotNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(this._connection, this._connection.getSlot, []);
        });
    }
    requestCounter(msg) {
        if (msg.action === 'request')
            this._requestCount += 1;
    }
    metricLogger() {
        logger_1.logger.info(this.requestCount +
            ' request(s) sent in last ' +
            this.metricsLogInterval / 1000 +
            ' seconds.');
        this._requestCount = 0;
    }
    get network() {
        return this._network;
    }
    get nativeTokenSymbol() {
        return this._nativeTokenSymbol;
    }
    get requestCount() {
        return this._requestCount;
    }
    get metricsLogInterval() {
        return this._metricsLogInterval;
    }
    getCurrentBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, serum_helpers_1.runWithRetryAndTimeout)(this.connection, this.connection.getSlot, ['processed']);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._network in Solana._instances) {
                delete Solana._instances[this._network];
            }
        });
    }
}
__decorate([
    (0, node_ts_cache_1.Cache)(caches.instances, { isCachedForever: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Solana)
], Solana, "getInstance", null);
exports.Solana = Solana;
exports.Solanaish = Solana;
//# sourceMappingURL=solana.js.map