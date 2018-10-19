/* eslint-env browser */
/* globals nodeunit */

import {JSONPath} from '../dist/index-es.js';
// import '../test-helpers/loadTests.js';

const suites = [], _testCase = nodeunit.testCase;
nodeunit.testCase = function (tc) {
    suites.push(tc);
    return _testCase(tc);
};
// stubs to load nodejs tests
function require (path) { // eslint-disable-line no-unused-vars
    if (path === 'nodeunit') { return nodeunit; }
    if (path.match(/^\.\.\/?$/)) { return {JSONPath}; }
}
const module = {exports: {}}; // eslint-disable-line no-unused-vars

// synchronous load function for JS code, uses XMLHttpRequest abstraction from
// http://www.quirksmode.org/js/xmlhttp.html
// Since the tests are written in node.js style we need to wrap their code into
// a function, otherwise they would pollute the global NS and interfere with each
// other
function get (url, callback) {
    function createXMLHTTPObject () {
        let i;
        const XMLHttpFactories = [
            function () { return new XMLHttpRequest(); }
        ];
        for (i = 0; i < XMLHttpFactories.length; i++) {
            try {
                return XMLHttpFactories[i]();
            } catch (ignore) {}
        }
        return false;
    }
    function sendRequest (url, callback) {
        const req = createXMLHTTPObject();
        req.open('GET', url, false /* sync */);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req);
            }
        };
        if (req.readyState !== 4) {
            req.send();
        }
    }
    sendRequest(url, callback);
}

function loadJS (url) { // eslint-disable-line no-unused-vars
    get(url, function (req) {
        new Function(req.responseText)(); // eslint-disable-line no-new-func
    });
}
window.loadJS = loadJS;
window.require = require;
window.module = module;
window.suites = suites;
