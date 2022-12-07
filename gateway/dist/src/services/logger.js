"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telemetry = exports.updateLoggerToStdout = exports.logger = exports.getLocalDate = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const telemetry_transport_1 = require("./telemetry-transport");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const config_manager_v2_1 = require("./config-manager-v2");
dayjs_1.default.extend(utc_1.default);
const { LEVEL, MESSAGE } = require('triple-beam');
const errorsWithStack = winston_1.default.format((einfo) => {
    if (einfo instanceof Error) {
        const info = Object.assign({}, einfo, {
            level: einfo.level,
            [LEVEL]: einfo[LEVEL] || einfo.level,
            message: einfo.message,
            [MESSAGE]: einfo[MESSAGE] || einfo.message,
            stack: `\n${einfo.stack}` || '',
        });
        return info;
    }
    return einfo;
});
const getLocalDate = () => {
    const gmtOffset = config_manager_v2_1.ConfigManagerV2.getInstance().get('server.GMTOffset');
    return (0, dayjs_1.default)().utcOffset(gmtOffset, false).format('YYYY-MM-DD hh:mm:ss');
};
exports.getLocalDate = getLocalDate;
const logFileFormat = winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.align(), errorsWithStack(), winston_1.default.format.printf((info) => {
    const localDate = (0, exports.getLocalDate)();
    return `${localDate} | ${info.level} | ${info.message} | ${info.stack}`;
}));
const sdtoutFormat = winston_1.default.format.combine(winston_1.default.format.printf((info) => {
    const localDate = (0, exports.getLocalDate)();
    return `${localDate} | ${info.level} | ${info.message}`;
}));
const getLogPath = () => {
    let logPath = config_manager_v2_1.ConfigManagerV2.getInstance().get('logging.logPath');
    logPath = [app_root_path_1.default.path, 'logs'].join('/');
    return logPath;
};
const allLogsFileTransport = new winston_daily_rotate_file_1.default({
    level: 'info',
    filename: `${getLogPath()}/logs_gateway_app.log.%DATE%`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    handleRejections: true,
});
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: logFileFormat,
    exitOnError: false,
    transports: [allLogsFileTransport],
});
const toStdout = new winston_1.default.transports.Console({
    format: sdtoutFormat,
});
const reportingProxy = new telemetry_transport_1.TelemetryTransport({
    host: 'api.coinalpha.com',
    instanceId: config_manager_v2_1.ConfigManagerV2.getInstance().get('server.id'),
    level: 'http',
});
const updateLoggerToStdout = () => {
    config_manager_v2_1.ConfigManagerV2.getInstance().get('logging.logToStdOut') === true
        ? exports.logger.add(toStdout)
        : exports.logger.remove(toStdout);
};
exports.updateLoggerToStdout = updateLoggerToStdout;
const telemetry = () => {
    config_manager_v2_1.ConfigManagerV2.getInstance().get('telemetry.enabled') === true
        ? exports.logger.add(reportingProxy)
        : exports.logger.remove(reportingProxy);
};
exports.telemetry = telemetry;
(0, exports.updateLoggerToStdout)();
(0, exports.telemetry)();
//# sourceMappingURL=logger.js.map