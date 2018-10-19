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

module.exports = testCase({
    'multi statement eval' (test) {
        const expected = json.store.books[0];
        const selector = '$..[?(' +
                     'var sum = @.price && @.price[0]+@.price[1];' +
                     'sum > 20;)]';
        const result = jsonpath({json, path: selector, wrap: false});
        test.deepEqual(expected, result);
        test.done();
    },

    'accessing current path' (test) {
        const expected = json.store.books[1];
        const result = jsonpath({json, path: "$..[?(@path==\"$['store']['books'][1]\")]", wrap: false});
        test.deepEqual(expected, result);
        test.done();
    },

    'sandbox' (test) {
        const expected = json.store.book;
        const result = jsonpath({
            json,
            sandbox: {category: 'reference'},
            path: "$..[?(@.category === category)]", wrap: false
        });
        test.deepEqual(expected, result);
        test.done();
    },

    'sandbox (with parsing function)' (test) {
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
        test.deepEqual(expected, result);
        test.done();
    }
});
}());
