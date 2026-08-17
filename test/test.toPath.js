
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

        assert.lengthOf(pathArr, 3);

        // Shouldn't manipulate pathArr values
        jsonpath({
            json,
            path: originalPath,
            wrap: false,
            resultType: 'value'
        });

        assert.lengthOf(pathArr, 3);
        const path = jsonpath.toPathString(pathArr);

        assert.strictEqual(path, originalPath);
    });

    it('toPathArray (cache issue)', () => {
        // We test here a bug where toPathArray did not return a clone of the
        // cached array. As a result, the evaluate call corrupted the cached
        // value instead of its local copy.

        // Make the path unique by including the test name 'cacheissue' in the
        // path because we do not want it to be in the cache already.
        const expected = ['$', 'store', 'bicycle', 'cacheissue'];
        const path = "$.store['bicycle'].cacheissue";
        const json = {};
        jsonpath({json, path, wrap: false});
        const result = jsonpath.toPathArray(path);
        assert.deepEqual(result, expected);
    });

    it('keeps path and script caches separate', () => {
        const json = [{b: true}];
        jsonpath({json, path: 'safeScript:@.b'});

        const result = jsonpath({
            json,
            path: '$[?(@.b)]',
            wrap: false
        });

        assert.deepEqual(result, json);
    });

    it('keeps script and path caches separate in reverse order', () => {
        const json = [{b: true}];
        jsonpath({json, path: '$[?(@.b)]', wrap: false});

        const result = jsonpath.toPathArray('safeScript:@.b');

        assert.deepEqual(result, ['safeScript:@', 'b']);
    });

    it('does not treat __proto__ as a cache property', () => {
        const expected = ['__proto__'];

        assert.deepEqual(jsonpath.toPathArray('__proto__'), expected);
        assert.deepEqual(jsonpath.toPathArray('__proto__'), expected);
        assert.deepEqual(jsonpath.toPathArray('$.a'), ['$', 'a']);
    });

    it('clears path and script caches', () => {
        let compileCount = 0;
        /* eslint-disable class-methods-use-this, jsdoc/require-jsdoc -- Test evaluator */
        class EvalClass {
            constructor () {
                compileCount++;
            }

            runInNewContext () {
                return true;
            }
        }
        /* eslint-enable class-methods-use-this, jsdoc/require-jsdoc -- End test evaluator */
        const json = [{b: true}];
        const options = {
            json,
            path: '$[?(@.b)]',
            eval: EvalClass
        };

        jsonpath(options);
        jsonpath(options);
        assert.strictEqual(compileCount, 1);

        jsonpath.clearCache();
        jsonpath(options);
        assert.strictEqual(compileCount, 2);
    });
});
