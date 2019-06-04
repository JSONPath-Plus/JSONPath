'use strict';

(function () {
const json = {
    '*': 'star',
    'rest': 'rest',
    'foo': 'bar'
};

const jsonMissingSpecial = {
    'rest': 'rest',
    'foo': 'bar'
};

describe('JSONPath - Escaping', function () {
    it('escape *', () => {
        let expected = ['star'];
        let result = jsonpath({json, path: "$['`*']"});
        assert.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$['`*']"});
        assert.deepEqual(expected, result);

        expected = ['star', 'rest'];
        result = jsonpath({json, path: "$[`*,rest]"});
        assert.deepEqual(expected, result);

        expected = ['star'];
        result = jsonpath({json, path: "$.`*"});
        assert.deepEqual(expected, result);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$.`*"});
        assert.deepEqual(expected, result);

        expected = ['star', 'rest', 'bar'];
        result = jsonpath({json, path: "$['*']"});
        assert.deepEqual(expected, result);

        expected = ['rest', 'bar'];
        result = jsonpath({json: jsonMissingSpecial, path: "$['*']"});
        assert.deepEqual(expected, result);
    });
});
}());
