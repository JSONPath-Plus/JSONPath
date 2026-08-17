
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
});
