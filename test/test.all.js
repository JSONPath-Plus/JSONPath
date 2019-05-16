'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
const json = {
    "name": "root",
    "children": [
        {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
        {"name": "child2", "children": [{"name": "child2_1"}]},
        {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
    ]
};

module.exports = testCase({
    'simple parent selection, return both path and value' (test) {
        test.expect(1);
        const result = jsonpath({json, path: '$.children[0]^', resultType: 'all'});
        test.deepEqual([{path: "$['children']", value: json.children, parent: json, parentProperty: 'children', pointer: '/children'}], result);
        test.done();
    },

    'parent selection with multiple matches, return both path and value' (test) {
        test.expect(1);
        const expectedOne = {path: "$['children']", value: json.children, parent: json, parentProperty: 'children', pointer: '/children'};
        const expected = [expectedOne, expectedOne];
        const result = jsonpath({json, path: '$.children[1:3]^', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    'select sibling via parent, return both path and value' (test) {
        test.expect(1);
        const expected = [{path: "$['children'][2]['children'][1]", value: {name: 'child3_2'}, parent: json.children[2].children, parentProperty: 1, pointer: '/children/2/children/1'}];
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    'parent parent parent, return both path and value' (test) {
        test.expect(1);
        const expected = [{path: "$['children'][0]['children']", value: json.children[0].children, parent: json.children[0], parentProperty: 'children', pointer: '/children/0/children'}];
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', resultType: 'all'});
        test.deepEqual(expected, result);
        test.done();
    },

    'no such parent' (test) {
        test.expect(1);
        const result = jsonpath({json, path: 'name^^', resultType: 'all'});
        test.deepEqual([], result);
        test.done();
    }
});
}());
