/**
 * @import {OtherTypeCallback} from '../src/jsonpath.js';
 */
describe('JSONPath - Type Operators', function () {
    // tests based on examples at https://goessner.net/articles/jsonpath/

    const json = {"store": {
        "book": [
            {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": [8.95, 8.94, 8.93]
            },
            {
                "category": "fiction",
                "author": "Evelyn Waugh",
                "title": "Sword of Honour",
                "price": 12.99
            },
            {
                "category": "fiction",
                "author": "Herman Melville",
                "title": "Moby Dick",
                "isbn": "0-553-21311-3",
                "price": 8.99
            },
            {
                "category": "fiction",
                "author": "J. R. R. Tolkien",
                "title": "The Lord of the Rings",
                "isbn": "0-395-19395-8",
                "price": 22.99
            }
        ],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }};

    it('@number()', () => {
        const expected = [8.95, 8.94, 8.93, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('@scalar()', () => {
        const expected = ["red", 19.95];
        const result = jsonpath({json, path: '$.store.bicycle..*@scalar()', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('@scalar() get falsey and avoid objects', () => {
        const jsonMixed = {
            nested: {
                a: 5,
                b: {},
                c: null,
                d: 'abc'
            }
        };
        const expected = [
            jsonMixed.nested.a, jsonMixed.nested.c, jsonMixed.nested.d
        ];
        const result = jsonpath({json: jsonMixed, path: '$..*@scalar()'});
        assert.deepEqual(result, expected);
    });

    it('@other()', () => {
        const expected = [12.99, 8.99, 22.99];

        /**
         *
         * @type {OtherTypeCallback}
         */
        function endsIn99 (val /* , path, parent, parentPropName */) {
            return (/\.99/u).test(String(val));
        }
        const result = jsonpath({json, path: '$.store.book..*@other()', flatten: true, otherTypeCallback: endsIn99});
        assert.deepEqual(result, expected);
    });

    it('throw with `@other` and no `otherTypeCallback`', function () {
        expect(() => {
            jsonpath({
                json: {a: new Date()}, path: '$..*@other()'
            });
        }).to.throw(
            TypeError,
            'You must supply an otherTypeCallback callback option ' +
            'with the @other() operator.'
        );
    });

    it('@object()', () => {
        const jsonMixed = {
            nested: {
                a: true,
                b: null,
                c: {
                    d: 7
                }
            }
        };
        const expected = [jsonMixed.nested, jsonMixed.nested.c];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@object()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@array()', () => {
        const jsonMixed = {
            nested: {
                a: [3, 4, 5],
                b: null,
                c: [
                    7, [8, 9]
                ]
            }
        };
        const expected = [
            jsonMixed.nested.a, jsonMixed.nested.c, jsonMixed.nested.c[1]
        ];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@array()'
        });
        assert.deepEqual(result, expected);
    });

    it('@boolean()', () => {
        const jsonMixed = {
            nested: {
                a: true,
                b: null,
                c: /** @type {[number, unknown[]]} */ ([
                    7, [false, 9]
                ])
            }
        };
        const expected = [jsonMixed.nested.a, jsonMixed.nested.c[1][0]];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@boolean()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@integer()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: null,
                c: /** @type {[number, unknown[]]} */ ([
                    42, [false, 73]
                ])
            }
        };
        const expected = [jsonMixed.nested.c[0], jsonMixed.nested.c[1][1]];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@integer()', flatten: true
        });
        assert.deepEqual(result, expected);
    });

    it('@nonFinite()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: -Infinity,
                c: /** @type {[number, unknown[]]} */ ([
                    42, [Infinity, 73, NaN]
                ])
            }
        };
        const expected = [
            jsonMixed.nested.b, jsonMixed.nested.c[1][0], jsonMixed.nested.c[1][2]
        ];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@nonFinite()'
        });
        assert.deepEqual(result, expected);
    });

    it('@null()', () => {
        const jsonMixed = {
            nested: {
                a: 50.7,
                b: null,
                c: [
                    42, [false, 73]
                ]
            }
        };
        const expected = [null];
        const result = jsonpath({
            json: jsonMixed, path: '$..*@null()'
        });
        assert.deepEqual(result, expected);
    });

    it('unwraps a lone type-operator result with `wrap: false`', () => {
        const result = jsonpath({
            json: {a: 1}, path: '$..*[@number()]', wrap: false
        });
        assert.deepEqual(result, 1);
    });

    it('still wraps multiple type-operator results with `wrap: false`', () => {
        const result = jsonpath({
            json: {a: 1, b: 2}, path: '$..*[@number()]', wrap: false
        });
        assert.deepEqual(result, [1, 2]);
    });

    it('adds no `hasArrExpr` key to `resultType: "all"` results', () => {
        const jsonSimple = {a: 1};
        const result = /** @type {object[]} */ (jsonpath({
            json: jsonSimple, path: '$..*[@number()]', resultType: 'all'
        }));
        assert.deepEqual(Object.keys(result[0]), [
            'path', 'value', 'parent', 'parentProperty', 'pointer'
        ]);
        assert.deepEqual(result, [{
            path: "$['a']",
            value: 1,
            parent: jsonSimple,
            parentProperty: 'a',
            pointer: '/a'
        }]);
    });

    describe('customTypes', () => {
        it('allows custom type operators', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {
                nested: {
                    a: blobObj,
                    b: null,
                    c: {
                        d: 7
                    }
                }
            };
            const expected = [blobObj];

            const result = jsonpath({
                json: jsonMixed,
                path: '$..*@blob()',
                flatten: true,
                customTypes: {
                    blob: (/** @type {any} */ val) => Object.prototype.toString.call(val) === '[object Blob]'
                }
            });
            assert.deepEqual(result, expected);
        });

        it('allows custom type operators via evaluate method', () => {
            // @ts-ignore -- Blob may not have construct signature in this TS environment
            const blobObj = typeof Blob !== 'undefined'
                ? new Blob(['test'])
                : {[Symbol.toStringTag]: 'Blob'};
            const jsonMixed = {a: blobObj};
            const expected = [blobObj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@blob()',
                flatten: true,
                customTypes: {
                    blob: (/** @type {any} */ val) => Object.prototype.toString.call(val) === '[object Blob]'
                }
            });
            assert.deepEqual(result, expected);
        });

        it('throws on unregistered custom type operator', () => {
            expect(() => {
                jsonpath({
                    json: {a: 1},
                    path: '$..*@unregisteredType()',
                    flatten: true,
                    customTypes: {
                        blob: (val) => Object.prototype.toString.call(val) === '[object Blob]'
                    }
                });
            }).to.throw(TypeError, 'Unknown value type unregisteredType');
        });
    });
});
