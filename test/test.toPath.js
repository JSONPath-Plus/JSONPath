/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

module.exports = testCase({

    // ============================================================================
    'toPathString': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = "$['store']['bicycle']['color']";
        var result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color']);
        test.strictEqual(expected, result);

        test.done();
    },
    // ============================================================================
    'toPathString (stripped)': function (test) {
    // ============================================================================
        test.expect(3);
        var expected = "$['store']['bicycle']['color']";
        var result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '^']);
        test.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '@string()']);
        test.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '~']);
        test.deepEqual(expected, result);

        test.done();
    },
    // ============================================================================
    'toPathArray': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = ['$', 'store', 'bicycle', 'color'];
        var result = jsonpath.toPathArray("$['store']['bicycle']['color']");
        test.deepEqual(expected, result);

        test.done();
    },

    'toPathArray (unnormalized)': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = ['$', 'store', 'bicycle', 'color'];
        var result = jsonpath.toPathArray("$.store['bicycle'].color");
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
