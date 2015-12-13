/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var json = {
    "name": "root",
    "children": [
        {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
        {"name": "child2", "children": [{"name": "child2_1"}]},
        {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
    ]
};

module.exports = testCase({

    // ============================================================================
    'simple parent selection, return both path and value': function (test) {
    // ============================================================================
        test.expect(1);
        var result = jsonpath({json: json, path: '$.children[0]^', resultType: 'all'});
        test.deepEqual([{path: "$['children']", value: json.children, parent: json, parentProperty: 'children'}], result);
        test.done();
    },

    // ============================================================================
    'parent selection with multiple matches, return both path and value': function (test) {
    // ============================================================================
        test.expect(1);
        var expectedOne = {path: "$['children']", value: json.children, parent: json, parentProperty: 'children'};
        var expected = [expectedOne, expectedOne];
        var result = jsonpath({json: json, path: '$.children[1:3]^', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    'select sibling via parent, return both path and value': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = [{path: "$['children'][2]['children'][1]", value: {name: 'child3_2'}, parent: json.children[2].children, parentProperty: 1}];
        var result = jsonpath({json: json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    'parent parent parent, return both path and value': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = [{path: "$['children'][0]['children']", value: json.children[0].children, parent: json.children[0], parentProperty: 'children'}];
        var result = jsonpath({json: json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    'no such parent': function (test) {
    // ============================================================================
        test.expect(1);
        var result = jsonpath({json: json, path: 'name^^', resultType: 'all'});
        test.deepEqual([], result);
        test.done();
    }
});
}());
