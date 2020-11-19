
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
    it('toPathArray', () => {
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$['store']['bicycle']['color']");
        assert.deepEqual(result, expected);
    });

    it('toPathArray (unnormalized)', () => {
        const expected = ['$', 'store', 'bicycle', 'color'];
        const result = jsonpath.toPathArray("$.store['bicycle'].color");
        assert.deepEqual(result, expected);
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

    it('toPathArray (cache issue)', () => {
        // We test here a bug where toPathArray did not return a clone of the cached
        // array. As a result, the evaluate call corrupted the cached value instead
        // of its local copy.
        
        // Make the path unique by including the test name 'cacheissue' in the path
        // because we do not want it to be in the cache already.
        const expected = ['$', 'store', 'bicycle', 'cacheissue'];
        const path = "$.store['bicycle'].cacheissue";
        const json = {};
        jsonpath({json, path, wrap: false});
        const result = jsonpath.toPathArray(path);
        assert.deepEqual(result, expected);
    });
});
