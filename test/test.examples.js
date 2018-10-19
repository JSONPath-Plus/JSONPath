/* eslint-disable quotes */
(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

// tests based on examples at http://goessner.net/articles/jsonpath/

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

module.exports = testCase({
    'wildcards (with and without $.)' (test) {
        test.expect(2);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        let result = jsonpath({json, path: '$.store.book[*].author'});
        test.deepEqual(expected, result);
        result = jsonpath({json, path: 'store.book[*].author'});
        test.deepEqual(expected, result);

        test.done();
    },

    'all properties, entire tree' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: '$..author'});
        test.deepEqual(expected, result);

        test.done();
    },

    'all sub properties, single level' (test) {
        test.expect(1);
        const expected = [json.store.book, json.store.bicycle];
        const result = jsonpath({json, path: '$.store.*'});
        test.deepEqual(expected, result);

        test.done();
    },

    'all sub properties, entire tree' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0].price, books[1].price, books[2].price, books[3].price, json.store.bicycle.price];
        const result = jsonpath({json, path: '$.store..price'});
        test.deepEqual(expected, result);

        test.done();
    },

    'n property of entire tree' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[2]];
        const result = jsonpath({json, path: '$..book[2]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'last property of entire tree' (test) {
        test.expect(2);
        const books = json.store.book;
        const expected = [books[3]];
        let result = jsonpath({json, path: '$..book[(@.length-1)]'});
        test.deepEqual(expected, result);

        result = jsonpath({json, path: '$..book[-1:]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'range of property of entire tree' (test) {
        test.expect(2);
        const books = json.store.book;
        const expected = [books[0], books[1]];
        let result = jsonpath({json, path: '$..book[0,1]'});
        test.deepEqual(expected, result);

        result = jsonpath({json, path: '$..book[:2]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'categories and authors of all books' (test) {
        test.expect(1);
        const expected = ['reference', 'Nigel Rees'];
        const result = jsonpath({json, path: '$..book[0][category,author]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'filter all properties if sub property exists, of entire tree' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[2], books[3]];
        const result = jsonpath({json, path: '$..book[?(@.isbn)]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'filter all properties if sub property greater than of entire tree' (test) {
        test.expect(1);
        const books = json.store.book;
        const expected = [books[0], books[2]];
        const result = jsonpath({json, path: '$..book[?(@.price<10)]'});
        test.deepEqual(expected, result);

        test.done();
    },

    '@ as a scalar value' (test) {
        const expected = [json.store.bicycle.price].concat(json.store.book.slice(1).map(function (book) {
            return book.price;
        }));
        const result = jsonpath({json, path: "$..*[?(@property === 'price' && @ !== 8.95)]", wrap: false});
        test.deepEqual(expected, result);
        test.done();
    },

    'all properties of a JSON structure (beneath the root)' (test) {
        test.expect(1);
        const expected = [
            json.store,
            json.store.book,
            json.store.bicycle
        ];
        json.store.book.forEach((book) => {
            expected.push(book);
        });
        json.store.book.forEach(function (book) {
            Object.keys(book).forEach(function (p) {
                expected.push(book[p]);
            });
        });
        expected.push(json.store.bicycle.color);
        expected.push(json.store.bicycle.price);

        const result = jsonpath({json, path: '$..*'});
        test.deepEqual(expected, result);

        test.done();
    },

    'all parent components of a JSON structure' (test) {
        test.expect(1);
        const expected = [
            json,
            json.store,
            json.store.book
        ];
        json.store.book.forEach((book) => {
            expected.push(book);
        });
        expected.push(json.store.bicycle);

        const result = jsonpath({json, path: '$..'});
        test.deepEqual(expected, result);

        test.done();
    },

    'root' (test) {
        test.expect(1);
        const expected = json;
        const result = jsonpath({json, path: '$', wrap: false});
        test.deepEqual(expected, result);

        test.done();
    },

    'Custom operator: parent (caret)' (test) {
        test.expect(1);
        const expected = [json.store, json.store.book];
        const result = jsonpath({json, path: '$..[?(@.price>19)]^'});
        test.deepEqual(expected, result);

        test.done();
    },
    'Custom operator: property name (tilde)' (test) {
        test.expect(1);
        const expected = ['book', 'bicycle'];
        const result = jsonpath({json, path: '$.store.*~'});
        test.deepEqual(expected, result);

        test.done();
    },
    'Custom property @path' (test) {
        test.expect(1);
        const expected = json.store.book.slice(1);
        const result = jsonpath({json, path: '$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]'});
        test.deepEqual(expected, result);

        test.done();
    },
    'Custom property: @parent' (test) {
        test.expect(1);
        const expected = ['reference', 'fiction', 'fiction', 'fiction'];
        const result = jsonpath({json, path: '$..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category'});
        test.deepEqual(expected, result);

        test.done();
    },
    'Custom property: @property' (test) {
        test.expect(2);
        let expected = json.store.book.reduce(function (arr, book) {
            arr.push(book.author, book.title);
            if (book.isbn) { arr.push(book.isbn); }
            arr.push(book.price);
            return arr;
        }, []);
        let result = jsonpath({json, path: '$..book.*[?(@property !== "category")]'});
        test.deepEqual(expected, result);

        expected = json.store.book.slice(1);
        result = jsonpath({json, path: '$..book[?(@property !== 0)]'});
        test.deepEqual(expected, result);

        test.done();
    },
    'Custom property: @parentProperty' (test) {
        test.expect(2);
        let expected = [json.store.bicycle.color, json.store.bicycle.price];
        let result = jsonpath({json, path: '$.store.*[?(@parentProperty !== "book")]'});
        test.deepEqual(expected, result);

        expected = json.store.book.slice(1).reduce(function (result, book) {
            return result.concat(Object.keys(book).reduce(function (result, prop) {
                result.push(book[prop]);
                return result;
            }, []));
        }, []);
        result = jsonpath({json, path: '$..book.*[?(@parentProperty !== 0)]'});
        test.deepEqual(expected, result);

        test.done();
    },

    '@number()' (test) {
        test.expect(1);
        const expected = [8.95, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
