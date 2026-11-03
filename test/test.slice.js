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

    it('should return empty array for a slice with an explicit zero end', function () {
        const jsonWithChildren = {
            "name": "root",
            "children": [
                {a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}, {a: 6}
            ]
        };
        assert.deepEqual(jsonpath({
            json: jsonWithChildren,
            path: '$.children[:0]'
        }), []);
        assert.deepEqual(jsonpath({
            json: jsonWithChildren,
            path: '$.children[2:0]'
        }), []);
        assert.deepEqual(jsonpath({
            json: jsonWithChildren,
            path: '$.children[0:0]'
        }), []);
    });
});

describe('JSONPath - slice with a negative step', function () {
    const small = [0, 1, 2, 3];
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // From RFC 9535 section 2.3.4 and the JSONPath compliance test suite
    /** @type {[string, number[], number[]][]} */
    const cases = [
        ['$[::-1]', small, [3, 2, 1, 0]],
        ['$[:0:-1]', small, [3, 2, 1]],
        ['$[2::-1]', small, [2, 1, 0]],
        ['$[::-2]', small, [3, 1]],
        ['$[-1:-3:-1]', digits, [9, 8]],
        ['$[-1:-6:-2]', digits, [9, 7, 5]],
        ['$[-1:-7:-2]', digits, [9, 7, 5]],
        ['$[-1:1:-1]', digits, [9, 8, 7, 6, 5, 4, 3, 2]],
        ['$[7:-5:-1]', digits, [7, 6]],
        ['$[9:0:-1]', digits, [9, 8, 7, 6, 5, 4, 3, 2, 1]],
        ['$[113667776004:0:-1]', digits, [9, 8, 7, 6, 5, 4, 3, 2, 1]],
        ['$[3:-113667776004:-1]', digits, [3, 2, 1, 0]],
        ['$[-1:-10:-113667776004]', digits, [9]],
        ['$[::-1]', [], []]
    ];

    for (const [path, json, expected] of cases) {
        it(`should evaluate ${path} on ${JSON.stringify(json)}`, function () {
            assert.deepEqual(jsonpath({json, path}), expected);
        });
    }

    it('should reverse objects and report their paths', function () {
        const json = {children: [{a: 1}, {a: 2}, {a: 3}]};
        assert.deepEqual(
            jsonpath({json, path: '$.children[::-1].a'}), [3, 2, 1]
        );
        assert.deepEqual(
            jsonpath({json, path: '$.children[::-2]', resultType: 'path'}),
            ["$['children'][2]", "$['children'][0]"]
        );
    });

    it('should select nothing for a step of zero', function () {
        assert.deepEqual(jsonpath({json: digits, path: '$[1:2:0]'}), []);
        assert.deepEqual(jsonpath({json: digits, path: '$[::0]'}), []);
    });
});
