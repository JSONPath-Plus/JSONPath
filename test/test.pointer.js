'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
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
            "category": "reference",
            "author": "Nigel Rees",
            "application/vnd.wordperfect": "sotc.wpd",
            "title": "Sayings of the Century"
        },
        {
            "category": "reference",
            "author": "Nigel Rees",
            "application~vnd.wordperfect": "sotc.wpd",
            "title": "Sayings of the Century"
        }],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }
};

module.exports = testCase({
    'array' (test) {
        const expected = [
            '/store/book/0/price',
            '/store/book/1/price',
            '/store/bicycle/price'
        ];
        const result = jsonpath({json, path: 'store..price', resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },
    'single' (test) {
        const expected = ['/store'];
        const result = jsonpath({json, path: 'store', resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'escape / as ~1' (test) {
        const expected = ['/store/book/2/application~1vnd.wordperfect'];
        const result = jsonpath({json, path: "$['store']['book'][*]['application/vnd.wordperfect']", resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'escape ~ as ~0' (test) {
        const expected = ['/store/book/3/application~0vnd.wordperfect'];
        const result = jsonpath({json, path: "$['store']['book'][*]['application~vnd.wordperfect']", resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    }
});
}());
