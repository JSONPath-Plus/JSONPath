/**
 * @import {JSONPathClass} from '../src/jsonpath.js';
 */

describe('JSONPath - API', function () {
    // tests based on examples at https://goessner.net/articles/jsonpath/
    const json = {
        "store": {
            "book": [{
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": 8.95
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
            }],
            "bicycle": {
                "color": "red",
                "price": 19.95
            }
        }
    };

    it('should test non-object argument of constructor', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        let result = jsonpath('$.store.book[*].author', json);
        assert.deepEqual(result, expected);
        result = jsonpath({json, path: 'store.book[*].author'});
        assert.deepEqual(result, expected);
    });

    it('should test array path of constructor', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        let result = jsonpath({path: ['$', 'store', 'book', '*', 'author'], json});
        assert.deepEqual(result, expected);
        result = jsonpath({json, path: 'store.book[*].author'});
        assert.deepEqual(result, expected);
    });

    it('should test defaults on manual `evaluate` with `autostart: false`', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        let jp = /** @type {JSONPathClass} */ (jsonpath({
            path: '$.store.book[*].author',
            json,
            autostart: false
        }));
        let result = jp.evaluate();
        assert.deepEqual(result, expected);
        jp = /** @type {JSONPathClass} */ (jsonpath({
            json,
            path: 'store.book[*].author',
            autostart: false
        }));
        result = jp.evaluate();
        assert.deepEqual(result, expected);
    });

    it('should test defaults with `evaluate` object and `autostart: false`', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        const result = jp.evaluate({
            json,
            path: '$.store.book[*].author',
            sandbox: {category: 'reference'},
            eval: false,
            flatten: true,
            wrap: false,
            resultType: 'value',
            callback () { /* */ },
            parent: null,
            parentProperty: null,
            otherTypeCallback () {
                return true;
            }
        });
        assert.deepEqual(result, expected);
    });

    it('should handle _handleCallback with undefined callback', () => {
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        // Test the defensive check in _handleCallback when callback is undefined
        const retObj = {
            path: "$['store']['book'][0]",
            value: json.store.book[0],
            parent: json.store.book,
            parentProperty: 0
        };
        // This should not throw and should return early
        assert.doesNotThrow(() => {
            jp._handleCallback(retObj, undefined, 'value');
        });
    });

    it('should handle _getPreferredOutput with string path and all resultType', () => {
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        jp.currResultType = 'all';
        const retObj = {
            path: "$['store']['book'][0]",
            value: json.store.book[0],
            parent: json.store.book,
            parentProperty: 0
        };

        const result = /** @type {{path: string, pointer: string}} */ (
            jp._getPreferredOutput(retObj)
        );
        assert.deepEqual(result.path, "$['store']['book'][0]");
        assert.deepEqual(result.pointer, '/store/book/0');
    });

    it('should return string path directly in _getPreferredOutput for path resultType', () => {
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        jp.currResultType = 'path';
        const retObj = {
            path: "$['store']['book'][0]",
            value: json.store.book[0],
            parent: json.store.book,
            parentProperty: 0
        };

        const result = /** @type {string} */ (jp._getPreferredOutput(retObj));
        assert.deepEqual(result, "$['store']['book'][0]");
    });

    it('should convert string path to array for pointer resultType', () => {
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        jp.currResultType = 'pointer';
        const retObj = {
            path: "$['store']['book'][0]",
            value: json.store.book[0],
            parent: json.store.book,
            parentProperty: 0
        };

        const result = /** @type {string} */ (jp._getPreferredOutput(retObj));
        assert.deepEqual(result, '/store/book/0');
    });

    it('should handle flatten: null in evaluate options', () => {
        const jp = /** @type {JSONPathClass} */ (jsonpath({
            autostart: false
        }));
        const result = jp.evaluate({
            json,
            path: '$.store.book[*].author',
            flatten: undefined
        });
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        assert.deepEqual(result, expected);
    });

    it('should handle nested filter with single result', () => {
        const testJson = {
            items: [
                {id: 1, nested: {value: 'a'}},
                {id: 2, nested: {value: 'b'}}
            ]
        };
        const result = jsonpath({
            json: testJson,
            path: '$.items[?(@.nested)]'
        });
        assert.deepEqual(result, [testJson.items[0], testJson.items[1]]);
    });

    it('should handle slice with single element', () => {
        const testJson = {items: [1]};
        const result = jsonpath({
            json: testJson,
            path: '$.items[0:1]'
        });
        assert.deepEqual(result, [1]);
    });

    it('should handle simple root path returning single object', () => {
        const testJson = {value: 42};
        const result = jsonpath({
            json: testJson,
            path: '$',
            wrap: false,
            resultType: 'all'
        });
        assert.deepEqual(result, {
            path: '$',
            value: testJson,
            parent: null,
            parentProperty: null,
            hasArrExpr: undefined,
            pointer: ''
        });
    });

    it('should handle otherTypeCallback returning null for @other()', () => {
        const testJson = {
            values: [1, 'text', true, null, {obj: 'value'}]
        };

        // @ts-expect-error Testing
        const result = jsonpath({
            json: testJson,
            path: '$.values[*]@other()',
            otherTypeCallback (val) {
                // Return null for objects to test the ?? false fallback
                if (typeof val === 'object' && val !== null) {
                    return null;
                }
                return false;
            }
        });
        assert.deepEqual(result, []);
    });

    it('should handle nested filter with property access', () => {
        const testJson = {
            items: [
                {id: 1, subs: [{val: 1}, {val: 2}]},
                {id: 2, subs: [{val: 3}]},
                {id: 3, subs: []}
            ]
        };
        // Nested filter: select items that have subs with val > 1
        const result = jsonpath({
            json: testJson,
            path: '$.items[?(@.subs[?(@.val > 1)])]'
        });
        // Items 0 and 1 both have subs with val > 1
        assert.deepEqual(result, [testJson.items[0], testJson.items[1]]);
    });

    it('should handle slice operation with multiple elements', () => {
        const testJson = {items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]};
        const result = jsonpath({
            json: testJson,
            path: '$.items[2:8:2]'
        });
        assert.deepEqual(result, [3, 5, 7]);
    });

    it('should handle parenthesis expression with undefined result', () => {
        const testJson = {a: {x: 1}, b: {y: 2}, c: {z: undefined}};
        const result = jsonpath({
            json: testJson,
            path: '$[(undefined)]'
        });
        assert.deepEqual(result, []);
    });

    it('should handle @path expression without predefined sandbox', () => {
        const testJson = {a: 1, b: 2};
        // Don't provide sandbox, let it be created on demand
        const result = jsonpath({
            json: testJson,
            path: '$[?(@path == "$[\'a\']")]'
        });
        assert.deepEqual(result, [1]);
    });
});
