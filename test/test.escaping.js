'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
const json = {
    '*': 'star',
    'rest': 'rest',
    'foo': 'bar'
};

const jsonMissingSpecial = {
    'rest': 'rest',
    'foo': 'bar'
};

module.exports = testCase({
    'escape *' (test) {
        let expected = ['star'];
        let result = jsonpath({json, path: "$['`*']"});
        test.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$['`*']"});
        test.deepEqual(expected, result);

        expected = ['star', 'rest'];
        result = jsonpath({json, path: "$[`*,rest]"});
        test.deepEqual(expected, result);

        expected = ['star'];
        result = jsonpath({json, path: "$.`*"});
        test.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$.`*"});
        test.deepEqual(expected, result);

        expected = ['star', 'rest', 'bar'];
        result = jsonpath({json, path: "$['*']"});
        test.deepEqual(expected, result);

        expected = ['rest', 'bar'];
        result = jsonpath({json: jsonMissingSpecial, path: "$['*']"});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
