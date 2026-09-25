import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Properties (${vmType})`, function () {
        before(setBuiltInState);

        const json = {
            "test1": {
                "test2": {
                    "test3.test4.test5": {
                        "test7": "value"
                    }
                }
            },
            "datafield": [
                {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
                {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}},
                {"@tag": "045", "045": "secret"}
            ]
        };

        it('Periods within properties', () => {
            const expected = {"test7": "value"};
            const result = jsonpath({json, path: "$.test1.test2['test3.test4.test5']", wrap: false});
            assert.deepEqual(result, expected);
        });

        it('Union of quoted property names', () => {
            const data = {
                x: 1, y: 2, ' y': 3, 'a.b': 4, 'a,b': 5, 't~': 6, "q'": 7,
                'r"': 8, n: {x: 10, y: 11}
            };
            /**
             * @param {string} path
             * @param {"value"|"path"} [resultType]
             * @returns {unknown}
             */
            const query = (path, resultType) => jsonpath({
                json: data, path, resultType
            });
            assert.deepEqual(query("$['x','y']"), [1, 2]);
            assert.deepEqual(query('$["x","y"]'), [1, 2]);
            assert.deepEqual(query("$[ 'x' , \"y\" ]"), [1, 2]);
            assert.deepEqual(query("$['x','y']", 'path'), [
                "$['x']", "$['y']"
            ]);
            // Whitespace, periods, commas, and tildes inside quotes are kept
            assert.deepEqual(query("$[' y','x']"), [3, 1]);
            assert.deepEqual(query("$['a.b','a,b','t~']"), [4, 5, 6]);
            assert.deepEqual(query(`$["q'",'r"']`), [7, 8]);
            // Quoted members are literal (not wildcards) and may be missing
            assert.deepEqual(query("$['*','x','missing']"), [1]);
            assert.deepEqual(query("$.x['a','b']"), []);
            // Nested and descendant unions
            assert.deepEqual(query("$['n']['x','y']"), [10, 11]);
            assert.deepEqual(query("$.n['x','y']"), [10, 11]);
            assert.deepEqual(query("$..['x','y']"), [1, 2, 10, 11]);
            assert.deepEqual(query("$['n','x'].y"), [11]);
            // Bare unions are unchanged
            assert.deepEqual(query('$[x, y]'), [1, 3]);
        });

        it('Quoted property names with commas and escapes', () => {
            const data = {
                'a,b': 1, "it's": 2, 'say "hi"': 3, 'a\\b': 4, a: 5, b: 6
            };
            /**
             * @param {string} path
             * @param {"value"|"path"} [resultType]
             * @returns {unknown}
             */
            const query = (path, resultType) => jsonpath({
                json: data, path, resultType
            });
            assert.deepEqual(query("$['a,b']"), [1]);
            assert.deepEqual(query('$["a,b"]'), [1]);
            assert.deepEqual(query(String.raw`$['it\'s']`), [2]);
            assert.deepEqual(query(String.raw`$["say \"hi\""]`), [3]);
            assert.deepEqual(query(String.raw`$['it\'s','a,b']`), [2, 1]);
            // `\\` is an escaped backslash; other backslashes are literal
            assert.deepEqual(query(String.raw`$['a\\b']`), [4]);
            assert.deepEqual(query(String.raw`$['a\b']`), [4]);
            // Paths round-trip through `toPathString`
            const paths = /** @type {string[]} */ (query('$.*', 'path'));
            assert.deepEqual(paths, [
                "$['a,b']", String.raw`$['it\'s']`, `$['say "hi"']`,
                String.raw`$['a\\b']`, "$['a']", "$['b']"
            ]);
            for (const [i, path] of paths.entries()) {
                assert.deepEqual(query(path), [Object.values(data)[i]]);
            }
        });

        it('At signs within properties', () => {
            let result = jsonpath({json, path: "$.datafield[?(@.tag=='035')]", wrap: false});
            assert.deepEqual(result, [json.datafield[0]]);
            result = jsonpath({json, path: "$.datafield[?(@['@tag']=='042')]", wrap: false});
            assert.deepEqual(result, [json.datafield[1]]);
            result = jsonpath({json, path: "$.datafield[2][(@['@tag'])]", wrap: false});
            assert.deepEqual(result, json.datafield[2]['045']);
        });

        it('At signs within properties (null data)', () => {
            const result = jsonpath({json: {
                datafield: [null]
            }, path: "$.datafield[?(@ && @.tag=='xxx')]", wrap: false});
            assert.deepEqual(result, undefined);
        });

        it('Checking properties of child object (through `@` as parent object)', function () {
            const jsonObj = {
                test1: {
                    a: 4,
                    b: 8
                }
            };
            const result = jsonpath({
                json: jsonObj, path: "$.[?(@.a == 4)]", wrap: false});
            assert.deepEqual(result, [jsonObj.test1]);
        });
        it('Checking properties of child object (through `@` as property)', function () {
            const jsonObj = {
                test1: {
                    a: 4,
                    b: 8
                }
            };
            const result = jsonpath({
                json: jsonObj, path: "$.[?(@property == 'a' && @ == 4)]^", wrap: false});
            assert.deepEqual(result, [jsonObj.test1]);
        });
    });
});
