import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Eval (${vmType} - native)`, function () {
        before(setBuiltInState);
        const json = {
            "store": {
                "book": {
                    "category": "reference",
                    "author": "Nigel Rees",
                    "title": "Sayings of the Century",
                    "price": [8.95, 8.94]
                },
                "books": [{
                    "category": "fiction",
                    "author": "Evelyn Waugh",
                    "title": "Sword of Honour",
                    "price": [10.99, 12.29]
                }, {
                    "category": "fiction",
                    "author": "Herman Melville",
                    "title": "Moby Dick",
                    "isbn": "0-553-21311-3",
                    "price": [8.99, 6.95]
                }]
            }
        };

        it('fail if eval is unsupported', () => {
            expect(() => {
                jsonpath({json, path: "$..[?(@.category === category)]", eval: 'wrong-eval'});
            }).to.throw(
                TypeError,
                'Unknown "eval" property "wrong-eval"'
            );
        });

        it('multi statement eval', () => {
            const expected = [json.store.books[0]];
            const selector = '$..[?(' +
                         'var sum = @.price && @.price[0]+@.price[1];' +
                         'sum > 20;)]';
            const result = jsonpath({json, path: selector, wrap: false, eval: 'native'});
            assert.deepEqual(result, expected);
        });
        it('multi statement eval (with use strict)', () => {
            const expected = [json.store.books[0]];
            const selector = '$..[?(' +
                         '"use strict";' +
                         'var sum = @.price && @.price[0]+@.price[1];' +
                         'sum > 20;)]';
            const result = jsonpath({json, path: selector, wrap: false,
                eval: 'native'});
            assert.deepEqual(result, expected);
        });

        it('accessing current path', () => {
            const expected = [json.store.books[1]];
            const result = jsonpath({json,
                path: "$..[?(@path==\"$['store']['books'][1]\")]",
                wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {category: 'reference'},
                path: "$..[?(@.category === category)]", wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox (with `arguments`)', () => {
            const expected = [json.store.book];
            const selector = "$..[?(@.category === arguments)]";
            const result = jsonpath({
                json,
                path: selector,
                sandbox: {
                    arguments: 'reference'
                },
                wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox with function without "function" in string', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {
                    category () {
                        return 'reference';
                    }
                },
                path: "$..[?(@.category === category())]", wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox with function with "function" in string', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {
                    category () {
                        return 'reference';
                    }
                },
                path: "$..[?(@.category === category())]", wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox (with parsing function)', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {
                    filter (arg) {
                        return arg.category === 'reference';
                    }
                },
                path: "$..[?(filter(@))]", wrap: false,
                eval: 'native'
            });
            assert.deepEqual(result, expected);
        });

        describe('cyclic object', () => {
            // This is not an eval test, but we put it here for parity with item below
            it('cyclic object without a sandbox', () => {
                const circular = {a: {b: {c: 5}}};
                circular.a.x = circular;
                const expected = circular.a.b;
                const result = jsonpath({
                    json: circular,
                    path: '$.a.b',
                    wrap: false,
                    eval: 'native'
                });
                assert.deepEqual(result, expected);
            });
            it('cyclic object in a sandbox', () => {
                const circular = {category: 'fiction'};
                circular.recurse = circular;
                const expected = json.store.books;
                const result = jsonpath({
                    json,
                    path: '$..[?(@.category === aCircularReference.category)]',
                    sandbox: {
                        aCircularReference: circular
                    },
                    wrap: false,
                    eval: 'native'
                });
                assert.deepEqual(result, expected);
            });
        });
    });
    describe(`JSONPath - Eval (${vmType} - custom)`, function () {
        before(setBuiltInState);
        const json = {
            "store": {
                "book": {
                    "category": "reference",
                    "author": "Nigel Rees",
                    "title": "Sayings of the Century",
                    "price": [8.95, 8.94]
                },
                "books": [{
                    "category": "fiction",
                    "author": "Evelyn Waugh",
                    "title": "Sword of Honour",
                    "price": [10.99, 12.29]
                }, {
                    "category": "fiction",
                    "author": "Herman Melville",
                    "title": "Moby Dick",
                    "isbn": "0-553-21311-3",
                    "price": [8.99, 6.95]
                }]
            }
        };
        it('eval as callback function', () => {
            const evalCb = (code, ctxt) => {
                const script = new jsonpath.prototype.safeVm.Script(code);
                return script.runInNewContext(ctxt);
            };
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                path: '$..[?(@.category === "reference")]',
                eval: evalCb
            });
            assert.deepEqual(result, expected);
        });
        it('eval as class', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                path: '$..[?(@.category === "reference")]',
                eval: jsonpath.prototype.safeVm.Script
            });
            assert.deepEqual(result, expected);
        });

        it('treat error as mismatch in eval', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                path: '$..[?(@.category.toLowerCase() === "reference")]',
                eval: jsonpath.prototype.safeVm.Script,
                ignoreEvalErrors: true
            });
            assert.deepEqual(result, expected);
        });
    });
});
