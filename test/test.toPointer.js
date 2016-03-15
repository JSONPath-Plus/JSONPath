/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

module.exports = testCase({

    // ============================================================================
    'toPointer': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = '/store/bicycle/color';
        var result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color']);
        test.deepEqual(expected, result);

        test.done();
    },
    // ============================================================================
    'toPointer (stripped)': function (test) {
    // ============================================================================
        test.expect(3);
        var expected = '/store/bicycle/color';
        var result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '^']);
        test.deepEqual(expected, result);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '@string()']);
        test.deepEqual(expected, result);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '~']);
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
