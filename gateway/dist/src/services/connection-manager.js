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
exports.getConnector = exports.getChain = void 0;
const avalanche_1 = require("../chains/avalanche/avalanche");
const cronos_1 = require("../chains/cronos/cronos");
const ethereum_1 = require("../chains/ethereum/ethereum");
const binance_smart_chain_1 = require("../chains/binance-smart-chain/binance-smart-chain");
const harmony_1 = require("../chains/harmony/harmony");
const solana_1 = require("../chains/solana/solana");
const polygon_1 = require("../chains/polygon/polygon");
const mad_meerkat_1 = require("../connectors/mad_meerkat/mad_meerkat");
const openocean_1 = require("../connectors/openocean/openocean");
const pangolin_1 = require("../connectors/pangolin/pangolin");
const perp_1 = require("../connectors/perp/perp");
const quickswap_1 = require("../connectors/quickswap/quickswap");
const pancakeswap_1 = require("../connectors/pancakeswap/pancakeswap");
const serum_1 = require("../connectors/serum/serum");
const uniswap_1 = require("../connectors/uniswap/uniswap");
const uniswap_lp_1 = require("../connectors/uniswap/uniswap.lp");
const vvs_1 = require("../connectors/vvs/vvs");
const traderjoe_1 = require("../connectors/traderjoe/traderjoe");
const sushiswap_1 = require("../connectors/sushiswap/sushiswap");
const defikingdoms_1 = require("../connectors/defikingdoms/defikingdoms");
const defira_1 = require("../connectors/defira/defira");
const near_1 = require("../chains/near/near");
const ref_1 = require("../connectors/ref/ref");
function getChain(chain, network) {
    return __awaiter(this, void 0, void 0, function* () {
        let chainInstance;
        if (chain === 'ethereum')
            chainInstance = ethereum_1.Ethereum.getInstance(network);
        else if (chain === 'avalanche')
            chainInstance = avalanche_1.Avalanche.getInstance(network);
        else if (chain === 'polygon')
            chainInstance = polygon_1.Polygon.getInstance(network);
        else if (chain === 'harmony')
            chainInstance = harmony_1.Harmony.getInstance(network);
        else if (chain === 'near')
            chainInstance = near_1.Near.getInstance(network);
        else if (chain === 'solana')
            chainInstance = yield solana_1.Solana.getInstance(network);
        else if (chain === 'binance-smart-chain')
            chainInstance = binance_smart_chain_1.BinanceSmartChain.getInstance(network);
        else if (chain === 'cronos')
            chainInstance = cronos_1.Cronos.getInstance(network);
        else
            throw new Error('unsupported chain');
        if (!chainInstance.ready()) {
            yield chainInstance.init();
        }
        return chainInstance;
    });
}
exports.getChain = getChain;
function getConnector(chain, network, connector, address) {
    return __awaiter(this, void 0, void 0, function* () {
        let connectorInstance;
        if ((chain === 'ethereum' || chain === 'polygon') &&
            connector === 'uniswap') {
            connectorInstance = uniswap_1.Uniswap.getInstance(chain, network);
        }
        else if (chain === 'polygon' && connector === 'quickswap') {
            connectorInstance = quickswap_1.Quickswap.getInstance(chain, network);
        }
        else if ((chain === 'ethereum' || chain === 'polygon') &&
            connector === 'uniswapLP') {
            connectorInstance = uniswap_lp_1.UniswapLP.getInstance(chain, network);
        }
        else if (chain === 'ethereum' && connector === 'perp') {
            connectorInstance = perp_1.Perp.getInstance(chain, network, address);
        }
        else if (chain === 'avalanche' && connector === 'pangolin') {
            connectorInstance = pangolin_1.Pangolin.getInstance(chain, network);
        }
        else if (chain === 'avalanche' && connector === 'openocean') {
            connectorInstance = openocean_1.Openocean.getInstance(chain, network);
        }
        else if (chain === 'avalanche' && connector === 'traderjoe') {
            connectorInstance = traderjoe_1.Traderjoe.getInstance(chain, network);
        }
        else if (chain === 'harmony' && connector === 'defikingdoms') {
            connectorInstance = defikingdoms_1.Defikingdoms.getInstance(chain, network);
        }
        else if (chain === 'harmony' && connector === 'defira') {
            connectorInstance = defira_1.Defira.getInstance(chain, network);
        }
        else if (chain === 'solana' && connector === 'serum') {
            connectorInstance = yield serum_1.Serum.getInstance(chain, network);
        }
        else if (chain === 'cronos' && connector === 'mad_meerkat') {
            connectorInstance = mad_meerkat_1.MadMeerkat.getInstance(chain, network);
        }
        else if (chain === 'cronos' && connector === 'vvs') {
            connectorInstance = vvs_1.VVSConnector.getInstance(chain, network);
        }
        else if (chain === 'near' && connector === 'ref') {
            connectorInstance = ref_1.Ref.getInstance(chain, network);
        }
        else if (chain === 'binance-smart-chain' && connector === 'pancakeswap') {
            connectorInstance = pancakeswap_1.PancakeSwap.getInstance(chain, network);
        }
        else if (connector === 'sushiswap') {
            connectorInstance = sushiswap_1.Sushiswap.getInstance(chain, network);
        }
        else {
            throw new Error('unsupported chain or connector');
        }
        if (!connectorInstance.ready()) {
            yield connectorInstance.init();
        }
        return connectorInstance;
    });
}
exports.getConnector = getConnector;
//# sourceMappingURL=connection-manager.js.map