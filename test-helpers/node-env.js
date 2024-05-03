import {assert, expect} from 'chai';

global.assert = assert;
global.expect = expect;

setTimeout(async () => {
    const {JSONPath} = await import('../src/jsonpath-node.js');
    global.jsonpathNodeVM = JSONPath;
    global.jsonpath = JSONPath;

    const {
        JSONPath: JSONPathBrowser
    } = await import('../src/jsonpath-browser.js');
    global.jsonpathBrowser = JSONPathBrowser;
});
