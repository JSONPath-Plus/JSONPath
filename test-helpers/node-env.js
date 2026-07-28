import {assert, expect} from 'chai';
import {JSONPath, JSONPathClass} from '../src/jsonpath-node.js';
import {
    JSONPath as JSONPathBrowser
} from '../src/jsonpath-browser.js';

/* eslint-disable unicorn/no-global-object-property-assignment -- Test env */
globalThis.assert = assert;
globalThis.expect = expect;

globalThis.jsonpathNodeVM = JSONPath;
globalThis.jsonpath = JSONPath;
globalThis.jsonpathBrowser = JSONPathBrowser;
globalThis.JSONPathClass = JSONPathClass;
/* eslint-enable unicorn/no-global-object-property-assignment -- Test env */
