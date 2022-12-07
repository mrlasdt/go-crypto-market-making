"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSerumOpenOrders = exports.changeAndConvertToSerumOpenOrder = exports.getNewSerumOrders = exports.getOrderPairsFromCandidateOrders = exports.getNewCandidateOrdersTemplates = exports.getNewCandidateOrderTemplate = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const serum_convertors_1 = require("../../../../../src/connectors/serum/serum.convertors");
const serum_helpers_1 = require("../../../../../src/connectors/serum/serum.helpers");
const serum_types_1 = require("../../../../../src/connectors/serum/serum.types");
const config_1 = __importDefault(require("./config"));
const crypto_1 = require("crypto");
const marketNames = ['SOL/USDT', 'SOL/USDC'];
const getRandomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const getNewCandidateOrderTemplate = (configuration) => {
    if (!configuration)
        configuration = {};
    if (!configuration.id)
        configuration.id = Date.now().toString();
    if (!configuration.marketName)
        configuration.marketName = getRandomChoice(marketNames);
    if (!configuration.ownerAddress)
        configuration.ownerAddress = config_1.default.solana.wallet.owner.publicKey;
    if (!configuration.payerAddress)
        if (configuration.side == serum_types_1.OrderSide.SELL) {
            configuration.payerAddress = config_1.default.solana.wallet.owner.publicKey;
        }
        else {
            if (configuration.marketName == 'SOL/USDT') {
                configuration.payerAddress =
                    config_1.default.solana.wallet.payer['SOL/USDT'].publicKey;
            }
            else if (configuration.marketName == 'SOL/USDC') {
                configuration.payerAddress =
                    config_1.default.solana.wallet.payer['SOL/USDC'].publicKey;
            }
            else {
                throw new Error('Unrecognized market name.');
            }
        }
    if (!configuration.side)
        configuration.side = getRandomChoice(Object.values(serum_types_1.OrderSide));
    if (!configuration.type)
        configuration.type = getRandomChoice([serum_types_1.OrderType.LIMIT]);
    const price = configuration.side == serum_types_1.OrderSide.BUY ? 0.1 : 9999.99;
    const amount = configuration.side == serum_types_1.OrderSide.BUY ? 0.1 : 0.1;
    return {
        id: configuration.id,
        marketName: (0, serum_helpers_1.getNotNullOrThrowError)(configuration.marketName),
        ownerAddress: configuration.ownerAddress,
        payerAddress: configuration.payerAddress,
        side: (0, serum_helpers_1.getNotNullOrThrowError)(configuration.side),
        price: price,
        amount: amount,
        type: configuration.type,
    };
};
exports.getNewCandidateOrderTemplate = getNewCandidateOrderTemplate;
const getNewCandidateOrdersTemplates = (quantity, initialId = 1) => {
    let count = initialId;
    const result = [];
    while (count <= quantity) {
        for (const marketName of marketNames) {
            for (const side of Object.values(serum_types_1.OrderSide)) {
                for (const type of [serum_types_1.OrderType.LIMIT]) {
                    result.push((0, exports.getNewCandidateOrderTemplate)({
                        id: count.toString(),
                        marketName,
                        side,
                        type,
                    }));
                    count = count + 1;
                    if (count > quantity)
                        return result;
                }
            }
        }
    }
    return result;
};
exports.getNewCandidateOrdersTemplates = getNewCandidateOrdersTemplates;
const getOrderPairsFromCandidateOrders = (orderCandidates) => {
    return orderCandidates.map((request) => {
        return {
            request: request,
            response: Object.assign(Object.assign({}, request), { exchangeId: (0, crypto_1.randomUUID)(), fee: 0.01, status: serum_types_1.OrderStatus.OPEN, signature: (0, crypto_1.randomUUID)() }),
        };
    });
};
exports.getOrderPairsFromCandidateOrders = getOrderPairsFromCandidateOrders;
const getNewSerumOrders = (candidateOrders) => {
    const result = [];
    for (const candidateOrder of candidateOrders) {
        result.push({
            orderId: candidateOrder.exchangeId ||
                (0, serum_helpers_1.getRandonBN)(),
            openOrdersAddress: new web3_js_1.PublicKey('DaosjpvtAxwL6GFDSL31o9pU5somKjifbkt32bEgLddf'),
            openOrdersSlot: Math.random(),
            price: candidateOrder.price,
            priceLots: (0, serum_helpers_1.getRandonBN)(),
            size: candidateOrder.amount,
            feeTier: Math.random(),
            sizeLots: (0, serum_helpers_1.getRandonBN)(),
            side: (0, serum_convertors_1.convertOrderSideToSerumSide)(candidateOrder.side),
            clientId: new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(candidateOrder.id)),
        });
    }
    return result;
};
exports.getNewSerumOrders = getNewSerumOrders;
const changeAndConvertToSerumOpenOrder = (index, orderBook, candidateOrder) => {
    const orderBookOrder = Array.from(orderBook.orderBook.asks)[index];
    const serumOpenOrder = new serum_types_1.SerumOpenOrders(orderBookOrder.openOrdersAddress, undefined, orderBook.market.programId);
    serumOpenOrder.clientIds = [
        new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(candidateOrder.id)),
    ];
    orderBookOrder.clientId = new bn_js_1.default((0, serum_helpers_1.getNotNullOrThrowError)(candidateOrder.id));
    return serumOpenOrder;
};
exports.changeAndConvertToSerumOpenOrder = changeAndConvertToSerumOpenOrder;
const convertToSerumOpenOrders = (startIndex, orderBook, candidateOrders) => {
    const result = [];
    let count = startIndex;
    for (const candidateOrder of candidateOrders) {
        result.push((0, exports.changeAndConvertToSerumOpenOrder)(count, orderBook, candidateOrder));
        count++;
    }
    return result;
};
exports.convertToSerumOpenOrders = convertToSerumOpenOrders;
//# sourceMappingURL=helpers.js.map