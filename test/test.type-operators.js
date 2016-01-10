/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

// tests based on examples at http://goessner.net/articles/jsonpath/

var json = {"store": {
    "book": [
        {"category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": [8.95, 8.94, 8.93]
        },
        {"category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
        },
        {"category": "fiction",
            "author": "Herman Melville",
            "title": "Moby Dick",
            "isbn": "0-553-21311-3",
            "price": 8.99
        },
        {"category": "fiction",
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
    '@number()': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = [8.95, 8.94, 8.93, 12.99, 8.99, 22.99];
        var result = jsonpath({json: json, path: '$.store.book..*@number()', flatten: true});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    '@scalar()': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = ["red", 19.95];
        var result = jsonpath({json: json, path: '$.store.bicycle..*@scalar()', flatten: true});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    '@other()': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = [12.99, 8.99, 22.99];
        function endsIn99 (val, path, parent, parentPropName) {
            return !!val.toString().match(/\.99/);
        }
        var result = jsonpath({json: json, path: '$.store.book..*@other()', flatten: true, otherTypeCallback: endsIn99});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
