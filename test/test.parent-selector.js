'use strict';

(function () {
const json = {
    "name": "root",
    "children": [
        {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
        {"name": "child2", "children": [{"name": "child2_1"}]},
        {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
    ]
};

describe('JSONPath - Parent selector', function () {
    it('simple parent selection', () => {
        const result = jsonpath({json, path: '$.children[0]^', flatten: true});
        assert.deepEqual(json.children, result);
    });

    it('parent selection with multiple matches', () => {
        const expected = [json.children, json.children];
        const result = jsonpath({json, path: '$.children[1:3]^'});
        assert.deepEqual(expected, result);
    });

    it('select sibling via parent', () => {
        const expected = [{"name": "child3_2"}];
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]'});
        assert.deepEqual(expected, result);
    });

    it('parent parent parent', () => {
        const expected = json.children[0].children;
        const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', flatten: true});
        assert.deepEqual(expected, result);
    });

    it('no such parent', () => {
        const result = jsonpath({json, path: 'name^^'});
        assert.deepEqual([], result);
    });
});
}());
