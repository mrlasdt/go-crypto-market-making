"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePolygonAllowancesRequest = exports.validatePolygonApproveRequest = exports.validateSpender = exports.invalidSpenderError = void 0;
const validators_1 = require("../../services/validators");
const ethereum_validators_1 = require("../ethereum/ethereum.validators");
exports.invalidSpenderError = 'The spender param is not a valid Polygon address (0x followed by 40 hexidecimal characters).';
exports.validateSpender = (0, validators_1.mkValidator)('spender', exports.invalidSpenderError, (val) => typeof val === 'string' &&
    (val === 'uniswap' ||
        val === 'uniswapLP' ||
        val === 'sushi' ||
        val === 'quickswap' ||
        (0, ethereum_validators_1.isAddress)(val)));
exports.validatePolygonApproveRequest = (0, validators_1.mkRequestValidator)([
    ethereum_validators_1.validateAddress,
    exports.validateSpender,
    validators_1.validateToken,
    validators_1.validateAmount,
    ethereum_validators_1.validateNonce,
]);
exports.validatePolygonAllowancesRequest = (0, validators_1.mkRequestValidator)([ethereum_validators_1.validateAddress, exports.validateSpender, validators_1.validateTokenSymbols]);
//# sourceMappingURL=polygon.validators.js.map