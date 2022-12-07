"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
exports.default = {
    account: {
        data: {
            program: 'spl-token',
            parsed: {
                accountType: 'account',
                info: {
                    tokenAmount: {
                        amount: '1',
                        decimals: 1,
                        uiAmount: 0.1,
                        uiAmountString: '0.1',
                    },
                    delegate: new web3_js_1.PublicKey('4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T'),
                    delegatedAmount: {
                        amount: '1',
                        decimals: 1,
                        uiAmount: 0.1,
                        uiAmountString: '0.1',
                    },
                    state: 'initialized',
                    isNative: false,
                    mint: new web3_js_1.PublicKey('3wyAj7Rt1TWVPZVteFJPLa26JmLvdb1CAKEFZm3NY75E'),
                    owner: new web3_js_1.PublicKey('4Qkev8aNZcqFNSRhQzwyLMFSsi94jHqE8WNVTJzTP99F'),
                },
                type: 'account',
            },
            space: 165,
        },
        executable: false,
        lamports: 1726080,
        owner: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        rentEpoch: 4,
    },
    pubkey: new web3_js_1.PublicKey('C2gJg6tKpQs41PRS1nC8aw3ZKNZK3HQQZGVrDFDup5nx'),
};
//# sourceMappingURL=getTokenAccount.js.map