describe('JSONPath - slice', function () {
    const json = {
        "name": "root",
        "children": {}
    };
    it('should return empty array if slicing non-array', function () {
        const expected = undefined;
        const result = jsonpath({json, path: '$.children[1:3]', wrap: false});
        assert.deepEqual(result, expected);
    });
});
