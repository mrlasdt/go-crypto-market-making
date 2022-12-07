"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryTransport = void 0;
const winston_1 = __importDefault(require("winston"));
const https_1 = __importDefault(require("https"));
const querystring_1 = __importDefault(require("querystring"));
class TelemetryTransport extends winston_1.default.transports.Http {
    constructor(opts) {
        super(opts);
        this.logInterval = 3600000;
        this.instanceId = opts.instanceId || '';
        this.errorLogBuffer = [];
        this.requestCountAggregator = 0;
        setInterval(this.sendLogs.bind(this), this.logInterval);
    }
    processData(log) {
        if ('stack' in log)
            this.errorLogBuffer.push(`${Date.now()} - ${log.message}\n${log.stack}`);
        else if (log.level === 'http')
            this.requestCountAggregator += Number(log.message.split('\t')[1]);
    }
    responseHandler(err, res) {
        if (res && res.statusCode !== 200) {
            err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
        }
        if (err) {
            this.emit('warn', err);
        }
        else {
            this.emit('logged', 'Successfully logged metrics.');
        }
    }
    sendLogs() {
        if (this.errorLogBuffer.length > 0) {
            const logData = {
                data: JSON.stringify(this.errorLogBuffer),
                params: {
                    ddtags: `instance_id:${this.instanceId},type:logs`,
                    ddsource: 'gateway',
                },
            };
            this._request(logData, true, this.responseHandler.bind(this));
        }
        if (this.requestCountAggregator > 0) {
            const metric = {
                data: JSON.stringify({
                    name: 'request_count',
                    source: 'gateway',
                    instance_id: this.instanceId,
                    value: this.requestCountAggregator,
                }),
            };
            this._request(metric, false, this.responseHandler.bind(this));
        }
        this.errorLogBuffer = [];
        this.requestCountAggregator = 0;
    }
    log(data, callback) {
        this.processData(data);
        if (callback) {
            setImmediate(callback);
        }
    }
    _request(options, isLog, callback) {
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': options.data.length,
        };
        const req = https_1.default.request({
            method: 'POST',
            host: this.host,
            port: 443,
            path: isLog
                ? `/reporting-proxy-v2/log?${querystring_1.default.stringify(options.params)}`
                : '/reporting-proxy-v2/client_metrics',
            headers: headers,
        });
        req.on('error', callback);
        req.on('response', (res) => res.on('end', () => callback(null, res)).resume());
        req.end(Buffer.from(options.data, 'utf8'));
    }
}
exports.TelemetryTransport = TelemetryTransport;
//# sourceMappingURL=telemetry-transport.js.map