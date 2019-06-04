'use strict';

(function () {
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

describe('JSONPath - At and Dollar sign', function () {
    it('test undefined, null', () => {
        assert.strictEqual(null, jsonpath({json: {a: null}, path: '$.a', wrap: false}));
        assert.strictEqual(undefined, jsonpath({json: undefined, path: 'foo'}));
        assert.strictEqual(undefined, jsonpath({json: null, path: 'foo'}));
        assert.strictEqual(undefined, jsonpath({json: {}, path: 'foo'})[0]);
        assert.strictEqual(undefined, jsonpath({json: {a: 'b'}, path: 'foo'})[0]);
        assert.strictEqual(undefined, jsonpath({json: {a: 'b'}, path: 'foo'})[100]);
    });

    it('test $ and @', () => {
        assert.strictEqual(t1.$, jsonpath({json: t1, path: '`$'})[0]);
        assert.strictEqual(t1.a$a, jsonpath({json: t1, path: 'a$a'})[0]);
        assert.strictEqual(t1['@'], jsonpath({json: t1, path: '`@'})[0]);
        assert.strictEqual(t1.$['@'], jsonpath({json: t1, path: '$.`$.`@'})[0]);
        assert.strictEqual(undefined, jsonpath({json: t1, path: '\\@'})[1]);
    });
});
}());
