"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
exports.default = {
    address: new web3_js_1.PublicKey('C2gJg6tKpQs41PRS1nC8aw3ZKNZK3HQQZGVrDFDup5nx'),
    mint: new web3_js_1.PublicKey('3wyAj7Rt1TWVPZVteFJPLa26JmLvdb1CAKEFZm3NY75E'),
    owner: new web3_js_1.PublicKey('4Qkev8aNZcqFNSRhQzwyLMFSsi94jHqE8WNVTJzTP99F'),
    amount: new bn_js_1.default(1),
    delegate: new web3_js_1.PublicKey('4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T'),
    delegatedAmount: new bn_js_1.default(1),
    isInitialized: true,
    isFrozen: false,
    isNative: false,
    rentExemptReserve: null,
    closeAuthority: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
};
//# sourceMappingURL=getOrCreateAssociatedTokenAccount.js.map