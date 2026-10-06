import javascriptTypes from '../src/javascriptTypes.js';

describe('JSONPath - javascriptTypes', function () {
    it('allows custom JavaScript type operators', () => {
        [
            ['Generator', (function *() {
                // Testing
            }())],
            ['AsyncGenerator', (async function *() {
                // Testing
            }())],
            ['GeneratorFunction', function *() {
                // Testing
            }],
            ['AsyncGeneratorFunction', async function *() {
                // Testing
            }],
            ['Iterable', {
                [Symbol.iterator] () {
                    // Testing
                }
            }],
            ['AsyncIterable', {
                [Symbol.asyncIterator] () {
                    // Testing
                }
            }],
            ['Iterator', {
                next () {
                    // Testing
                }
            }]
        ].forEach(([name, obj]) => {
            const jsonMixed = {a: obj};
            const expected = [obj];
            const jp = jsonpath({autostart: false});
            const result = jp.evaluate({
                json: jsonMixed,
                path: '$..*@' + name + '()',
                flatten: true,
                customTypes: javascriptTypes
            });
            assert.deepEqual(result, expected);
        });
    });
});
