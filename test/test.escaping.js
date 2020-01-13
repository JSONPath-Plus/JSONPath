
describe('JSONPath - Escaping', function () {
    const json = {
        '*': 'star',
        'rest': 'rest',
        'foo': 'bar'
    };

    const jsonMissingSpecial = {
        'rest': 'rest',
        'foo': 'bar'
    };

    it('escape *', () => {
        let expected = ['star'];
        let result = jsonpath({json, path: "$['`*']"});
        assert.deepEqual(result, expected);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$['`*']"});
        assert.deepEqual(result, expected);

        expected = ['star', 'rest'];
        result = jsonpath({json, path: "$[`*,rest]"});
        assert.deepEqual(result, expected);

        expected = ['star'];
        result = jsonpath({json, path: "$.`*"});
        assert.deepEqual(result, expected);

        expected = [];
        result = jsonpath({json: jsonMissingSpecial, path: "$.`*"});
        assert.deepEqual(result, expected);

        expected = ['star', 'rest', 'bar'];
        result = jsonpath({json, path: "$['*']"});
        assert.deepEqual(result, expected);

        expected = ['rest', 'bar'];
        result = jsonpath({json: jsonMissingSpecial, path: "$['*']"});
        assert.deepEqual(result, expected);
    });
});
