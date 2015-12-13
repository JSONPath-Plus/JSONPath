/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var t1 = {
    b: {true: 'abc', false: 'def'},
    c: {true: 'qrs', false: 'tuv'}
};

module.exports = testCase({

    // ============================================================================
    '@path for index': function (test) {
    // ============================================================================
        test.expect(1);
        var result = jsonpath({json: t1, path: '$.*[(@path === "$[\'b\']")]', wrap: false});
        test.deepEqual(['abc', 'tuv'], result);
        test.done();
    }

});
}());
