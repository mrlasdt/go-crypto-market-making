"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpatch = exports.patch = exports.classHasGetter = void 0;
let patchedObjects = new Set();
const classHasGetter = (obj, prop) => {
    const description = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), prop);
    if (description) {
        return !!description.get;
    }
    return false;
};
exports.classHasGetter = classHasGetter;
const patch = (target, propertyName, mock) => {
    if (patchedObjects.has(target))
        patchedObjects.delete(target);
    if (!('__original__' + propertyName in target)) {
        if (Object.getOwnPropertyDescriptor(target, propertyName)) {
            target['__original__' + propertyName] = target[propertyName];
        }
        else {
            target['__original__' + propertyName] = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyName);
        }
    }
    if ((0, exports.classHasGetter)(target, propertyName)) {
        const targetPrototype = Object.getPrototypeOf(target);
        Object.defineProperty(targetPrototype, propertyName, {
            get: mock,
            set: (_value) => {
                return;
            },
        });
        Object.setPrototypeOf(target, targetPrototype);
    }
    else {
        target[propertyName] = mock;
    }
    patchedObjects.add(target);
};
exports.patch = patch;
const unpatch = () => {
    patchedObjects.forEach((target) => {
        const keys = Object.keys(target);
        keys.forEach((key) => {
            if (key.startsWith('__original__')) {
                const propertyName = key.slice(12);
                if (Object.getOwnPropertyDescriptor(target, propertyName)) {
                    target[propertyName] = target[key];
                }
                else {
                    const targetPrototype = Object.getPrototypeOf(target);
                    Object.defineProperty(targetPrototype, propertyName, target[key]);
                    Object.setPrototypeOf(target, targetPrototype);
                }
                delete target[key];
            }
        });
    });
    patchedObjects = new Set();
};
exports.unpatch = unpatch;
//# sourceMappingURL=patch.js.map