import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - All (${vmType})`, function () {
        before(setBuiltInState);

        const json = {
            "name": "root",
            "children": [
                {"name": "child1", "children": [{"name": "child1_1"}, {"name": "child1_2"}]},
                {"name": "child2", "children": [{"name": "child2_1"}]},
                {"name": "child3", "children": [{"name": "child3_1"}, {"name": "child3_2"}]}
            ]
        };

        it('simple parent selection, return both path and value', () => {
            const result = jsonpath({json, path: '$.children[0]^', resultType: 'all'});
            assert.deepEqual(
                result,
                [{
                    path: "$['children']", value: json.children,
                    parent: json, parentProperty: 'children',
                    pointer: '/children', hasArrExpr: undefined
                }]
            );
        });

        it('parent selection with multiple matches, return both path and value', () => {
            const expectedOne = {path: "$['children']", value: json.children, parent: json, parentProperty: 'children', pointer: '/children', hasArrExpr: true};
            const expected = [expectedOne, expectedOne];
            const result = jsonpath({json, path: '$.children[1:3]^', resultType: 'all'});
            assert.deepEqual(result, expected);
        });

        it('select sibling via parent, return both path and value', () => {
            const expected = [{path: "$['children'][2]['children'][1]", value: {name: 'child3_2'}, parent: json.children[2].children, parentProperty: 1, pointer: '/children/2/children/1', hasArrExpr: true}];
            const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]', resultType: 'all'});
            assert.deepEqual(result, expected);
        });

        it('parent parent parent, return both path and value', () => {
            const expected = [{path: "$['children'][0]['children']", value: json.children[0].children, parent: json.children[0], parentProperty: 'children', pointer: '/children/0/children', hasArrExpr: true}];
            const result = jsonpath({json, path: '$..[?(@.name && @.name.match(/1_1$/))].name^^', resultType: 'all'});
            assert.deepEqual(result, expected);
        });

        it('no such parent', () => {
            const result = jsonpath({json, path: 'name^^', resultType: 'all'});
            assert.deepEqual(result, []);
        });
    });
});
