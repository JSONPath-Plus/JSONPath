/* eslint-disable quotes */
(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

const json = {
    "name": "root",
    "children": [
        {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
        {"name": "child2", "children": [{"name": "child2_1"}]},
        {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
    ]
};

module.exports = testCase({
    'simple parent selection' (test) {
        test.expect(1);
        const result = jsonpath({json, path: '$.children[0]^', flatten: true});
        test.deepEqual(json.children, result);
        test.done();
    },

    'parent selection with multiple matches' (test) {
        test.expect(1);
        const expected = [json.children, json.children];
        const result = jsonpath({json, path: '$.children[1:3]^'});
        test.deepEqual(expected, result);
        test.done();
    },

    'select sibling via parent' (test) {
        test.expect(1);
        const expected = [{"name": "child3_2"}];
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]'});
        test.deepEqual(expected, result);
        test.done();
    },

    'parent parent parent' (test) {
        test.expect(1);
        const expected = json.children[0].children;
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'no such parent' (test) {
        test.expect(1);
        const result = jsonpath({json, path: 'name^^'});
        test.deepEqual([], result);
        test.done();
    }

});
}());
