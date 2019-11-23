'use strict';

describe('JSONPath - Array', function () {
    const json = {
        "store": {
            "book": {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": [8.95, 8.94, 8.93]
            },
            "books": [{
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": [8.95, 8.94, 8.93]
            }]
        }
    };

    it('get single', () => {
        const expected = json.store.book;
        const result = jsonpath({json, path: 'store.book', flatten: true, wrap: false});
        assert.deepEqual(expected, result);
    });

    it('get arr', () => {
        const expected = json.store.books;
        const result = jsonpath({json, path: 'store.books', flatten: true, wrap: false});
        assert.deepEqual(expected, result);
    });
});
