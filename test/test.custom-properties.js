'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
const t1 = {
    b: {true: 'abc', false: 'def'},
    c: {true: 'qrs', false: 'tuv'}
};

module.exports = testCase({
    '@path for index' (test) {
        test.expect(1);
        const result = jsonpath({json: t1, path: '$.*[(@path === "$[\'b\']")]', wrap: false});
        test.deepEqual(['abc', 'tuv'], result);
        test.done();
    }
});
}());
