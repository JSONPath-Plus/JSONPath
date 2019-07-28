'use strict';

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

describe('JSONPath - Type Operators', function () {
    it('@number()', () => {
        const expected = [8.95, 8.94, 8.93, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        assert.deepEqual(expected, result);
    });

    it('@scalar()', () => {
        const expected = ["red", 19.95];
        const result = jsonpath({json, path: '$.store.bicycle..*@scalar()', flatten: true});
        assert.deepEqual(expected, result);
    });

    it('@other()', () => {
        const expected = [12.99, 8.99, 22.99];
        /**
         *
         * @param {Any} val
         * @param {string} path
         * @param {PlainObject|GenericArray} parent
         * @param {string} parentPropName
         * @returns {boolean}
         */
        function endsIn99 (val, path, parent, parentPropName) {
            return Boolean(val.toString().match(/\.99/u));
        }
        const result = jsonpath({json, path: '$.store.book..*@other()', flatten: true, otherTypeCallback: endsIn99});
        assert.deepEqual(expected, result);
    });
});
}());
