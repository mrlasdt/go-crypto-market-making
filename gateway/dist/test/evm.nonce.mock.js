"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchEVMNonceManager = void 0;
const patch_1 = require("./services/patch");
const patchEVMNonceManager = (nonceManager) => {
    (0, patch_1.patch)(nonceManager, 'init', () => {
        return;
    });
    (0, patch_1.patch)(nonceManager, 'mergeNonceFromEVMNode', () => {
        return;
    });
    (0, patch_1.patch)(nonceManager, 'getNonceFromNode', (_ethAddress) => {
        return Promise.resolve(12);
    });
    (0, patch_1.patch)(nonceManager, 'getNextNonce', (_ethAddress) => {
        return Promise.resolve(13);
    });
};
exports.patchEVMNonceManager = patchEVMNonceManager;
//# sourceMappingURL=evm.nonce.mock.js.map