/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

// tests based on examples at http://goessner.net/articles/jsonpath/

var json = {"store": {
    "book": [
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      { "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      { "category": "fiction",
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
  }
};


module.exports = testCase({

    // ============================================================================
    'wildcards': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        var result = jsonpath({json: json, path: '$.store.book[*].author'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'all properties, entire tree': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        var result = jsonpath({json: json, path: '$..author'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'all sub properties, single level': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [json.store.book, json.store.bicycle];
        var result = jsonpath({json: json, path: '$.store.*'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'all sub properties, entire tree': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[0].price, books[1].price, books[2].price, books[3].price, json.store.bicycle.price];
        var result = jsonpath({json: json, path: '$.store..price'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'n property of entire tree': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[2]];
        var result = jsonpath({json: json, path: '$..book[2]'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'last property of entire tree': function(test) {
    // ============================================================================
        test.expect(2);
        var books = json.store.book;
        var expected = [books[3]];
        var result = jsonpath({json: json, path: '$..book[(@.length-1)]'});
        test.deepEqual(expected, result);

        result = jsonpath({json: json, path: '$..book[-1:]'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'range of property of entire tree': function(test) {
    // ============================================================================
        test.expect(2);
        var books = json.store.book;
        var expected = [books[0], books[1]];
        var result = jsonpath({json: json, path: '$..book[0,1]'});
        test.deepEqual(expected, result);

        result = jsonpath({json: json, path: '$..book[:2]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'categories and authors of all books': function(test) {
        test.expect(1);
        var expected = ['reference', 'Nigel Rees'];
        var result = jsonpath({json: json, path: '$..book[0][category,author]'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'filter all properties if sub property exists, of entire tree': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[2], books[3]];
        var result = jsonpath({json: json, path: '$..book[?(@.isbn)]'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'filter all properties if sub property greater than of entire tree': function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[0], books[2]];
        var result = jsonpath({json: json, path: '$..book[?(@.price<10)]'});
        test.deepEqual(expected, result);

        test.done();
    },

    'all parent components of a JSON structure': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [
          json,
          json.store,
          json.store.book
        ];
        json.store.book.forEach(function(book) { expected.push(book); });
        expected.push(json.store.bicycle);

        var result = jsonpath({json: json, path: '$..'});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'all properties of a JSON structure (beneath the root)': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [
          json.store,
          json.store.book,
          json.store.bicycle
        ];
        json.store.book.forEach(function(book) { expected.push(book); });
        json.store.book.forEach(function(book) { Object.keys(book).forEach(function(p) { expected.push(book[p]); });});
        expected.push(json.store.bicycle.color);
        expected.push(json.store.bicycle.price);

        var result = jsonpath({json: json, path: '$..*'});
        test.deepEqual(expected, result);

        test.done();
    },
    // ============================================================================
    'Custom operator: parent (caret)': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [json.store, json.store.book];
        var result = jsonpath({json: json, path: '$..[?(@.price>19)]^'});
        test.deepEqual(expected, result);

        test.done();

    },
    // ============================================================================
    'Custom operator: property name (tilde)': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['book', 'bicycle'];
        var result = jsonpath({json: json, path: '$.store.*~'});
        test.deepEqual(expected, result);

        test.done();

    },
    // ============================================================================
    'Custom property @path': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = json.store.book.slice(1);
        var result = jsonpath({json: json, path: '$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]'});
        test.deepEqual(expected, result);

        test.done();

    },
    // ============================================================================
    'Custom property: @parent': function(test) {
    // ============================================================================
        test.expect(1);
        var expected = ['reference', 'fiction', 'fiction', 'fiction'];
        var result = jsonpath({json: json, path: '$..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category'});
        test.deepEqual(expected, result);

        test.done();

    },
    // ============================================================================
    'Custom property: @property': function(test) {
    // ============================================================================
        test.expect(2);
        var expected = json.store.book.reduce(function (arr, book) {
            arr.push(book.author, book.title);
            if (book.isbn) {arr.push(book.isbn);}
            arr.push(book.price);
            return arr;
        }, []);
        var result = jsonpath({json: json, path: '$..book.*[?(@property !== "category")]'});
        test.deepEqual(expected, result);

        expected = json.store.book.slice(1);
        result = jsonpath({json: json, path: '$..book[?(@property !== 0)]'});
        test.deepEqual(expected, result);

        test.done();

    },
    // ============================================================================
    'Custom property: @parentProperty': function(test) {
    // ============================================================================
        test.expect(2);
        var expected = [json.store.bicycle.color, json.store.bicycle.price];
        var result = jsonpath({json: json, path: '$.store.*[?(@parentProperty !== "book")]'});
        test.deepEqual(expected, result);

        expected = json.store.book.slice(1).reduce(function (result, book) {
            return result.concat(Object.keys(book).reduce(function (result, prop) {
                result.push(book[prop]);
                return result;
            }, []));
        }, []);
        result = jsonpath({json: json, path: '$..book.*[?(@parentProperty !== 0)]'});
        test.deepEqual(expected, result);

        test.done();

    }

});

}());
