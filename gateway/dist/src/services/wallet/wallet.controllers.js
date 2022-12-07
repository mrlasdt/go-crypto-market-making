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
exports.getWallets = exports.getJsonFiles = exports.dropExtension = exports.getLastPath = exports.getDirectories = exports.removeWallet = exports.addWallet = exports.mkdirIfDoesNotExist = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const avalanche_1 = require("../../chains/avalanche/avalanche");
const binance_smart_chain_1 = require("../../chains/binance-smart-chain/binance-smart-chain");
const cronos_1 = require("../../chains/cronos/cronos");
const ethereum_1 = require("../../chains/ethereum/ethereum");
const polygon_1 = require("../../chains/polygon/polygon");
const solana_1 = require("../../chains/solana/solana");
const harmony_1 = require("../../chains/harmony/harmony");
const config_manager_cert_passphrase_1 = require("../config-manager-cert-passphrase");
const error_handler_1 = require("../error-handler");
const ethereum_base_1 = require("../ethereum-base");
const near_1 = require("../../chains/near/near");
const walletPath = './conf/wallets';
function mkdirIfDoesNotExist(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield fs_extra_1.default.pathExists(path);
        if (!exists) {
            yield fs_extra_1.default.mkdir(path, { recursive: true });
        }
    });
}
exports.mkdirIfDoesNotExist = mkdirIfDoesNotExist;
function addWallet(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const passphrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
        if (!passphrase) {
            throw new Error('There is no passphrase');
        }
        let connection;
        let address;
        let encryptedPrivateKey;
        if (req.chain === 'ethereum') {
            connection = ethereum_1.Ethereum.getInstance(req.network);
        }
        else if (req.chain === 'avalanche') {
            connection = avalanche_1.Avalanche.getInstance(req.network);
        }
        else if (req.chain === 'harmony') {
            connection = harmony_1.Harmony.getInstance(req.network);
        }
        else if (req.chain === 'cronos') {
            connection = cronos_1.Cronos.getInstance(req.network);
        }
        else if (req.chain === 'solana') {
            connection = solana_1.Solana.getInstance(req.network);
        }
        else if (req.chain === 'polygon') {
            connection = polygon_1.Polygon.getInstance(req.network);
        }
        else if (req.chain === 'near') {
            if (!('address' in req))
                throw new error_handler_1.HttpException(500, (0, error_handler_1.ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE)(), error_handler_1.ACCOUNT_NOT_SPECIFIED_CODE);
            connection = near_1.Near.getInstance(req.network);
        }
        else if (req.chain === 'binance-smart-chain') {
            connection = binance_smart_chain_1.BinanceSmartChain.getInstance(req.network);
        }
        else {
            throw new error_handler_1.HttpException(500, (0, error_handler_1.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE)(req.chain), error_handler_1.UNKNOWN_CHAIN_ERROR_CODE);
        }
        if (!connection.ready()) {
            yield connection.init();
        }
        try {
            if (connection instanceof solana_1.Solana) {
                address = connection
                    .getKeypairFromPrivateKey(req.privateKey)
                    .publicKey.toBase58();
                encryptedPrivateKey = yield connection.encrypt(req.privateKey, passphrase);
            }
            else if (connection instanceof ethereum_base_1.EthereumBase) {
                address = connection.getWalletFromPrivateKey(req.privateKey).address;
                encryptedPrivateKey = yield connection.encrypt(req.privateKey, passphrase);
            }
            else if (connection instanceof near_1.Near) {
                address = (yield connection.getWalletFromPrivateKey(req.privateKey, req.address)).accountId;
                encryptedPrivateKey = connection.encrypt(req.privateKey, passphrase);
            }
            if (address === undefined || encryptedPrivateKey === undefined) {
                throw new Error('ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE');
            }
        }
        catch (_e) {
            throw new error_handler_1.HttpException(500, (0, error_handler_1.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_MESSAGE)(req.privateKey), error_handler_1.ERROR_RETRIEVING_WALLET_ADDRESS_ERROR_CODE);
        }
        const path = `${walletPath}/${req.chain}`;
        yield mkdirIfDoesNotExist(path);
        yield fs_extra_1.default.writeFile(`${path}/${address}.json`, encryptedPrivateKey);
        return { address };
    });
}
exports.addWallet = addWallet;
function removeWallet(req) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.default.rm(`./conf/wallets/${req.chain}/${req.address}.json`, {
            force: true,
        });
    });
}
exports.removeWallet = removeWallet;
function getDirectories(source) {
    return __awaiter(this, void 0, void 0, function* () {
        yield mkdirIfDoesNotExist(walletPath);
        const files = yield fs_extra_1.default.readdir(source, { withFileTypes: true });
        return files
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
    });
}
exports.getDirectories = getDirectories;
function getLastPath(path) {
    return path.split('/').slice(-1)[0];
}
exports.getLastPath = getLastPath;
function dropExtension(path) {
    return path.substr(0, path.lastIndexOf('.')) || path;
}
exports.dropExtension = dropExtension;
function getJsonFiles(source) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield fs_extra_1.default.readdir(source, { withFileTypes: true });
        return files
            .filter((f) => f.isFile() && f.name.endsWith('.json'))
            .map((f) => f.name);
    });
}
exports.getJsonFiles = getJsonFiles;
function getWallets() {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = yield getDirectories(walletPath);
        const responses = [];
        for (const chain of chains) {
            const walletFiles = yield getJsonFiles(`${walletPath}/${chain}`);
            const response = { chain, walletAddresses: [] };
            for (const walletFile of walletFiles) {
                const address = dropExtension(getLastPath(walletFile));
                response.walletAddresses.push(address);
            }
            responses.push(response);
        }
        return responses;
    });
}
exports.getWallets = getWallets;
//# sourceMappingURL=wallet.controllers.js.map