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
const ethereum_1 = require("../../../src/chains/ethereum/ethereum");
const patch_1 = require("../../services/patch");
const ethereum_controllers_1 = require("../../../src/chains/ethereum/ethereum.controllers");
const error_handler_1 = require("../../../src/services/error-handler");
const evm_nonce_mock_1 = require("../../evm.nonce.mock");
let eth;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    eth = ethereum_1.Ethereum.getInstance('kovan');
    (0, evm_nonce_mock_1.patchEVMNonceManager)(eth.nonceManager);
    yield eth.init();
}));
beforeEach(() => {
    (0, evm_nonce_mock_1.patchEVMNonceManager)(eth.nonceManager);
});
afterEach(() => {
    (0, patch_1.unpatch)();
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield eth.close();
}));
const zeroAddress = '0000000000000000000000000000000000000000000000000000000000000000';
describe('nonce', () => {
    it('return a nonce for a wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(eth.nonceManager, 'getNonce', () => 2);
        const n = yield (0, ethereum_controllers_1.nonce)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
        });
        expect(n).toEqual({ nonce: 2 });
    }));
    it('return next nonce for a wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(eth.nonceManager, 'getNextNonce', () => 3);
        const n = yield (0, ethereum_controllers_1.nextNonce)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
        });
        expect(n).toEqual({ nonce: 3 });
    }));
});
const weth = {
    chainId: 42,
    name: 'WETH',
    symbol: 'WETH',
    address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    decimals: 18,
};
describe('getTokenSymbolsToTokens', () => {
    it('return tokens for strings', () => {
        (0, patch_1.patch)(eth, 'getTokenBySymbol', () => {
            return weth;
        });
        expect((0, ethereum_controllers_1.getTokenSymbolsToTokens)(eth, ['WETH'])).toEqual({ WETH: weth });
    });
});
const uniswap = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
describe('allowances', () => {
    it('return allowances for an owner, spender and tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(eth, 'getTokenBySymbol', () => {
            return weth;
        });
        (0, patch_1.patch)(eth, 'getSpender', () => {
            return uniswap;
        });
        (0, patch_1.patch)(eth, 'getERC20Allowance', () => {
            return {
                value: ethers_1.BigNumber.from('999999999999999999999999'),
                decimals: 2,
            };
        });
        const result = yield (0, ethereum_controllers_1.allowances)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
            spender: uniswap,
            tokenSymbols: ['WETH'],
        });
        expect(result.approvals).toEqual({
            WETH: '9999999999999999999999.99',
        });
    }));
});
describe('approve', () => {
    it('approve a spender for an owner, token and amount', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getSpender', () => {
            return uniswap;
        });
        eth.getContract = jest.fn().mockReturnValue({
            address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
        });
        (0, patch_1.patch)(eth, 'ready', () => true);
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(eth, 'getTokenBySymbol', () => {
            return weth;
        });
        (0, patch_1.patch)(eth, 'approveERC20', () => {
            return {
                spender: uniswap,
                value: { toString: () => '9999999' },
            };
        });
        const result = yield (0, ethereum_controllers_1.approve)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
            spender: uniswap,
            token: 'WETH',
        });
        expect(result.spender).toEqual(uniswap);
    }));
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getSpender', () => {
            return uniswap;
        });
        const err = 'wallet does not exist';
        (0, patch_1.patch)(eth, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.approve)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
            spender: uniswap,
            token: 'WETH',
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
    it('fail if token not found', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, patch_1.patch)(eth, 'getSpender', () => {
            return uniswap;
        });
        (0, patch_1.patch)(eth, 'getWallet', () => {
            return {
                address: '0xFaA12FD102FE8623C9299c72B03E45107F2772B5',
            };
        });
        (0, patch_1.patch)(eth, 'getTokenBySymbol', () => {
            return null;
        });
        yield expect((0, ethereum_controllers_1.approve)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
            spender: uniswap,
            token: 'WETH',
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + 'WETH', error_handler_1.TOKEN_NOT_SUPPORTED_ERROR_CODE));
    }));
});
describe('balances', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(eth, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.balances)(eth, {
            chain: 'ethereum',
            network: 'kovan',
            address: zeroAddress,
            tokenSymbols: ['WETH', 'DAI'],
        })).rejects.toThrow(new error_handler_1.HttpException(500, error_handler_1.LOAD_WALLET_ERROR_MESSAGE + 'Error: ' + err, error_handler_1.LOAD_WALLET_ERROR_CODE));
    }));
});
describe('cancel', () => {
    it('fail if wallet not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const err = 'wallet does not exist';
        (0, patch_1.patch)(eth, 'getWallet', () => {
            throw new Error(err);
        });
        yield expect((0, ethereum_controllers_1.cancel)(eth, {
            chain: 'ethereum',
            network: 'kovan',
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
//# sourceMappingURL=ethereum.controllers.test.js.map