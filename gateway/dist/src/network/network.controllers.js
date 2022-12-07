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
exports.getTokens = exports.getStatus = void 0;
const solana_1 = require("../chains/solana/solana");
const avalanche_1 = require("../chains/avalanche/avalanche");
const binance_smart_chain_1 = require("../chains/binance-smart-chain/binance-smart-chain");
const ethereum_1 = require("../chains/ethereum/ethereum");
const harmony_1 = require("../chains/harmony/harmony");
const polygon_1 = require("../chains/polygon/polygon");
const error_handler_1 = require("../services/error-handler");
const cronos_1 = require("../chains/cronos/cronos");
const near_1 = require("../chains/near/near");
function getStatus(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const statuses = [];
        let connections = [];
        let chain;
        let chainId;
        let rpcUrl;
        let currentBlockNumber;
        let nativeCurrency;
        if (req.chain) {
            if (req.chain === 'avalanche') {
                connections.push(avalanche_1.Avalanche.getInstance(req.network));
            }
            else if (req.chain === 'binance-smart-chain') {
                connections.push(binance_smart_chain_1.BinanceSmartChain.getInstance(req.network));
            }
            else if (req.chain === 'harmony') {
                connections.push(harmony_1.Harmony.getInstance(req.network));
            }
            else if (req.chain === 'ethereum') {
                connections.push(ethereum_1.Ethereum.getInstance(req.network));
            }
            else if (req.chain === 'polygon') {
                connections.push(polygon_1.Polygon.getInstance(req.network));
            }
            else if (req.chain === 'solana') {
                connections.push(solana_1.Solana.getInstance(req.network));
            }
            else if (req.chain === 'near') {
                connections.push(near_1.Near.getInstance(req.network));
            }
            else if (req.chain === 'cronos') {
                connections.push(yield cronos_1.Cronos.getInstance(req.network));
            }
            else {
                throw new error_handler_1.HttpException(500, (0, error_handler_1.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE)(req.chain), error_handler_1.UNKNOWN_CHAIN_ERROR_CODE);
            }
        }
        else {
            const avalancheConnections = avalanche_1.Avalanche.getConnectedInstances();
            connections = connections.concat(avalancheConnections ? Object.values(avalancheConnections) : []);
            const harmonyConnections = harmony_1.Harmony.getConnectedInstances();
            connections = connections.concat(harmonyConnections ? Object.values(harmonyConnections) : []);
            const ethereumConnections = ethereum_1.Ethereum.getConnectedInstances();
            connections = connections.concat(ethereumConnections ? Object.values(ethereumConnections) : []);
            const polygonConnections = polygon_1.Polygon.getConnectedInstances();
            connections = connections.concat(polygonConnections ? Object.values(polygonConnections) : []);
            const solanaConnections = solana_1.Solana.getConnectedInstances();
            connections = connections.concat(solanaConnections ? Object.values(solanaConnections) : []);
            const cronosConnections = cronos_1.Cronos.getConnectedInstances();
            connections = connections.concat(cronosConnections ? Object.values(cronosConnections) : []);
            const nearConnections = near_1.Near.getConnectedInstances();
            connections = connections.concat(nearConnections ? Object.values(nearConnections) : []);
            const bscConnections = binance_smart_chain_1.BinanceSmartChain.getConnectedInstances();
            connections = connections.concat(bscConnections ? Object.values(bscConnections) : []);
        }
        for (const connection of connections) {
            if (!connection.ready()) {
                yield connection.init();
            }
            chain = connection.chain;
            chainId = connection.chainId;
            rpcUrl = connection.rpcUrl;
            nativeCurrency = connection.nativeTokenSymbol;
            try {
                currentBlockNumber = yield connection.getCurrentBlockNumber();
            }
            catch (_e) {
                if (yield connection.provider.getNetwork())
                    currentBlockNumber = 1;
            }
            statuses.push({
                chain,
                chainId,
                rpcUrl,
                currentBlockNumber,
                nativeCurrency,
            });
        }
        return req.chain ? statuses[0] : statuses;
    });
}
exports.getStatus = getStatus;
function getTokens(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let connection;
        let tokens = [];
        if (req.chain && req.network) {
            if (req.chain === 'avalanche') {
                connection = avalanche_1.Avalanche.getInstance(req.network);
            }
            else if (req.chain === 'binance-smart-chain') {
                connection = binance_smart_chain_1.BinanceSmartChain.getInstance(req.network);
            }
            else if (req.chain === 'harmony') {
                connection = harmony_1.Harmony.getInstance(req.network);
            }
            else if (req.chain === 'ethereum') {
                connection = ethereum_1.Ethereum.getInstance(req.network);
            }
            else if (req.chain === 'polygon') {
                connection = polygon_1.Polygon.getInstance(req.network);
            }
            else if (req.chain === 'solana') {
                connection = solana_1.Solana.getInstance(req.network);
            }
            else if (req.chain === 'near') {
                connection = near_1.Near.getInstance(req.network);
            }
            else if (req.chain === 'cronos') {
                connection = yield cronos_1.Cronos.getInstance(req.network);
            }
            else {
                throw new error_handler_1.HttpException(500, (0, error_handler_1.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE)(req.chain), error_handler_1.UNKNOWN_CHAIN_ERROR_CODE);
            }
        }
        else {
            throw new error_handler_1.HttpException(500, (0, error_handler_1.UNKNOWN_KNOWN_CHAIN_ERROR_MESSAGE)(req.chain), error_handler_1.UNKNOWN_CHAIN_ERROR_CODE);
        }
        if (!connection.ready()) {
            yield connection.init();
        }
        if (!req.tokenSymbols) {
            tokens = connection.storedTokenList;
        }
        else {
            for (const t of req.tokenSymbols) {
                tokens.push(connection.getTokenForSymbol(t));
            }
        }
        return { tokens };
    });
}
exports.getTokens = getTokens;
//# sourceMappingURL=network.controllers.js.map