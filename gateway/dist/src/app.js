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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGateway = exports.startSwagger = exports.swaggerDocument = exports.gatewayApp = void 0;
const express_1 = __importDefault(require("express"));
const config_routes_1 = require("./services/config/config.routes");
const solana_routes_1 = require("./chains/solana/solana.routes");
const wallet_routes_1 = require("./services/wallet/wallet.routes");
const logger_1 = require("./services/logger");
const https_1 = require("./https");
const error_handler_1 = require("./services/error-handler");
const config_manager_v2_1 = require("./services/config-manager-v2");
const swagger_manager_1 = require("./services/swagger-manager");
const network_routes_1 = require("./network/network.routes");
const connectors_routes_1 = require("./connectors/connectors.routes");
const evm_routes_1 = require("./evm/evm.routes");
const amm_routes_1 = require("./amm/amm.routes");
const mad_meerkat_config_1 = require("./connectors/mad_meerkat/mad_meerkat.config");
const pangolin_config_1 = require("./connectors/pangolin/pangolin.config");
const quickswap_config_1 = require("./connectors/quickswap/quickswap.config");
const traderjoe_config_1 = require("./connectors/traderjoe/traderjoe.config");
const uniswap_config_1 = require("./connectors/uniswap/uniswap.config");
const openocean_config_1 = require("./connectors/openocean/openocean.config");
const vvs_config_1 = require("./connectors/vvs/vvs.config");
const morgan_1 = __importDefault(require("morgan"));
const clob_routes_1 = require("./clob/clob.routes");
const serum_routes_1 = require("./connectors/serum/serum.routes");
const sushiswap_config_1 = require("./connectors/sushiswap/sushiswap.config");
const defikingdoms_config_1 = require("./connectors/defikingdoms/defikingdoms.config");
const serum_config_1 = require("./connectors/serum/serum.config");
const pancakeswap_config_1 = require("./connectors/pancakeswap/pancakeswap.config");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const near_routes_1 = require("./chains/near/near.routes");
exports.gatewayApp = (0, express_1.default)();
exports.gatewayApp.use(express_1.default.json());
exports.gatewayApp.use(express_1.default.urlencoded({ extended: true }));
exports.gatewayApp.use((0, morgan_1.default)('combined', {
    skip: function (req, _res) {
        return (req.originalUrl === '/' || req.originalUrl.includes('/network/status'));
    },
}));
exports.gatewayApp.use('/config', config_routes_1.ConfigRoutes.router);
exports.gatewayApp.use('/network', network_routes_1.NetworkRoutes.router);
exports.gatewayApp.use('/evm', evm_routes_1.EVMRoutes.router);
exports.gatewayApp.use('/connectors', connectors_routes_1.ConnectorsRoutes.router);
exports.gatewayApp.use('/amm', amm_routes_1.AmmRoutes.router);
exports.gatewayApp.use('/amm/perp', amm_routes_1.PerpAmmRoutes.router);
exports.gatewayApp.use('/amm/liquidity', amm_routes_1.AmmLiquidityRoutes.router);
exports.gatewayApp.use('/clob', clob_routes_1.ClobRoutes.router);
exports.gatewayApp.use('/wallet', wallet_routes_1.WalletRoutes.router);
exports.gatewayApp.use('/solana', solana_routes_1.SolanaRoutes.router);
exports.gatewayApp.use('/serum', serum_routes_1.SerumRoutes.router);
exports.gatewayApp.use('/near', near_routes_1.NearRoutes.router);
exports.gatewayApp.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
exports.gatewayApp.get('/connectors', (0, error_handler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        uniswap: uniswap_config_1.UniswapConfig.config.availableNetworks,
        pangolin: pangolin_config_1.PangolinConfig.config.availableNetworks,
        quickswap: quickswap_config_1.QuickswapConfig.config.availableNetworks,
        sushiswap: sushiswap_config_1.SushiswapConfig.config.availableNetworks,
        openocean: openocean_config_1.OpenoceanConfig.config.availableNetworks,
        traderjoe: traderjoe_config_1.TraderjoeConfig.config.availableNetworks,
        defikingdoms: defikingdoms_config_1.DefikingdomsConfig.config.availableNetworks,
        serum: serum_config_1.SerumConfig.config.availableNetworks,
        mad_meerkat: mad_meerkat_config_1.MadMeerkatConfig.config.availableNetworks,
        vvs: vvs_config_1.VVSConfig.config.availableNetworks,
        pancakeswap: pancakeswap_config_1.PancakeSwapConfig.config.availableNetworks,
    });
})));
exports.gatewayApp.post('/restart', (0, error_handler_1.asyncHandler)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    process.exit(1);
    res.status(200).json();
})));
exports.gatewayApp.use((err, _req, res, _next) => {
    const response = (0, error_handler_1.gatewayErrorMiddleware)(err);
    logger_1.logger.error(err);
    return res.status(response.httpErrorCode).json(response);
});
exports.swaggerDocument = swagger_manager_1.SwaggerManager.generateSwaggerJson('./docs/swagger/swagger.yml', './docs/swagger/definitions.yml', [
    './docs/swagger/main-routes.yml',
    './docs/swagger/connectors-routes.yml',
    './docs/swagger/wallet-routes.yml',
    './docs/swagger/amm-routes.yml',
    './docs/swagger/amm-liquidity-routes.yml',
    './docs/swagger/evm-routes.yml',
    './docs/swagger/network-routes.yml',
    './docs/swagger/solana-routes.yml',
    './docs/swagger/near-routes.yml',
    './docs/swagger/clob-routes.yml',
    './docs/swagger/serum-routes.yml',
]);
const startSwagger = () => __awaiter(void 0, void 0, void 0, function* () {
    const swaggerApp = (0, express_1.default)();
    const swaggerPort = 8080;
    logger_1.logger.info(`⚡️ Swagger listening on port ${swaggerPort}. Read the Gateway API documentation at 127.0.0.1:${swaggerPort}`);
    swaggerApp.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerDocument));
    yield swaggerApp.listen(swaggerPort);
});
exports.startSwagger = startSwagger;
const startGateway = () => __awaiter(void 0, void 0, void 0, function* () {
    const port = config_manager_v2_1.ConfigManagerV2.getInstance().get('server.port');
    if (!config_manager_v2_1.ConfigManagerV2.getInstance().get('server.id')) {
        config_manager_v2_1.ConfigManagerV2.getInstance().set('server.id', Math.random().toString(16).substr(2, 14));
    }
    logger_1.logger.info(`⚡️ Starting Gateway API on port ${port}...`);
    if (config_manager_v2_1.ConfigManagerV2.getInstance().get('server.unsafeDevModeWithHTTP')) {
        logger_1.logger.info('Running in UNSAFE HTTP! This could expose private keys.');
        yield exports.gatewayApp.listen(port);
    }
    else {
        try {
            yield (0, https_1.addHttps)(exports.gatewayApp).listen(port);
            logger_1.logger.info('The gateway server is secured behind HTTPS.');
        }
        catch (e) {
            logger_1.logger.error(`Failed to start the server with https. Confirm that the SSL certificate files exist and are correct. Error: ${e}`);
            process.exit();
        }
    }
    yield (0, exports.startSwagger)();
});
exports.startGateway = startGateway;
//# sourceMappingURL=app.js.map