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

    it('should return objects with slice step', function () {
        const jsonWithChildren = {
            "name": "root",
            "children": [
                {a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}, {a: 6}
            ]
        };
        const expected = [
            {a: 2}, {a: 4}, {a: 6}
        ];
        const result = jsonpath({
            json: jsonWithChildren,
            path: '$.children[1:6:2]'
        });
        assert.deepEqual(result, expected);
    });

    it('should return objects with negative end slice', function () {
        const jsonWithChildren = {
            "name": "root",
            "children": [
                {a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}, {a: 6}
            ]
        };
        const expected = [
            {a: 2}, {a: 3}
        ];
        const result = jsonpath({
            json: jsonWithChildren,
            path: '$.children[1:-3]'
        });
        assert.deepEqual(result, expected);
    });
});
