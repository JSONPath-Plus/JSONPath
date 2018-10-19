/* eslint-disable quotes */
(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

const json = {
    "store": {
        "book": {
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": [8.95, 8.94, 8.93]
        },
        "books": [
            {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": [8.95, 8.94, 8.93]
            }
        ]
    }
};

module.exports = testCase({
    'get single' (test) {
        const expected = json.store.book;
        const result = jsonpath({json, path: 'store.book', flatten: true, wrap: false});
        test.deepEqual(expected, result);
        test.done();
    },

    'get arr' (test) {
        const expected = json.store.books;
        const result = jsonpath({json, path: 'store.books', flatten: true, wrap: false});
        test.deepEqual(expected, result);
        test.done();
    }
});
}());
