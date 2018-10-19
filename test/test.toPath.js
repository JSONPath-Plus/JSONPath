/* eslint-disable quotes */
(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

module.exports = testCase({
    'toPathString' (test) {
        test.expect(1);
        const expected = "$['store']['bicycle']['color']";
        const result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color']);
        test.strictEqual(expected, result);

        test.done();
    },
    'toPathString (stripped)' (test) {
        test.expect(3);
        const expected = "$['store']['bicycle']['color']";
        let result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '^']);
        test.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '@string()']);
        test.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '~']);
        test.deepEqual(expected, result);

        test.done();
    },
    'toPathArray' (test) {
        test.expect(1);
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$['store']['bicycle']['color']");
        test.deepEqual(expected, result);

        test.done();
    },

    'toPathArray (unnormalized)' (test) {
        test.expect(1);
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$.store['bicycle'].color");
        test.deepEqual(expected, result);

        test.done();
    },

    'toPathArray (avoid cache reference issue #78)' (test) {
        test.expect(3);

        const originalPath = "$['foo']['bar']";
        const json = {foo: {bar: 'baz'}};
        const pathArr = jsonpath.toPathArray(originalPath);

        test.equal(pathArr.length, 3);

        // Shouldn't manipulate pathArr values
        jsonpath({
            json,
            path: originalPath,
            wrap: false,
            resultType: 'value'
        });

        test.equal(pathArr.length, 3);
        const path = jsonpath.toPathString(pathArr);

        test.equal(path, originalPath);
        test.done();
    }
});
}());
