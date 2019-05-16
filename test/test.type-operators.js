'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
// tests based on examples at http://goessner.net/articles/jsonpath/

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
}
};

module.exports = testCase({
    '@number()' (test) {
        test.expect(1);
        const expected = [8.95, 8.94, 8.93, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        test.deepEqual(expected, result);

        test.done();
    },

    '@scalar()' (test) {
        test.expect(1);
        const expected = ["red", 19.95];
        const result = jsonpath({json, path: '$.store.bicycle..*@scalar()', flatten: true});
        test.deepEqual(expected, result);

        test.done();
    },

    '@other()' (test) {
        test.expect(1);
        const expected = [12.99, 8.99, 22.99];
        function endsIn99 (val, path, parent, parentPropName) {
            return Boolean(val.toString().match(/\.99/));
        }
        const result = jsonpath({json, path: '$.store.book..*@other()', flatten: true, otherTypeCallback: endsIn99});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
