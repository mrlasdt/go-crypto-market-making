"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patch_1 = require("./patch");
require("jest-extended");
class A {
    constructor() {
        this._x = 0;
        this._y = false;
        this._z = 'Guten Tag';
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get z() {
        return this._z;
    }
}
class B {
    constructor() {
        this._alter = (x) => x.toLowerCase();
    }
    get alter() {
        return this._alter;
    }
}
class Singleton {
    constructor() {
        this._x = -1;
    }
    static getInstance() {
        if (!Singleton._instance) {
            Singleton._instance = new Singleton();
        }
        return Singleton._instance;
    }
    get x() {
        return this._x;
    }
}
describe('internal patch system', () => {
    it('It can patch and unpatch private variables', () => {
        const a = new A();
        (0, patch_1.patch)(a, '_x', 1);
        expect(a.x).toEqual(1);
        (0, patch_1.patch)(a, 'x', () => 3);
        expect(a.x).toEqual(3);
        (0, patch_1.unpatch)();
        expect(a.x).toEqual(0);
    });
    it('It can patch a value multiple times and then retrieve the original value', () => {
        const a = new A();
        (0, patch_1.patch)(a, '_x', 1);
        expect(a.x).toEqual(1);
        (0, patch_1.patch)(a, '_x', 3);
        expect(a.x).toEqual(3);
        (0, patch_1.patch)(a, '_x', 10);
        expect(a.x).toEqual(10);
        (0, patch_1.unpatch)();
        expect(a.x).toEqual(0);
    });
    it('It can patch multiple values on an object and then retrieve all the original values', () => {
        const a = new A();
        (0, patch_1.patch)(a, '_x', 178);
        (0, patch_1.patch)(a, '_y', true);
        (0, patch_1.patch)(a, '_z', 'Guten Nacht');
        expect(a.x).toEqual(178);
        expect(a.y).toEqual(true);
        expect(a.z).toEqual('Guten Nacht');
        (0, patch_1.patch)(a, '_x', 999);
        (0, patch_1.patch)(a, '_z', 'Hummingbot');
        expect(a.x).toEqual(999);
        expect(a.z).toEqual('Hummingbot');
        (0, patch_1.unpatch)();
        expect(a.x).toEqual(0);
        expect(a.y).toEqual(false);
        expect(a.z).toEqual('Guten Tag');
    });
    it('It can patch and unpatch methods', () => {
        const b = new B();
        (0, patch_1.patch)(b, '_alter', (x) => x.toUpperCase());
        expect(b.alter('HeLlO')).toEqual('HELLO');
        (0, patch_1.patch)(b, '_alter', () => 'Hummingbot');
        expect(b.alter('HeLlO')).toEqual('Hummingbot');
        (0, patch_1.unpatch)();
        expect(b.alter('HeLlO')).toEqual('hello');
    });
    it('It can patch getter methods', () => {
        const b = new B();
        (0, patch_1.patch)(b, 'alter', (_x) => (_y) => 'Hummingbot');
        expect(b.alter('HeLlO')).toEqual('Hummingbot');
        (0, patch_1.unpatch)();
        expect(b.alter('HeLlO')).toEqual('hello');
    });
    it('It can patch and unpatch a singleton correctly', () => {
        const a = Singleton.getInstance();
        const b = Singleton.getInstance();
        (0, patch_1.patch)(a, '_x', 1);
        expect(a.x).toEqual(1);
        expect(b.x).toEqual(1);
        (0, patch_1.patch)(b, '_x', 1122);
        expect(a.x).toEqual(1122);
        expect(b.x).toEqual(1122);
        (0, patch_1.unpatch)();
        expect(a.x).toEqual(-1);
        expect(b.x).toEqual(-1);
    });
});
//# sourceMappingURL=patch.test.js.map