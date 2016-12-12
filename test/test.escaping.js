/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var json = {
    '*': 'star',
    'rest': 'rest',
    'foo': 'bar'
};

var jsonMissingSpecial = {
    'rest': 'rest',
    'foo': 'bar'
};

module.exports = testCase({
    'escape *': function (test) {
        var expected = ['star'];
        var result = jsonpath({json: json, path: "$['`*']"});
        test.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$['`*']"});
        test.deepEqual(expected, result);

        expected = ['star', 'rest'];
        result = jsonpath({json: json, path: "$[`*,rest]"});
        test.deepEqual(expected, result);

        expected = ['star'];
        result = jsonpath({json: json, path: "$.`*"});
        test.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$.`*"});
        test.deepEqual(expected, result);

        expected = ['star', 'rest', 'bar'];
        result = jsonpath({json: json, path: "$['*']"});
        test.deepEqual(expected, result);

        expected = ['rest', 'bar'];
        result = jsonpath({json: jsonMissingSpecial, path: "$['*']"});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
