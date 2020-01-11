
describe('JSONPath - toPath*', function () {
    it('toPathString', () => {
        const expected = "$['store']['bicycle']['color']";
        const result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color']);
        assert.strictEqual(expected, result);
    });
    it('toPathString (stripped)', () => {
        const expected = "$['store']['bicycle']['color']";
        let result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '^']);
        assert.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '@string()']);
        assert.deepEqual(expected, result);
        result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color', '~']);
        assert.deepEqual(expected, result);
    });
    it('toPathArray', () => {
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$['store']['bicycle']['color']");
        assert.deepEqual(expected, result);
    });

    it('toPathArray (unnormalized)', () => {
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$.store['bicycle'].color");
        assert.deepEqual(expected, result);
    });

    it('toPathArray (avoid cache reference issue #78)', () => {
        const originalPath = "$['foo']['bar']";
        const json = {foo: {bar: 'baz'}};
        const pathArr = jsonpath.toPathArray(originalPath);

        assert.strictEqual(pathArr.length, 3);

        // Shouldn't manipulate pathArr values
        jsonpath({
            json,
            path: originalPath,
            wrap: false,
            resultType: 'value'
        });

        assert.strictEqual(pathArr.length, 3);
        const path = jsonpath.toPathString(pathArr);

        assert.strictEqual(path, originalPath);
    });
});
