/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var arraySize = 12333,
    resultCount = 1150,
    itemCount = 150,
    groupCount = 245;

var json = {
    results: []
};

var i, j;

var bigArray = [];
for (i = 0; i < arraySize; i++) {
    bigArray[i] = 1;
}

var items = [];
for (i = 0; i < itemCount; i++) {
    items[i] = JSON.parse(JSON.stringify({a: {b: 0, c: 0}, s: {b: {c: bigArray}}}));
}

for (i = 0; i < resultCount; i++) {
    json.results[i] = {groups: [], v: {v: [1, 2, 3, 4, 5, 6, 7, 8]}};
    json.results[i].groups = [];
    for (j = 0; j < groupCount; j++) {
        json.results[i].groups[j] = {items: items, a: "121212"};
    }
}

module.exports = testCase({
    // ============================================================================
    'performance': function (test) {
    // ============================================================================
        test.expect(1);
        var start = Date.now();
        jsonpath({json: json, path: '$.results[*].groups[*].items[42]'});
        test.strictEqual((Date.now() - start) < 2500, true);
        test.done();
    }
});
}());
