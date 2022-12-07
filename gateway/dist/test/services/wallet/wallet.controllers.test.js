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
Object.defineProperty(exports, "__esModule", { value: true });
const patch_1 = require("../patch");
const ethereum_1 = require("../../../src/chains/ethereum/ethereum");
const avalanche_1 = require("../../../src/chains/avalanche/avalanche");
const harmony_1 = require("../../../src/chains/harmony/harmony");
const wallet_controllers_1 = require("../../../src/services/wallet/wallet.controllers");
const error_handler_1 = require("../../../src/services/error-handler");
const config_manager_cert_passphrase_1 = require("../../../src/services/config-manager-cert-passphrase");
const binance_smart_chain_1 = require("../../../src/chains/binance-smart-chain/binance-smart-chain");
const cronos_1 = require("../../../src/chains/cronos/cronos");
const near_1 = require("../../../src/chains/near/near");
let avalanche;
let cronos;
let eth;
let harmony;
let bsc;
let near;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, patch_1.patch)(config_manager_cert_passphrase_1.ConfigManagerCertPassphrase, 'readPassphrase', () => 'a');
    avalanche = avalanche_1.Avalanche.getInstance('fuji');
    eth = ethereum_1.Ethereum.getInstance('kovan');
    harmony = harmony_1.Harmony.getInstance('testnet');
    bsc = binance_smart_chain_1.BinanceSmartChain.getInstance('testnet');
    cronos = cronos_1.Cronos.getInstance('testnet');
    near = near_1.Near.getInstance('testnet');
}));
beforeEach(() => (0, patch_1.patch)(config_manager_cert_passphrase_1.ConfigManagerCertPassphrase, 'readPassphrase', () => 'a'));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield avalanche.close();
    yield eth.close();
    yield harmony.close();
    yield bsc.close();
    yield cronos.close();
    yield near.close();
}));
afterEach(() => (0, patch_1.unpatch)());
const oneAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
const onePrivateKey = '0000000000000000000000000000000000000000000000000000000000000001';
const encodedPrivateKey = {
    address: '7e5f4552091a69125d5dfcb7b8c2659029395bdf',
    id: '7bb58a6c-06d3-4ede-af06-5f4a5cb87f0b',
    version: 3,
    Crypto: {
        cipher: 'aes-128-ctr',
        cipherparams: { iv: '60276d7bf5fa57ce0ae8e65fc578c3ac' },
        ciphertext: 'be98ee3d44744e1417531b15a7b1e47b945cfc100d3ff2680f757a824840fb67',
        kdf: 'scrypt',
        kdfparams: {
            salt: '90b7e0017b4f9df67aa5f2de73495c14de086b8abb5b68ce3329596eb14f991c',
            n: 131072,
            dklen: 32,
            p: 1,
            r: 8,
        },
        mac: '0cea1492f67ed43234b69100d873e17b4a289dd508cf5e866a3b18599ff0a5fc',
    },
};
describe('addWallet and getWallets', () => {
    it('add an Ethereum wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(eth, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'ethereum',
            network: 'kovan',
        });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'ethereum')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).toContain(oneAddress);
    }));
    it('add an Avalanche wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(avalanche, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(avalanche, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'avalanche',
            network: 'fuji',
        });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'avalanche')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).toContain(oneAddress);
    }));
    it('add an Harmony wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'harmony',
            network: 'testnet',
        });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'harmony')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).toContain(oneAddress);
    }));
    it('add a Binance Smart Chain wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(bsc, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(bsc, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'binance-smart-chain',
            network: 'testnet',
        });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'binance-smart-chain')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).toContain(oneAddress);
    }));
    it('add a Cronos wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(cronos, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(cronos, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'cronos',
            network: 'testnet',
        });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'cronos')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).toContain(oneAddress);
    }));
    it('fail to add a wallet to unknown chain', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'shibainu',
            network: 'doge',
        })).rejects.toThrow(new error_handler_1.HttpException(500, (0, error_handler_1.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE)('shibainu'), error_handler_1.UNKNOWN_CHAIN_ERROR_CODE));
    }));
    it('fail to add a wallet if account is not specified when adding near wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'near',
            network: 'testnet',
        })).rejects.toThrow(new error_handler_1.HttpException(500, (0, error_handler_1.ACCOUNT_NOT_SPECIFIED_ERROR_MESSAGE)(), error_handler_1.ACCOUNT_NOT_SPECIFIED_CODE));
    }));
});
describe('addWallet and removeWallets', () => {
    it('remove an Ethereum wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(eth, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        (0, patch_1.patch)(eth, 'getWalletFromPrivateKey', () => {
            return {
                address: oneAddress,
            };
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'ethereum',
            network: 'kovan',
        });
        yield (0, wallet_controllers_1.removeWallet)({ chain: 'ethereum', address: oneAddress });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'ethereum')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).not.toContain(oneAddress);
    }));
    it('remove an Harmony wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: oneAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, wallet_controllers_1.addWallet)({
            privateKey: onePrivateKey,
            chain: 'harmony',
            network: 'testnet',
        });
        yield (0, wallet_controllers_1.removeWallet)({ chain: 'harmony', address: oneAddress });
        const wallets = yield (0, wallet_controllers_1.getWallets)();
        const addresses = wallets
            .filter((wallet) => wallet.chain === 'harmony')
            .map((wallet) => wallet.walletAddresses);
        expect(addresses[0]).not.toContain(oneAddress);
    }));
});
//# sourceMappingURL=wallet.controllers.test.js.map