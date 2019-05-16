'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
const arraySize = 12333,
    resultCount = 1150,
    itemCount = 150,
    groupCount = 245;

const json = {
    results: []
};

let i, j;

const bigArray = [];
for (i = 0; i < arraySize; i++) {
    bigArray[i] = 1;
}

const items = [];
for (i = 0; i < itemCount; i++) {
    items[i] = JSON.parse(JSON.stringify({a: {b: 0, c: 0}, s: {b: {c: bigArray}}}));
}

for (i = 0; i < resultCount; i++) {
    json.results[i] = {groups: [], v: {v: [1, 2, 3, 4, 5, 6, 7, 8]}};
    json.results[i].groups = [];
    for (j = 0; j < groupCount; j++) {
        json.results[i].groups[j] = {items, a: "121212"};
    }
}

module.exports = testCase({
    'performance' (test) {
        test.expect(1);
        const start = Date.now();
        jsonpath({json, path: '$.results[*].groups[*].items[42]'});
        test.strictEqual((Date.now() - start) < 2500, true);
        test.done();
    }
});
}());
