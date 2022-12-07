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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../../src/app");
const patch_1 = require("../patch");
const ethereum_1 = require("../../../src/chains/ethereum/ethereum");
const avalanche_1 = require("../../../src/chains/avalanche/avalanche");
const harmony_1 = require("../../../src/chains/harmony/harmony");
const config_manager_cert_passphrase_1 = require("../../../src/services/config-manager-cert-passphrase");
let avalanche;
let eth;
let harmony;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, patch_1.patch)(config_manager_cert_passphrase_1.ConfigManagerCertPassphrase, 'readPassphrase', () => 'a');
    avalanche = avalanche_1.Avalanche.getInstance('fuji');
    eth = ethereum_1.Ethereum.getInstance('kovan');
    harmony = harmony_1.Harmony.getInstance('testnet');
}));
beforeEach(() => (0, patch_1.patch)(config_manager_cert_passphrase_1.ConfigManagerCertPassphrase, 'readPassphrase', () => 'a'));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield avalanche.close();
    yield eth.close();
    yield harmony.close();
}));
afterEach(() => (0, patch_1.unpatch)());
const twoAddress = '0x2b5ad5c4795c026514f8317c7a215e218dccd6cf';
const twoPrivateKey = '0000000000000000000000000000000000000000000000000000000000000002';
const encodedPrivateKey = {
    address: '2b5ad5c4795c026514f8317c7a215e218dccd6cf',
    id: '116e3405-ea6c-40ba-93c0-6a835ad2ea99',
    version: 3,
    Crypto: {
        cipher: 'aes-128-ctr',
        cipherparams: { iv: 'dccf7a5f7d66bc6a61cf4fda422dcd55' },
        ciphertext: 'ce561ad92c6a507a9399f51d64951b763f01b4956f15fd298ceb7a1174d0394a',
        kdf: 'scrypt',
        kdfparams: {
            salt: 'a88d99c6d01150af02861ebb1ace3b633a33b2a20561fe188a0c260a84d1ba99',
            n: 131072,
            dklen: 32,
            p: 1,
            r: 8,
        },
        mac: '684b0111ed08611ad993c76b4524d5dcda18b26cb930251983c36f40160eba8f',
    },
};
describe('POST /wallet/add', () => {
    it('return 200 for well formed ethereum request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(eth, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'ethereum',
            network: 'kovan',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('return 200 for well formed avalanche request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(avalanche, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(avalanche, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'avalanche',
            network: 'fuji',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('return 200 for well formed harmony request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'harmony',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('return 404 for ill-formed avalanche request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(avalanche, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(avalanche, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({})
            .expect('Content-Type', /json/)
            .expect(404);
    }));
    it('return 404 for ill-formed harmony request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({})
            .expect('Content-Type', /json/)
            .expect(404);
    }));
});
describe('DELETE /wallet/remove', () => {
    it('return 200 for well formed ethereum request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(eth, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'ethereum',
            network: 'kovan',
        })
            .expect('Content-Type', /json/)
            .expect(200);
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .delete(`/wallet/remove`)
            .send({
            address: twoAddress,
            chain: 'ethereum',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('return 200 for well formed harmony request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'harmony',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200);
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .delete(`/wallet/remove`)
            .send({
            address: twoAddress,
            chain: 'harmony',
        })
            .expect('Content-Type', /json/)
            .expect(200);
    }));
    it('return 404 for ill-formed request', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.gatewayApp).delete(`/wallet/delete`).send({}).expect(404);
    }));
});
describe('GET /wallet', () => {
    it('return 200 for well formed ethereum request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(eth, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'ethereum',
            network: 'kovan',
        })
            .expect('Content-Type', /json/)
            .expect(200);
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/wallet`)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
            const wallets = res.body;
            const addresses = wallets
                .filter((wallet) => wallet.chain === 'ethereum')
                .map((wallet) => wallet.walletAddresses);
            expect(addresses[0]).toContain(twoAddress);
        });
    }));
    it('return 200 for well formed harmony request', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWalletFromPrivateKey', () => {
            return {
                address: twoAddress,
            };
        });
        (0, patch_1.patch)(harmony, 'encrypt', () => {
            return JSON.stringify(encodedPrivateKey);
        });
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .post(`/wallet/add`)
            .send({
            privateKey: twoPrivateKey,
            chain: 'harmony',
            network: 'testnet',
        })
            .expect('Content-Type', /json/)
            .expect(200);
        yield (0, supertest_1.default)(app_1.gatewayApp)
            .get(`/wallet`)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
            const wallets = res.body;
            const addresses = wallets
                .filter((wallet) => wallet.chain === 'harmony')
                .map((wallet) => wallet.walletAddresses);
            expect(addresses[0]).toContain(twoAddress);
        });
    }));
});
//# sourceMappingURL=wallet.routes.test.js.map