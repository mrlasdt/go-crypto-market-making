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
const ethers_1 = require("ethers");
const harmony_1 = require("../../../src/chains/harmony/harmony");
const patch_1 = require("../../services/patch");
const ethereum_controllers_1 = require("../../../src/chains/ethereum/ethereum.controllers");
const error_handler_1 = require("../../../src/services/error-handler");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
jest.useFakeTimers();
let harmony;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    harmony = harmony_1.Harmony.getInstance('testnet');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
    yield harmony.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(harmony.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield harmony.close();
}));
const zeroAddress = '0000000000000000000000000000000000000000000000000000000000000000';
describe('nonce', () => {
    it('return a nonce for a wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(harmony.nonceManager, 'getNonce', () => 2);
        const n = yield (0, ethereum_controllers_1.nonce)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
        });
        expect(n).toEqual({ nonce: 2 });
    }));
});
const wone = {
    chainId: 1666700000,
    name: '"Wrapped ONE',
    symbol: 'WONE',
    address: '0x7a2afac38517d512E55C0bCe3b6805c10a04D60F',
    decimals: 18,
};
describe('getTokenSymbolsToTokens', () => {
    it('return tokens for strings', () => {
        (0, patch_1.patch)(harmony, 'getTokenBySymbol', () => {
            return wone;
        });
        expect((0, ethereum_controllers_1.getTokenSymbolsToTokens)(harmony, ['WONE'])).toEqual({ WONE: wone });
    });
});
const sushiswap = '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506';
describe('allowances', () => {
    it('return allowances for an owner, spender and tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(harmony, 'getTokenBySymbol', () => {
            return wone;
        });
        (0, patch_1.patch)(harmony, 'getSpender', () => {
            return sushiswap;
        });
        (0, patch_1.patch)(harmony, 'getERC20Allowance', () => {
            return {
                value: ethers_1.BigNumber.from('999999999999999999999999'),
                decimals: 2,
            };
        });
        const result = yield (0, ethereum_controllers_1.allowances)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
            spender: sushiswap,
            tokenSymbols: ['WONE'],
        });
        expect(result.approvals).toEqual({
            WONE: '9999999999999999999999.99',
        });
    }));
});
describe('approve', () => {
    it('approve a spender for an owner, token and amount', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getSpender', () => {
            return sushiswap;
        });
        harmony.getContract = jest.fn().mockReturnValue({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        });
        (0, patch_1.patch)(harmony, 'ready', () => true);
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(harmony, 'getTokenBySymbol', () => {
            return wone;
        });
        (0, patch_1.patch)(harmony, 'approveERC20', () => {
            return {
                spender: sushiswap,
                value: { toString: () => '9999999' },
            };
        });
        const result = yield (0, ethereum_controllers_1.approve)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
            spender: sushiswap,
            token: 'WONE',
        });
        expect(result.spender).toEqual(sushiswap);
    }));
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getSpender', () => {
            return sushiswap;
        });
        const err = 'wallet does not exist';
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.approve)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
            spender: sushiswap,
            token: 'WONE',
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
    it('fail if token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(harmony, 'getSpender', () => {
            return sushiswap;
        });
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(harmony, 'getTokenBySymbol', () => {
            return null;
        });
        yield expect((0, ethereum_controllers_1.approve)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
            spender: sushiswap,
            token: 'WONE',
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + 'WONE', error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE));
    }));
});
describe('balances', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.balances)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            address: zeroAddress,
            tokenSymbols: ['WONE', 'WBTC'],
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
});
describe('cancel', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(harmony, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.cancel)(harmony, {
            chain: 'harmony',
            network: 'testnet',
            nonce: 123,
            address: zeroAddress,
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
});
describe('willTxSucceed', () => {
    it('time limit met and gas price higher than that of the tx', () => {
        expect((0, ethereum_controllers_1.willTxSucceed)(100, 10, 10, 100)).toEqual(false);
    });
    it('time limit met but gas price has not exceeded that of the tx', () => {
        expect((0, ethereum_controllers_1.willTxSucceed)(100, 10, 100, 90)).toEqual(true);
    });
    it('time limit not met', () => {
        expect((0, ethereum_controllers_1.willTxSucceed)(10, 100, 100, 90)).toEqual(true);
    });
});
//# sourceMappingURL=harmony.controllers.test.js.map