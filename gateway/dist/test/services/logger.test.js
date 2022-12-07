"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_manager_v2_1 = require("../../src/services/config-manager-v2");
const logger_1 = require("../../src/services/logger");
describe('Test logger', () => {
    it('updateLoggerToStdout works', (done) => {
        config_manager_v2_1.ConfigManagerV2.getInstance().set('logging.logToStdOut', true);
        (0, logger_1.updateLoggerToStdout)();
        const ofTypeConsole = (element) => element instanceof winston_1.default.transports.Console;
        expect(logger_1.logger.transports.some(ofTypeConsole)).toEqual(true);
        config_manager_v2_1.ConfigManagerV2.getInstance().set('logging.logToStdOut', false);
        (0, logger_1.updateLoggerToStdout)();
        done();
    });
    it('test telemetry transport can be added', () => {
        const initTransports = logger_1.logger.transports.length;
        if (!config_manager_v2_1.ConfigManagerV2.getInstance().get('telemetry.enabled')) {
            config_manager_v2_1.ConfigManagerV2.getInstance().set('telemetry.enabled', true);
            (0, logger_1.telemetry)();
            config_manager_v2_1.ConfigManagerV2.getInstance().set('telemetry.enabled', false);
            expect(logger_1.logger.transports.length).toEqual(initTransports + 1);
        }
    });
});
//# sourceMappingURL=logger.test.js.map