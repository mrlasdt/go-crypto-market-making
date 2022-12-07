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
exports.EthereumBase = void 0;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const paths_1 = require("../paths");
const base_1 = require("./base");
const evm_nonce_1 = require("./evm.nonce");
const node_cache_1 = __importDefault(require("node-cache"));
const evm_tx_storage_1 = require("./evm.tx-storage");
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_manager_cert_passphrase_1 = require("./config-manager-cert-passphrase");
const logger_1 = require("./logger");
const refcounting_closeable_1 = require("./refcounting-closeable");
class EthereumBase {
    constructor(chainName, chainId, rpcUrl, tokenListSource, tokenListType, gasPriceConstant, gasLimitTransaction, nonceDbPath, transactionDbPath) {
        this.tokenList = [];
        this._tokenMap = {};
        this._ready = false;
        this._initializing = false;
        this._provider = new ethers_1.providers.StaticJsonRpcProvider(rpcUrl);
        this.chainName = chainName;
        this.chainId = chainId;
        this.rpcUrl = rpcUrl;
        this.gasPriceConstant = gasPriceConstant;
        this.tokenListSource = tokenListSource;
        this.tokenListType = tokenListType;
        this._refCountingHandle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
        this._nonceManager = new evm_nonce_1.EVMNonceManager(chainName, chainId, this.resolveDBPath(nonceDbPath));
        this._nonceManager.declareOwnership(this._refCountingHandle);
        this.cache = new node_cache_1.default({ stdTTL: 3600 });
        this._gasLimitTransaction = gasLimitTransaction;
        this._txStorage = evm_tx_storage_1.EvmTxStorage.getInstance(this.resolveDBPath(transactionDbPath), this._refCountingHandle);
        this._txStorage.declareOwnership(this._refCountingHandle);
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
    events() {
        this._provider._events.map(function (event) {
            return [event.tag];
        });
    }
    onNewBlock(func) {
        this._provider.on('block', func);
    }
    onDebugMessage(func) {
        this._provider.on('debug', func);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready() && !this._initializing) {
                this._initializing = true;
                yield this._nonceManager.init(this.provider);
                yield this.loadTokens(this.tokenListSource, this.tokenListType);
                this._ready = true;
                this._initializing = false;
            }
            return;
        });
    }
    loadTokens(tokenListSource, tokenListType) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tokenList = yield this.getTokenList(tokenListSource, tokenListType);
            this.tokenList = this.tokenList.filter((token) => token.chainId === this.chainId);
            if (this.tokenList) {
                this.tokenList.forEach((token) => (this._tokenMap[token.symbol] = token));
            }
        });
    }
    getTokenList(tokenListSource, tokenListType) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens;
            if (tokenListType === 'URL') {
                ({
                    data: { tokens },
                } = yield axios_1.default.get(tokenListSource));
            }
            else {
                ({ tokens } = JSON.parse(yield fs_1.promises.readFile(tokenListSource, 'utf8')));
            }
            return tokens;
        });
    }
    get nonceManager() {
        return this._nonceManager;
    }
    get txStorage() {
        return this._txStorage;
    }
    get storedTokenList() {
        return Object.values(this._tokenMap);
    }
    getTokenForSymbol(symbol) {
        return this._tokenMap[symbol] ? this._tokenMap[symbol] : null;
    }
    getWalletFromPrivateKey(privateKey) {
        return new ethers_1.Wallet(privateKey, this._provider);
    }
    getWallet(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${base_1.walletPath}/${this.chainName}`;
            const encryptedPrivateKey = yield fs_extra_1.default.readFile(`${path}/${address}.json`, 'utf8');
            const passphrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
            if (!passphrase) {
                throw new Error('missing passphrase');
            }
            return yield this.decrypt(encryptedPrivateKey, passphrase);
        });
    }
    encrypt(privateKey, password) {
        const wallet = this.getWalletFromPrivateKey(privateKey);
        return wallet.encrypt(password);
    }
    decrypt(encryptedPrivateKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield ethers_1.Wallet.fromEncryptedJson(encryptedPrivateKey, password);
            return wallet.connect(this._provider);
        });
    }
    getNativeBalance(wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield wallet.getBalance();
            return { value: balance, decimals: 18 };
        });
    }
    getERC20Balance(contract, wallet, decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Requesting balance for owner ' + wallet.address + '.');
            const balance = yield contract.balanceOf(wallet.address);
            logger_1.logger.info(`Raw balance of ${contract.address} for ` +
                `${wallet.address}: ${balance.toString()}`);
            return { value: balance, decimals: decimals };
        });
    }
    getERC20Allowance(contract, wallet, spender, decimals) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Requesting spender ' +
                spender +
                ' allowance for owner ' +
                wallet.address +
                '.');
            const allowance = yield contract.allowance(wallet.address, spender);
            logger_1.logger.info(allowance);
            return { value: allowance, decimals: decimals };
        });
    }
    getTransaction(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._provider.getTransaction(txHash);
        });
    }
    cacheTransactionReceipt(tx) {
        this.cache.set(tx.transactionHash, tx);
    }
    getTransactionReceipt(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache.keys().includes(txHash)) {
                return this.cache.get(txHash);
            }
            else {
                const fetchedTxReceipt = yield this._provider.getTransactionReceipt(txHash);
                this.cache.set(txHash, fetchedTxReceipt);
                if (!fetchedTxReceipt) {
                    this._provider.once(txHash, this.cacheTransactionReceipt.bind(this));
                }
                return fetchedTxReceipt;
            }
        });
    }
    approveERC20(contract, wallet, spender, amount, nonce, maxFeePerGas, maxPriorityFeePerGas, gasPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Calling approve method called for spender ' +
                spender +
                ' requesting allowance ' +
                amount.toString() +
                ' from owner ' +
                wallet.address +
                '.');
            return this.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                const params = {
                    gasLimit: this._gasLimitTransaction,
                    nonce: nextNonce,
                };
                if (maxFeePerGas || maxPriorityFeePerGas) {
                    params.maxFeePerGas = maxFeePerGas;
                    params.maxPriorityFeePerGas = maxPriorityFeePerGas;
                }
                else if (gasPrice) {
                    params.gasPrice = (gasPrice * 1e9).toFixed(0);
                }
                return contract.approve(spender, amount, params);
            }));
        });
    }
    getTokenBySymbol(tokenSymbol) {
        return this.tokenList.find((token) => token.symbol.toUpperCase() === tokenSymbol.toUpperCase() &&
            token.chainId === this.chainId);
    }
    getCurrentBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._provider.getBlockNumber();
        });
    }
    cancelTxWithGasPrice(wallet, nonce, gasPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.nonceManager.provideNonce(nonce, wallet.address, (nextNonce) => __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: wallet.address,
                    to: wallet.address,
                    value: ethers_1.utils.parseEther('0'),
                    nonce: nextNonce,
                    gasPrice: (gasPrice * 1e9).toFixed(0),
                };
                const response = yield wallet.sendTransaction(tx);
                logger_1.logger.info(response);
                return response;
            }));
        });
    }
    getGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                yield this.init();
            }
            const feeData = yield this._provider.getFeeData();
            if (feeData.gasPrice !== null && feeData.maxPriorityFeePerGas !== null) {
                return (feeData.gasPrice.add(feeData.maxPriorityFeePerGas).toNumber() * 1e-9);
            }
            else {
                return null;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._nonceManager.close(this._refCountingHandle);
            yield this._txStorage.close(this._refCountingHandle);
        });
    }
}
exports.EthereumBase = EthereumBase;
//# sourceMappingURL=ethereum-base.js.map