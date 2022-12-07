"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseWrapper = void 0;
class ResponseWrapper {
    get status() {
        return this._status || -1;
    }
    set status(value) {
        this._status = value;
    }
}
exports.ResponseWrapper = ResponseWrapper;
//# sourceMappingURL=common-interfaces.js.map