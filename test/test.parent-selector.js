import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkBuiltInVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Parent selector (${vmType})`, function () {
        before(setBuiltInState);
        const json = {
            "name": "root",
            "children": [
                {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
                {"name": "child2", "children": [{"name": "child2_1"}]},
                {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
            ]
        };

        it('simple parent selection', () => {
            const result = jsonpath({json, path: '$.children[0]^', flatten: true});
            assert.deepEqual(result, json.children);
        });

        it('parent selection with multiple matches', () => {
            const expected = [json.children, json.children];
            const result = jsonpath({json, path: '$.children[1:3]^'});
            assert.deepEqual(result, expected);
        });

        it('select sibling via parent', () => {
            const expected = [{"name": "child3_2"}];
            const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]'});
            assert.deepEqual(result, expected);
        });

        it('parent parent parent', () => {
            const expected = json.children[0].children;
            const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', flatten: true});
            assert.deepEqual(result, expected);
        });

        it('no such parent', () => {
            const result = jsonpath({json, path: 'name^^'});
            assert.deepEqual(result, []);
        });

        it('select sibling via parent (with non-match present)', () => {
            const jsonMultipleChildren = {
                "name": "root",
                "children": [
                    {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
                    {"name": "child2", "children": [{"name": "child2_1"}]},
                    {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]},
                    {"name": "child4", "children": [{"name": "child4_1"}, {"name": "child3_1"}]}
                ]
            };
            const expected = [{"name": "child3_2"}];
            const result = jsonpath({
                json: jsonMultipleChildren,
                path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]'
            });
            assert.deepEqual(result, expected);
        });
        it('select sibling via parent (with multiple results)', () => {
            const jsonMultipleChildren = {
                "name": "root",
                "children": [
                    {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
                    {"name": "child2", "children": [{"name": "child2_1"}]},
                    {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}, {"name": "child3_2", second: true}]}
                ]
            };
            const expected = [{"name": "child3_2"}, {"name": "child3_2", second: true}];
            const result = jsonpath({
                json: jsonMultipleChildren,
                path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]'
            });
            assert.deepEqual(result, expected);
        });
    });
});
