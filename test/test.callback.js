/* eslint-disable quotes */
(function () {
'use strict';

const jsonpath = require('../').JSONPath,
    testCase = require('nodeunit').testCase;

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
    'Callback' (test) {
        test.expect(1);

        const expected = ['value', json.store.bicycle, {path: "$['store']['bicycle']", value: json.store.bicycle, parent: json.store, parentProperty: 'bicycle'}];
        let result;
        function callback (data, type, fullData) {
            if (!result) {
                result = [];
            }
            result.push(type, data, fullData);
        }
        jsonpath({json, path: '$.store.bicycle', resultType: 'value', wrap: false, callback: callback});
        test.deepEqual(expected, result);

        test.done();
    }
});
}());
