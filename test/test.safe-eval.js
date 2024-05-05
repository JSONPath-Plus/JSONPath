import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Eval (${vmType} - safe)`, function () {
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

        it('multi statement eval', () => {
            const expected = [json.store.books[0]];
            const selector = '$..[?(' +
                         'var sum = @.price && @.price[0]+@.price[1];' +
                         'sum > 20;)]';
            const result = jsonpath({json, path: selector, wrap: false, eval: 'safe'});
            assert.deepEqual(result, expected);
        });
        it('multi statement eval (with use strict)', () => {
            const expected = [json.store.books[0]];
            const selector = '$..[?(' +
                         '"use strict";' +
                         'var sum = @.price && @.price[0]+@.price[1];' +
                         'sum > 20;)]';
            const result = jsonpath({json, path: selector, wrap: false, eval: 'safe'});
            assert.deepEqual(result, expected);
        });

        it('accessing current path', () => {
            const expected = [json.store.books[1]];
            const result = jsonpath({json, path: "$..[?(@path==\"$['store']['books'][1]\")]", wrap: false, eval: 'safe'});
            assert.deepEqual(result, expected);
        });

        it('sandbox', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {category: 'reference'},
                path: "$..[?(@.category === category)]", wrap: false,
                eval: 'safe'
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
                eval: 'safe'
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
                eval: 'safe'
            });
            assert.deepEqual(result, expected);
        });

        it('sandbox with function with "function" in string', () => {
            const expected = [json.store.book];
            const result = jsonpath({
                json,
                sandbox: {
                    // eslint-disable-next-line object-shorthand
                    category: function () {
                        return 'reference';
                    }
                },
                path: "$..[?(@.category === category())]", wrap: false,
                eval: 'safe'
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
                eval: 'safe'
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
                    eval: 'safe'
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
                    eval: 'safe'
                });
                assert.deepEqual(result, expected);
            });
        });
        it('ternary operator in safe mode script', () => {
            const expected = [json.store.book, json.store.books[0]];
            const result = jsonpath({
                json,
                path: "$..[?(@ && @.price && ((@.price[0] + @.price[1]) > ((@.category === 'reference') ? 16 : 20)))]",
                wrap: false,
                eval: 'safe'
            });
            assert.deepEqual(result, expected);
        });
        it('unary operator in safe mode script', () => {
            const expected = [json.store.book, json.store.books[1]];
            const result = jsonpath({
                json,
                path: '$..[?(@ && @.price && -10 < -(@.price[0]))]',
                wrap: false,
                eval: 'safe'
            });
            assert.deepEqual(result, expected);
        });
        it('Array expression in safe mode script', () => {
            const expected = [json.store.book, json.store.books];
            const result = jsonpath({
                json,
                path: '$..[?(["book", "books"].includes(@property))]',
                wrap: false,
                eval: 'safe'
            });
            assert.deepEqual(result, expected);
        });
        describe('binary operators in safe mode script', () => {
            // eslint-disable-next-line no-shadow -- Convenient
            const json = {
                "store": {
                    "book": {
                        "category": "reference",
                        "author": "Nigel Rees",
                        "title": "Sayings of the Century",
                        "shelf": 1,
                        "price": [8.95, 8.94],
                        "meta": '12'
                    },
                    "books": [{
                        "category": "fiction",
                        "author": "Evelyn Waugh",
                        "title": "Sword of Honour",
                        "shelf": 2,
                        "price": [10.99, 12.29],
                        "meta": 1073741822 // (-5) >>> 2
                    }, {
                        "category": "fiction",
                        "author": "Herman Melville",
                        "title": "Moby Dick",
                        "shelf": 3,
                        "isbn": "0-553-21311-3",
                        "price": [8.99, 6.95],
                        "emptyArray": []
                    }]
                }
            };
            const opPathExpecteds = [
                ['|| , ===', '$..[?(@property === "book" || @property === "books")]', [json.store.book, json.store.books]],
                ['| , &&', '$..[?(@ && (@.shelf === (1 | 2)))]', [json.store.books[1]]],
                ['^', '$..[?(@ && (@.shelf === (1 ^ 2)))]', [json.store.books[1]]],
                ['& , !==', '$..[?(@ && @.shelf && ((@.shelf & 1) !== 1))]', [json.store.books[0]]],
                ['==', '$..[?(@ && (@.shelf == "1"))]', [json.store.book]],
                ['!=', '$..[?(@ && @.shelf && (@.shelf != "1"))]', json.store.books],
                ['< , >', '$..[?(@ && @.shelf < 3 && @.shelf > 1)]', [json.store.books[0]]],
                ['<= , >=', '$..[?(@ && @.shelf <= 3 && @.shelf >= 1)]', [json.store.book, ...json.store.books]],
                ['<<', '$..[?(@ && @.shelf << 1 === 2)]', [json.store.book]],
                ['>>', '$..[?(@ && @.shelf >> 1 === 1)]', json.store.books],
                ['>>>', '$..[?(@ && @.meta === -5 >>> 2)]', [json.store.books[0]]],
                ['+', '$..[?(@ && @.shelf + 1 === 2)]', [json.store.book]],
                ['-', '$..[?(@ && @.shelf - 1 === 0)]', [json.store.book]],
                ['*', '$..[?(@ && @.shelf * 2 === 2)]', [json.store.book]],
                ['/', '$..[?(@ && @.shelf / 2 === 1)]', [json.store.books[0]]],
                ['%', '$..[?(@ && @.shelf % 2 === 0)]', [json.store.books[0]]],
                ['!', '$..[?(@ && @.emptyArray && !@.emptyArray.length)]', [json.store.books[1]]],
                ['~', '$..[?(@ && ~@.shelf === -2)]', [json.store.book]],
                ['+ (unary)', '$..[?(@ && +@.meta === 12)]', [json.store.book]]
            ];
            for (const [operator, path, expected] of opPathExpecteds) {
                it(`${operator} operator`, () => {
                    const result = jsonpath({
                        json,
                        path,
                        wrap: false,
                        eval: 'safe'
                    });
                    assert.deepEqual(result, expected);
                });
            }
        });
    });
});
