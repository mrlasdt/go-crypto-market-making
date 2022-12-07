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
exports.ConnectorsRoutes = void 0;
const express_1 = require("express");
const error_handler_1 = require("../services/error-handler");
const defira_config_1 = require("./defira/defira.config");
const defikingdoms_config_1 = require("./defikingdoms/defikingdoms.config");
const mad_meerkat_config_1 = require("./mad_meerkat/mad_meerkat.config");
const openocean_config_1 = require("./openocean/openocean.config");
const pangolin_config_1 = require("./pangolin/pangolin.config");
const perp_config_1 = require("./perp/perp.config");
const quickswap_config_1 = require("./quickswap/quickswap.config");
const serum_config_1 = require("./serum/serum.config");
const sushiswap_config_1 = require("./sushiswap/sushiswap.config");
const traderjoe_config_1 = require("./traderjoe/traderjoe.config");
const uniswap_config_1 = require("./uniswap/uniswap.config");
const vvs_config_1 = require("./vvs/vvs.config");
const ref_config_1 = require("./ref/ref.config");
const pancakeswap_config_1 = require("./pancakeswap/pancakeswap.config");
var ConnectorsRoutes;
(function (ConnectorsRoutes) {
    ConnectorsRoutes.router = (0, express_1.Router)();
    ConnectorsRoutes.router.get('/', (0, error_handler_1.asyncHandler)((_req, res) => __awaiter(this, void 0, void 0, function* () {
        res.status(200).json({
            connectors: [
                {
                    name: 'uniswap',
                    trading_type: uniswap_config_1.UniswapConfig.config.tradingTypes('swap'),
                    available_networks: uniswap_config_1.UniswapConfig.config.availableNetworks,
                },
                {
                    name: 'uniswapLP',
                    trading_type: uniswap_config_1.UniswapConfig.config.tradingTypes('LP'),
                    available_networks: JSON.parse(JSON.stringify(uniswap_config_1.UniswapConfig.config.availableNetworks)),
                    additional_spenders: ['uniswap'],
                },
                {
                    name: 'pangolin',
                    trading_type: pangolin_config_1.PangolinConfig.config.tradingTypes,
                    available_networks: pangolin_config_1.PangolinConfig.config.availableNetworks,
                },
                {
                    name: 'openocean',
                    trading_type: openocean_config_1.OpenoceanConfig.config.tradingTypes,
                    available_networks: openocean_config_1.OpenoceanConfig.config.availableNetworks,
                },
                {
                    name: 'quickswap',
                    trading_type: quickswap_config_1.QuickswapConfig.config.tradingTypes,
                    available_networks: quickswap_config_1.QuickswapConfig.config.availableNetworks,
                },
                {
                    name: 'perp',
                    trading_type: perp_config_1.PerpConfig.config.tradingTypes('perp'),
                    available_networks: perp_config_1.PerpConfig.config.availableNetworks,
                },
                {
                    name: 'sushiswap',
                    trading_type: sushiswap_config_1.SushiswapConfig.config.tradingTypes,
                    available_networks: sushiswap_config_1.SushiswapConfig.config.availableNetworks,
                },
                {
                    name: 'traderjoe',
                    trading_type: traderjoe_config_1.TraderjoeConfig.config.tradingTypes,
                    available_networks: traderjoe_config_1.TraderjoeConfig.config.availableNetworks,
                },
                {
                    name: 'defikingdoms',
                    trading_type: defikingdoms_config_1.DefikingdomsConfig.config.tradingTypes,
                    available_networks: defikingdoms_config_1.DefikingdomsConfig.config.availableNetworks,
                },
                {
                    name: 'defira',
                    trading_type: defira_config_1.DefiraConfig.config.tradingTypes,
                    available_networks: defira_config_1.DefiraConfig.config.availableNetworks,
                },
                {
                    name: 'serum',
                    trading_type: serum_config_1.SerumConfig.config.tradingTypes,
                    available_networks: serum_config_1.SerumConfig.config.availableNetworks,
                },
                {
                    name: 'mad_meerkat',
                    trading_type: mad_meerkat_config_1.MadMeerkatConfig.config.tradingTypes,
                    available_networks: mad_meerkat_config_1.MadMeerkatConfig.config.availableNetworks,
                },
                {
                    name: 'vvs',
                    trading_type: vvs_config_1.VVSConfig.config.tradingTypes,
                    available_networks: vvs_config_1.VVSConfig.config.availableNetworks,
                },
                {
                    name: 'ref',
                    trading_type: ref_config_1.RefConfig.config.tradingTypes,
                    available_networks: ref_config_1.RefConfig.config.availableNetworks,
                },
                {
                    name: 'pancakeswap',
                    trading_type: pancakeswap_config_1.PancakeSwapConfig.config.tradingTypes,
                    available_networks: pancakeswap_config_1.PancakeSwapConfig.config.availableNetworks,
                },
            ],
        });
    })));
})(ConnectorsRoutes = exports.ConnectorsRoutes || (exports.ConnectorsRoutes = {}));
//# sourceMappingURL=connectors.routes.js.map