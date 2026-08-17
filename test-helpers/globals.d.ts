declare global {
    var assert: typeof import('chai').assert;
    var expect: typeof import('chai').expect;
    var jsonpath: typeof import('../src/jsonpath.js').JSONPath;
    var jsonpathNodeVM: typeof import('../src/jsonpath-node.js').JSONPath;
    var jsonpathBrowser: typeof import('../src/jsonpath-browser.js').JSONPath;
    var JSONPath: typeof import('../src/jsonpath.js').JSONPath;
    var JSONPathClass: typeof import('../src/jsonpath.js').JSONPathClass;
}

export {};
