import {assert, expect} from 'chai';
import {JSONPath} from '../src/jsonpath-node.js';
import {
    JSONPath as JSONPathBrowser
} from '../src/jsonpath-browser.js';

globalThis.assert = assert;
globalThis.expect = expect;

globalThis.jsonpathNodeVM = JSONPath;
globalThis.jsonpath = JSONPath;
globalThis.jsonpathBrowser = JSONPathBrowser;
