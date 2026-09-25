
/**
 * @type {{
 *   assert: Chai.AssertStatic,
 *   jsonpath: (opts: any) => any
 * }}
 */
const testGlobals = globalThis;
/** @type {Chai.AssertStatic} */
const assertChai = testGlobals.assert;

const jsonpathFn = testGlobals.jsonpath;

describe('JSONPath - At and Dollar sign', function () {
    const t1 = {
        simpleString: "simpleString",
        "@": "@asPropertyName",
        "a$a": "$inPropertyName",
        "$": {
            "@": "withboth"
        },
        a: {
            b: {
                c: "food"
            }
        }
    };

    it('test undefined, null', () => {
        assertChai.isNull(jsonpathFn({json: {a: null}, path: '$.a', wrap: false}));
        assertChai.isUndefined(jsonpathFn({json: undefined, path: 'foo'}));
        assertChai.isUndefined(jsonpathFn({json: null, path: 'foo'}));
        assertChai.isUndefined(jsonpathFn({json: {}, path: 'foo'})[0]);
        assertChai.isUndefined(jsonpathFn({json: {a: 'b'}, path: 'foo'})[0]);
        assertChai.isUndefined(jsonpathFn({json: {a: 'b'}, path: 'foo'})[100]);
    });

    it('test $ and @', () => {
        assertChai.strictEqual(jsonpathFn({json: t1, path: '`$'})[0], t1.$);
        assertChai.strictEqual(jsonpathFn({json: t1, path: 'a$a'})[0], t1.a$a);
        assertChai.strictEqual(jsonpathFn({json: t1, path: '`@'})[0], t1['@']);
        assertChai.strictEqual(jsonpathFn({json: t1, path: '$.`$.`@'})[0], t1.$['@']);
        assertChai.isUndefined(jsonpathFn({json: t1, path: String.raw`\@`})[1]);
    });

    it('@ as false', () => {
        const json = {
            a: {
                b: false
            }
        };
        const expected = [false];
        const result = jsonpathFn({json, path: "$..*[?(@ === false)]", wrap: false});
        assertChai.deepEqual(result, expected);
    });

    it('@ as 0', function () {
        const json = {
            a: {
                b: 0
            }
        };
        const expected = [0];
        const result = jsonpathFn({json, path: "$.a[?(@property === 'b' && @ < 1)]", wrap: false});
        assertChai.deepEqual(result, expected);
    });

    it('bare @ adjacent to an operator (no whitespace)', () => {
        const json = [0, 1, 2, 3];
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@>1)]'}), [2, 3]);
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@<2)]'}), [0, 1]);
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@===2)]'}), [2]);
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@!==2)]'}), [0, 1, 3]);
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@&&@>1)]'}), [2, 3]);
        assertChai.deepEqual(jsonpathFn({json, path: '$[?(@||@===0)]'}), [0, 1, 2, 3]);
    });

    for (const evalType of ['safe', 'native']) {
        it(`bare @ in any position (${evalType})`, () => {
            const json = [0, 1, 2, 3];
            /** @param {string} path */
            const query = (path) => jsonpathFn({json, path, eval: evalType});
            assertChai.deepEqual(query('$[?(@)]'), [1, 2, 3]);
            assertChai.deepEqual(query('$[?(!@)]'), [0]);
            assertChai.deepEqual(query('$[?(@>1)]'), [2, 3]);
            assertChai.deepEqual(query('$[?(@-1>0)]'), [2, 3]);
            assertChai.deepEqual(query('$[?(@?@>2:false)]'), [3]);
            assertChai.deepEqual(query('$[?((@^1)===0)]'), [1]);
            assertChai.deepEqual(query('$[?([@][0]>1)]'), [2, 3]);
        });

        it(`@ inside string literals is left intact (${evalType})`, () => {
            const json = [
                {a: 'x@=y'}, {a: 'me@-host'}, {a: 'a@|b'},
                {a: 'x@.y'}, {a: 'foo @ bar'}, {a: '@'}, {a: "it's@"}
            ];
            /** @param {string} path */
            const query = (path) => jsonpathFn({json, path, eval: evalType});
            for (const {a} of json) {
                const quoted = a.includes("'")
                    ? `"${a}"`
                    : `'${a}'`;
                assertChai.deepEqual(
                    query(`$[?(@.a===${quoted})]`), [{a}], a
                );
            }
            assertChai.deepEqual(
                query(String.raw`$[?(@.a==='it\'s@')]`), [{a: "it's@"}]
            );
        });
    }
});
