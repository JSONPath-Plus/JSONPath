
describe('JSONPath - toPath*', function () {
    it('toPathString', () => {
        const expected = "$['store']['bicycle']['color']";
        const result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color']);
        assert.strictEqual(result, expected);
    });
    it('toPathString (stripped)', () => {
        const expected = "$['store']['bicycle']['color']";
        let result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '^']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '@string()']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '~']);
        assert.deepEqual(result, expected);
    });
    it('toPathParts - normalized bracket notation', () => {
        const result = jsonpath.toPathParts("$['store']['bicycle']['color']");
        // Hybrid tokens: quoted but not backtick-escaped properties are strings
        assert.deepEqual(result, [
            {type: 'root'},
            'store',
            'bicycle',
            'color'
        ]);
    });

    it('toPathParts - unnormalized mixed notation', () => {
        const result = jsonpath.toPathParts("$.store['bicycle'].color");
        // Hybrid tokens: simple properties are strings
        assert.deepEqual(result, [
            {type: 'root'},
            'store',
            'bicycle',
            'color'
        ]);
    });

    it('toPathParts - does not mutate during evaluate', () => {
        const originalPath = "$['foo']['bar']";
        const json = {foo: {bar: 'baz'}};
        const pathParts = jsonpath.toPathParts(originalPath);

        assert.strictEqual(pathParts.length, 3);

        // Shouldn't manipulate pathParts values
        jsonpath({
            json,
            path: originalPath,
            wrap: false,
            resultType: 'value'
        });

        // Should still have same structure
        assert.strictEqual(pathParts.length, 3);
        const path = jsonpath.toPathString(pathParts);
        assert.strictEqual(path, originalPath);
    });

    it('toPathParts - cache returns clones', () => {
        // Verify that toPathParts returns a clone of the cached tokens,
        // not the cached reference itself
        const path = "$.store['bicycle'].cachetest";
        const json = {};

        // Prime the cache
        jsonpath({json, path, wrap: false});

        // Get from cache
        const result = jsonpath.toPathParts(path);

        assert.strictEqual(result.length, 4);
        assert.strictEqual(result[0].type, 'root');
        // Hybrid tokens: simple properties are strings
        assert.strictEqual(result[1], 'store');
        assert.strictEqual(result[2], 'bicycle');
        assert.strictEqual(result[3], 'cachetest');
    });

    // New token-based parser tests
    it('toPathParts - basic path', () => {
        const result = jsonpath.toPathParts('$.store.book[0]');
        // Hybrid tokens: simple properties are strings, indices are numbers
        assert.deepEqual(result, [
            {type: 'root'},
            'store',
            'book',
            0
        ]);
    });

    it('toPathParts - wildcard', () => {
        const result = jsonpath.toPathParts('$.store.*');
        // Hybrid tokens: simple property 'store' is a string
        assert.deepEqual(result, [
            {type: 'root'},
            'store',
            {type: 'wildcard'}
        ]);
    });

    it('toPathParts - escaped property', () => {
        const result = jsonpath.toPathParts('$.`*');
        // Escaped property stays as object (metadata needed)
        assert.deepEqual(result, [
            {type: 'root'},
            {type: 'property', value: '*', escaped: true}
        ]);
    });

    it('toPathParts - descent', () => {
        const result = jsonpath.toPathParts('$..book');
        // Hybrid tokens: simple property 'book' is a string
        assert.deepEqual(result, [
            {type: 'root'},
            {type: 'descent'},
            'book'
        ]);
    });

    it('toPathParts - filter', () => {
        const result = jsonpath.toPathParts('$.store.book[?(@.price<10)]');
        assert.strictEqual(result[0].type, 'root');
        // Hybrid tokens: simple properties are strings
        assert.strictEqual(result[1], 'store');
        assert.strictEqual(result[2], 'book');
        assert.strictEqual(result[3].type, 'filter');
        assert.strictEqual(result[3].expression, '@.price<10');
    });

    it('toPathParts - slice', () => {
        const result = jsonpath.toPathParts('$.store.book[0:2]');
        assert.deepEqual(result[3], {
            type: 'slice',
            start: 0,
            end: 2,
            step: null,
            raw: '0:2'
        });
    });

    it('toPathParts - parent selector', () => {
        const result = jsonpath.toPathParts('$.store.book[0]^');
        assert.strictEqual(result.at(-1).type, 'parent');
    });

    it('toPathParts - multi-index', () => {
        const result = jsonpath.toPathParts('$.store.book[0,1,2]');
        assert.deepEqual(result[3], {
            type: 'multiProperty',
            properties: [0, 1, 2]
        });
    });

    it('toPathParts - cache cloning', () => {
        // Verify that toPathParts returns a clone, not the cached reference
        const path = '$.unique.cache.test';
        const result1 = jsonpath.toPathParts(path);
        const result2 = jsonpath.toPathParts(path);

        // Should be equal but not the same reference
        assert.deepEqual(result1, result2);
        assert.notStrictEqual(result1, result2);

        // Mutating one shouldn't affect the other
        result1.push({type: 'property', value: 'mutated', escaped: false});
        assert.notDeepEqual(result1, result2);
    });

    it('toPathString - with token objects', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'store', escaped: false},
            {type: 'index', value: 0},
            {type: 'property', value: 'name', escaped: false}
        ];
        const result = jsonpath.toPathString(tokens);
        assert.strictEqual(result, "$['store'][0]['name']");
    });

    it('toPathString - with numeric indices in path', () => {
        const path = ['$', 'store', 0, 'name'];
        const result = jsonpath.toPathString(path);
        assert.strictEqual(result, "$['store'][0]['name']");
    });

    it('toPathString - with mixed tokens and legacy strings', () => {
        const mixed = [
            {type: 'root'},
            'store',
            0,
            {type: 'property', value: 'name', escaped: false}
        ];
        const result = jsonpath.toPathString(mixed);
        assert.strictEqual(result, "$['store'][0]['name']");
    });

    // Comprehensive edge case tests for toPathParts
    it('toPathParts - empty string property', () => {
        const result = jsonpath.toPathParts('');
        // Hybrid token: empty property is a string
        assert.deepEqual(result, ['']);
    });

    it('toPathParts - dynamic property', () => {
        const result = jsonpath.toPathParts("$[(@.length-1)]");
        assert.strictEqual(result[1].type, 'dynamic');
        assert.strictEqual(result[1].expression, '@.length-1');
    });

    it('toPathParts - type operators', () => {
        const result = jsonpath.toPathParts('$..*@string()');
        assert.strictEqual(result.at(-1).type, 'typeOperator');
        assert.strictEqual(result.at(-1).valueType, 'string');
    });

    it('toPathParts - property name operator', () => {
        const result = jsonpath.toPathParts('$.store.book[0]~');
        assert.strictEqual(result.at(-1).type, 'propertyName');
    });

    it('toPathParts - complex slice', () => {
        const result = jsonpath.toPathParts('$.books[1:5:2]');
        assert.deepEqual(result.at(-1), {
            type: 'slice',
            start: 1,
            end: 5,
            step: 2,
            raw: '1:5:2'
        });
    });

    it('toPathParts - slice with negative indices', () => {
        const result = jsonpath.toPathParts('$.books[-3:-1]');
        assert.deepEqual(result.at(-1), {
            type: 'slice',
            start: -3,
            end: -1,
            step: null,
            raw: '-3:-1'
        });
    });

    it('toPathParts - slice with open ends', () => {
        const result = jsonpath.toPathParts('$.books[:5]');
        assert.deepEqual(result.at(-1), {
            type: 'slice',
            start: null,
            end: 5,
            step: null,
            raw: ':5'
        });
    });

    it('toPathParts - multi-property strings', () => {
        const result = jsonpath.toPathParts("$['name','age','city']");
        assert.deepEqual(result[1], {
            type: 'multiProperty',
            properties: ['name', 'age', 'city'],
            escaped: [false, false, false]
        });
    });

    it('toPathParts - unquoted multi-property', () => {
        const result = jsonpath.toPathParts('$[name,age,city]');
        assert.deepEqual(result[1], {
            type: 'multiProperty',
            properties: ['name', 'age', 'city'],
            escaped: [false, false, false]
        });
    });

    it('toPathParts - nested filter', () => {
        const result = jsonpath.toPathParts('$.store.book[?(@.price<10)]');
        const filterToken = result.find((t) => t.type === 'filter');
        assert.strictEqual(filterToken.expression, '@.price<10');
    });

    it('toPathParts - complex nested filter', () => {
        const result = jsonpath.toPathParts('$..book[?(@.author.match(/Tolkien/))]');
        const filterToken = result.find((t) => t.type === 'filter');
        assert.strictEqual(filterToken.expression, '@.author.match(/Tolkien/)');
    });

    it('toPathParts - wildcard in brackets', () => {
        const result = jsonpath.toPathParts("$['*']");
        // Unescaped wildcard in brackets
        assert.strictEqual(result[1].type, 'wildcard');
    });

    it('toPathParts - escaped wildcard in brackets', () => {
        const result = jsonpath.toPathParts("$['`*']");
        // Backtick-escaped wildcard should be property
        assert.deepEqual(result[1], {
            type: 'property',
            value: '*',
            escaped: true
        });
    });

    it('toPathParts - backslash escapes in quotes', () => {
        const result = jsonpath.toPathParts(String.raw`$['a\'b']`);
        // Hybrid tokens: quoted but not backtick-escaped is a string
        assert.strictEqual(result[1], "a'b");
    });

    it('toPathParts - special characters in property', () => {
        const result = jsonpath.toPathParts("$['prop.with.dots']");
        // Hybrid tokens: quoted but not backtick-escaped is a string
        assert.strictEqual(result[1], 'prop.with.dots');
    });

    it('toPathParts - implicit root for identifiers', () => {
        const result = jsonpath.toPathParts('store');
        assert.strictEqual(result[0].type, 'root');
        // Hybrid tokens: simple property is a string
        assert.strictEqual(result[1], 'store');
    });

    it('toPathParts - parent selector at root', () => {
        const result = jsonpath.toPathParts('^');
        // Hybrid tokens: empty property is a string
        assert.deepEqual(result, [
            '',
            {type: 'parent'}
        ]);
    });

    it('toPathParts - multiple parent selectors', () => {
        const result = jsonpath.toPathParts('$.a.b.c^^');
        assert.strictEqual(result.at(-1).type, 'parent');
        assert.strictEqual(result.at(-2).type, 'parent');
    });

    it('toPathParts - dot bracket descent', () => {
        const result = jsonpath.toPathParts('$.[?(@.price)]');
        assert.strictEqual(result[1].type, 'descent');
        assert.strictEqual(result[2].type, 'filter');
    });

    it('toPathString - all token types', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'store', escaped: false},
            {type: 'wildcard'},
            {type: 'index', value: 0},
            {type: 'slice', start: 0, end: 5, step: null, raw: '0:5'},
            {type: 'filter', expression: '@.price<10'},
            {type: 'dynamic', expression: '@.name'},
            {type: 'descent'}, // Should be skipped in output
            {type: 'parent'}, // Should be skipped in output
            {type: 'propertyName'} // Should be skipped in output
        ];
        const result = jsonpath.toPathString(tokens);
        // Special operators (descent, parent, propertyName) should not appear in output
        assert.ok(result.includes("['store']"));
        assert.ok(result.includes('[*]'));
        assert.ok(result.includes('[0]'));
        assert.ok(result.includes('[0:5]'));
        assert.ok(result.includes('[?(@.price<10)]'));
        assert.ok(result.includes('[(@.name)]'));
    });

    it('toPathString - typeOperator token', () => {
        const tokens = [
            {type: 'root'},
            {type: 'typeOperator', valueType: 'string'}
        ];
        const result = jsonpath.toPathString(tokens);
        assert.strictEqual(result, '$@string()');
    });

    it('toPathString - multiProperty token', () => {
        const tokens = [
            {type: 'root'},
            {type: 'multiProperty', properties: ['a', 'b', 'c']}
        ];
        const result = jsonpath.toPathString(tokens);
        assert.strictEqual(result, "$['a','b','c']");
    });

    // Error handling tests for improved coverage
    it('toPathParts - @ as property name (without parentheses)', () => {
        // $@string is valid - @ without () is treated as a property name
        const result = jsonpath.toPathParts('$@string');
        assert.strictEqual(result[0].type, 'root');
        // Hybrid token: simple property is a string
        assert.strictEqual(result[1], '@string');
    });

    it('toPathParts - whitespace is skipped at top level', () => {
        const result = jsonpath.toPathParts('$  [0]  .store');
        assert.strictEqual(result[0].type, 'root');
        // Hybrid token: simple index is a number
        assert.strictEqual(result[1], 0);
        // Hybrid token: simple property is a string
        assert.strictEqual(result[2], 'store');
    });

    it('toPathParts - unexpected character', () => {
        assert.throws(() => {
            jsonpath.toPathParts('$#invalid');
        }, /Unexpected character '#'/);
    });

    it('toPathParts - unterminated string in bracket', () => {
        assert.throws(() => {
            jsonpath.toPathParts("$['property");
        }, /Unterminated string/);
    });

    it('toPathParts - unterminated string in multi-property', () => {
        assert.throws(() => {
            jsonpath.toPathParts("$['a','b','c");
        }, /Unterminated string/);
    });

    it('toPathParts - unexpected character after @', () => {
        assert.throws(() => {
            jsonpath.toPathParts('$@number(');
        }, /Unexpected character/);
    });
});
