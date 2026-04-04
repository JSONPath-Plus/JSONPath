
describe('JSONPath - toPointer', function () {
    it('toPointer - legacy string array', () => {
        const expected = '/store/bicycle/color';
        const result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color']);
        assert.deepEqual(result, expected);
    });

    it('toPointer - stripped special operators', () => {
        const expected = '/store/bicycle/color';
        let result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '^']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '@string()']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '~']);
        assert.deepEqual(result, expected);
    });

    it('toPointer - with token objects', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'store', escaped: false},
            {type: 'property', value: 'bicycle', escaped: false},
            {type: 'property', value: 'color', escaped: false}
        ];
        const result = jsonpath.toPointer(tokens);
        assert.strictEqual(result, '/store/bicycle/color');
    });

    it('toPointer - with numeric indices (legacy)', () => {
        const path = ['$', 'store', 'books', 0, 'title'];
        const result = jsonpath.toPointer(path);
        assert.strictEqual(result, '/store/books/0/title');
    });

    it('toPointer - with numeric indices (tokens)', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'store', escaped: false},
            {type: 'property', value: 'books', escaped: false},
            {type: 'index', value: 0},
            {type: 'property', value: 'title', escaped: false}
        ];
        const result = jsonpath.toPointer(tokens);
        assert.strictEqual(result, '/store/books/0/title');
    });

    it('toPointer - escaping special characters', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'a/b', escaped: false},
            {type: 'property', value: 'c~d', escaped: false}
        ];
        const result = jsonpath.toPointer(tokens);
        // JSON Pointer escapes ~ as ~0 and / as ~1
        assert.strictEqual(result, '/a~1b/c~0d');
    });

    it('toPointer - strips special operators from tokens', () => {
        const tokens = [
            {type: 'root'},
            {type: 'property', value: 'store', escaped: false},
            {type: 'wildcard'},
            {type: 'property', value: 'color', escaped: false},
            {type: 'parent'}
        ];
        const result = jsonpath.toPointer(tokens);
        // Wildcard and parent should be stripped
        assert.strictEqual(result, '/store/color');
    });

    it('toPointer - mixed legacy and token format', () => {
        const mixed = [
            {type: 'root'},
            'store',
            0,
            {type: 'property', value: 'name', escaped: false}
        ];
        const result = jsonpath.toPointer(mixed);
        assert.strictEqual(result, '/store/0/name');
    });
});
