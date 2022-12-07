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
const patch_1 = require("./patch");
const config_manager_cert_passphrase_1 = require("../../src/services/config-manager-cert-passphrase");
require("jest-extended");
describe('ConfigManagerCertPassphrase.readPassphrase', () => {
    let witnessFailure = false;
    afterEach(() => {
        (0, patch_1.unpatch)();
        witnessFailure = false;
    });
    beforeEach(() => {
        (0, patch_1.patch)(config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.bindings, '_exit', () => {
            witnessFailure = true;
        });
    });
    it('should get an error if there is no cert phrase', () => __awaiter(void 0, void 0, void 0, function* () {
        config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
        expect(witnessFailure).toEqual(true);
    }));
    it('should get the cert phrase from the process args', () => __awaiter(void 0, void 0, void 0, function* () {
        const passphrase = 'args_passphrase';
        process.argv.push(`--passphrase=${passphrase}`);
        const certPhrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
        expect(certPhrase).toEqual(passphrase);
        process.argv.pop();
    }));
    it('should get the cert phrase from an env variable', () => __awaiter(void 0, void 0, void 0, function* () {
        const passphrase = 'env_var_passphrase';
        process.env['GATEWAY_PASSPHRASE'] = passphrase;
        const certPhrase = config_manager_cert_passphrase_1.ConfigManagerCertPassphrase.readPassphrase();
        expect(certPhrase).toEqual(passphrase);
        delete process.env['GATEWAY_PASSPHRASE'];
    }));
});
//# sourceMappingURL=config-manager-cert-passphrase.test.js.map