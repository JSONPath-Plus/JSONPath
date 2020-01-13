import {assert, expect} from 'chai';

// Test when Node VM is not supported
const toStr = Object.prototype.toString;
// eslint-disable-next-line no-extend-native
Object.prototype.toString = function () {
    if (this === global.process) {
        // eslint-disable-next-line compat/compat
        throw new Error('oops');
    }
    return toStr.call(Object.prototype);
};

global.assert = assert;
global.expect = expect;

setTimeout(async () => {
    const {JSONPath} = await import('../src/jsonpath.js');
    global.jsonpath = JSONPath;
    run();
});
