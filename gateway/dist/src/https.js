"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHttps = void 0;
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const config_manager_cert_passphrase_1 = require("./services/config-manager-cert-passphrase");
const config_manager_v2_1 = require("./services/config-manager-v2");
const addHttps = (app) => {
    const serverKey = fs_1.default.readFileSync(config_manager_v2_1.ConfigManagerV2.getInstance().get('ssl.keyPath'), {
        encoding: 'utf-8',
    });
    const serverCert = fs_1.default.readFileSync(config_manager_v2_1.ConfigManagerV2.getInstance().get('ssl.certificatePath'), {
        encoding: 'utf-8',
    });
    const caCert = fs_1.default.readFileSync(config_manager_v2_1.ConfigManagerV2.getInstance().get('ssl.caCertificatePath'), {
        encoding: 'utf-8',
    });
    return https_1.default.createServer({
        key: serverKey,
        cert: serverCert,
        requestCert: true,
        rejectUnauthorized: true,
        ca: [caCert],
        passphrase: config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase(),
    }, app);
};
exports.addHttps = addHttps;
//# sourceMappingURL=https.js.map