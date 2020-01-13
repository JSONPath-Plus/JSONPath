import {assert, expect} from 'chai';

/*
const toStr = Object.prototype.toString;
// eslint-disable-next-line no-extend-native
Object.prototype.toString = function () {
    if (this === global.process) {
        // eslint-disable-next-line compat/compat
        throw new Error('oops');
    }
    return toStr.call(Object.prototype);
};
*/

import {JSONPath} from '../src/jsonpath.js';

global.jsonpath = JSONPath;
global.assert = assert;
global.expect = expect;
