import {assert, expect} from 'chai';

// Test when Node VM is not supported
const toStr = Object.prototype.toString;
// eslint-disable-next-line no-extend-native
Object.prototype.toString = function () {
    if (this === global.process) {
        if (global.forceBuiltinVM) {
            throw new Error('oops');
        }
        // Native is not doing this here now
        return '[object process]';
    }
    return toStr.call(Object.prototype);
};

global.assert = assert;
global.expect = expect;

setTimeout(async () => {
    global.forceBuiltinVM = false;
    const {JSONPath} = await import('../src/jsonpath-node.js');
    global.jsonpathNodeVM = JSONPath;
    global.jsonpath = JSONPath;
    global.forceBuiltinVM = true;
    const {
        JSONPath: JSONPathBrowser
    } = await import('../src/jsonpath-browser.js');
    global.jsonpathBrowser = JSONPathBrowser;
    run();
});
