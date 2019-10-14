'use strict';

(function () {
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

describe('JSONPath - Eval', function () {
    it('multi statement eval', () => {
        const expected = json.store.books[0];
        const selector = '$..[?(' +
                     'var sum = @.price && @.price[0]+@.price[1];' +
                     'sum > 20;)]';
        const result = jsonpath({json, path: selector, wrap: false});
        assert.deepEqual(expected, result);
    });

    it('accessing current path', () => {
        const expected = json.store.books[1];
        const result = jsonpath({json, path: "$..[?(@path==\"$['store']['books'][1]\")]", wrap: false});
        assert.deepEqual(expected, result);
    });

    it('sandbox', () => {
        const expected = json.store.book;
        const result = jsonpath({
            json,
            sandbox: {category: 'reference'},
            path: "$..[?(@.category === category)]", wrap: false
        });
        assert.deepEqual(expected, result);
    });

    it('sandbox (with parsing function)', () => {
        const expected = json.store.book;
        const result = jsonpath({
            json,
            sandbox: {
                filter (arg) {
                    return arg.category === 'reference';
                }
            },
            path: "$..[?(filter(@))]", wrap: false
        });
        assert.deepEqual(expected, result);
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
                wrap: false
            });
            assert.deepEqual(expected, result);
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
                wrap: false
            });
            assert.deepEqual(expected, result);
        });
    });
});
}());
