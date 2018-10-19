/* eslint-disable quotes */

(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

// tests based on examples at http://goessner.net/articles/JsonPath/

const json = {"store": {
    "book": [
        {
            "category": "reference",
            "author": "Nigel Rees",
            "application/vnd.wordperfect": "sotc.wpd",
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
        }
    ],
    "bicycle": {
        "color": "red",
        "price": 19.95
    }
}};

module.exports = testCase({
    'dot notation' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: '$.store.book[*].author'});
        test.deepEqual(expected, result);

        test.done();
    },

    'bracket notation' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: "$['store']['book'][*]['author']"});
        test.deepEqual(expected, result);

        test.done();
    },

    'bracket notation without quotes' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: "$[store][book][*][author]"});
        test.deepEqual(expected, result);

        test.done();
    },

    'mixed notation' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: "$.store.book[*]['author']"});
        test.deepEqual(expected, result);

        test.done();
    },

    'bracket notation containing dots' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0]["application/vnd.wordperfect"]];
        const result = jsonpath({json, path: "$['store']['book'][*]['application/vnd.wordperfect']"});
        test.deepEqual(expected, result);

        test.done();
    },

    'mixed notation containing dots' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0]["application/vnd.wordperfect"]];
        const result = jsonpath({json, path: "$.store.book[*]['application/vnd.wordperfect']"});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
