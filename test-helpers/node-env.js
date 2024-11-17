import {assert, expect} from 'chai';

globalThis.assert = assert;
globalThis.expect = expect;

setTimeout(async () => {
    const {JSONPath} = await import('../src/jsonpath-node.js');
    globalThis.jsonpathNodeVM = JSONPath;
    globalThis.jsonpath = JSONPath;

    const {
        JSONPath: JSONPathBrowser
    } = await import('../src/jsonpath-browser.js');
    globalThis.jsonpathBrowser = JSONPathBrowser;
});
