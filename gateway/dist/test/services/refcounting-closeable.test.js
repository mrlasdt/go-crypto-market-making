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
require("jest-extended");
const refcounting_closeable_1 = require("../../src/services/refcounting-closeable");
class RefCountFixture extends refcounting_closeable_1.ReferenceCountingCloseable {
    constructor(retrievalKey) {
        super(retrievalKey);
        this._finalized = false;
        this._members = {};
    }
    get finalized() {
        return this._finalized;
    }
    get members() {
        return this._members;
    }
    add(memberKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = RefCountFixture.getInstance(memberKey, this.handle);
            this._members[memberKey] = member;
        });
    }
    remove(memberKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(memberKey in this._members)) {
                return;
            }
            const member = this._members[memberKey];
            delete this._members[memberKey];
            yield member.close(this.handle);
        });
    }
    close(ownersHandler) {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.close.call(this, ownersHandler);
            if (this.refCount < 1) {
                for (const memberKey of Object.keys(this._members)) {
                    yield this.remove(memberKey);
                }
                this._finalized = true;
            }
        });
    }
}
describe('Reference counting closeable tests', () => {
    const rootHandle = refcounting_closeable_1.ReferenceCountingCloseable.createHandle();
    it('Finalize after being released by owner', () => __awaiter(void 0, void 0, void 0, function* () {
        const fixture = RefCountFixture.getInstance('instance1', rootHandle);
        try {
            expect(fixture.refCount).toEqual(1);
            expect(fixture.finalized).toBeFalse();
            yield fixture.close(rootHandle);
            expect(fixture.refCount).toEqual(0);
            expect(fixture.finalized).toBeTrue();
        }
        finally {
            yield fixture.close(rootHandle);
        }
    }));
    it('Do not finalize if more than zero owner left', () => __awaiter(void 0, void 0, void 0, function* () {
        const owner1 = RefCountFixture.getInstance('instance1', rootHandle);
        const owner2 = RefCountFixture.getInstance('instance2', rootHandle);
        const sharedObject = RefCountFixture.getInstance('shared', rootHandle);
        try {
            yield owner1.add('shared');
            yield owner2.add('shared');
            expect(sharedObject.refCount).toEqual(3);
            yield sharedObject.close(rootHandle);
            expect(sharedObject.refCount).toEqual(2);
            expect(sharedObject.finalized).toBeFalse();
            yield owner1.remove('shared');
            expect(sharedObject.refCount).toEqual(1);
            expect(sharedObject.finalized).toBeFalse();
            yield owner2.remove('shared');
            expect(sharedObject.refCount).toEqual(0);
            expect(sharedObject.finalized).toBeTrue();
        }
        finally {
            yield owner1.close(rootHandle);
            yield owner2.close(rootHandle);
            yield sharedObject.close(rootHandle);
        }
    }));
    it('Cascading finalization given an ownership graph', () => __awaiter(void 0, void 0, void 0, function* () {
        const node1_1 = RefCountFixture.getInstance('node1_1', rootHandle);
        const node1_2 = RefCountFixture.getInstance('node1_2', rootHandle);
        const node1_3 = RefCountFixture.getInstance('node1_3', rootHandle);
        const node2_1 = RefCountFixture.getInstance('node2_1', rootHandle);
        const node3_1 = RefCountFixture.getInstance('node3_1', rootHandle);
        const node4_1 = RefCountFixture.getInstance('node4_1', rootHandle);
        const allNodes = [
            node1_1,
            node1_2,
            node1_3,
            node2_1,
            node3_1,
            node4_1,
        ];
        try {
            yield node1_1.add('node2_1');
            yield node1_2.add('node2_1');
            yield node1_3.add('node2_1');
            yield node2_1.add('node3_1');
            yield node3_1.add('node4_1');
            yield node2_1.close(rootHandle);
            yield node3_1.close(rootHandle);
            yield node4_1.close(rootHandle);
            expect(node1_1.refCount).toEqual(1);
            expect(node1_2.refCount).toEqual(1);
            expect(node1_3.refCount).toEqual(1);
            expect(node2_1.refCount).toEqual(3);
            expect(node3_1.refCount).toEqual(1);
            expect(node4_1.refCount).toEqual(1);
            for (const n of allNodes) {
                expect(n.finalized).toBeFalse();
            }
            yield node1_1.close(rootHandle);
            yield node1_2.close(rootHandle);
            yield node1_3.close(rootHandle);
            for (const n of allNodes) {
                expect(n.finalized).toBeTrue();
            }
        }
        finally {
            for (const n of allNodes) {
                yield n.close(rootHandle);
            }
        }
    }));
});
//# sourceMappingURL=refcounting-closeable.test.js.map