'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
module.exports = testCase({
    'toPointer' (test) {
        test.expect(1);
        const expected = '/store/bicycle/color';
        const result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color']);
        test.deepEqual(expected, result);

        test.done();
    },
    'toPointer (stripped)' (test) {
        test.expect(3);
        const expected = '/store/bicycle/color';
        let result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '^']);
        test.deepEqual(expected, result);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '@string()']);
        test.deepEqual(expected, result);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '~']);
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
