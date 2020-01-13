
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
        assert.strictEqual(jsonpath({json: {a: null}, path: '$.a', wrap: false}), null);
        assert.strictEqual(jsonpath({json: undefined, path: 'foo'}), undefined);
        assert.strictEqual(jsonpath({json: null, path: 'foo'}), undefined);
        assert.strictEqual(jsonpath({json: {}, path: 'foo'})[0], undefined);
        assert.strictEqual(jsonpath({json: {a: 'b'}, path: 'foo'})[0], undefined);
        assert.strictEqual(jsonpath({json: {a: 'b'}, path: 'foo'})[100], undefined);
    });

    it('test $ and @', () => {
        assert.strictEqual(jsonpath({json: t1, path: '`$'})[0], t1.$);
        assert.strictEqual(jsonpath({json: t1, path: 'a$a'})[0], t1.a$a);
        assert.strictEqual(jsonpath({json: t1, path: '`@'})[0], t1['@']);
        assert.strictEqual(jsonpath({json: t1, path: '$.`$.`@'})[0], t1.$['@']);
        assert.strictEqual(jsonpath({json: t1, path: '\\@'})[1], undefined);
    });
});
