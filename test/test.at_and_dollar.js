'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

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

module.exports = testCase({
    'test undefined, null' (test) {
        test.expect(6);
        test.strictEqual(null, jsonpath({json: {a: null}, path: '$.a', wrap: false}));
        test.strictEqual(undefined, jsonpath({json: undefined, path: 'foo'}));
        test.strictEqual(undefined, jsonpath({json: null, path: 'foo'}));
        test.strictEqual(undefined, jsonpath({json: {}, path: 'foo'})[0]);
        test.strictEqual(undefined, jsonpath({json: {a: 'b'}, path: 'foo'})[0]);
        test.strictEqual(undefined, jsonpath({json: {a: 'b'}, path: 'foo'})[100]);
        test.done();
    },

    'test $ and @' (test) {
        test.expect(5);
        test.strictEqual(t1.$, jsonpath({json: t1, path: '`$'})[0]);
        test.strictEqual(t1.a$a, jsonpath({json: t1, path: 'a$a'})[0]);
        test.strictEqual(t1['@'], jsonpath({json: t1, path: '`@'})[0]);
        test.strictEqual(t1.$['@'], jsonpath({json: t1, path: '$.`$.`@'})[0]);
        test.strictEqual(undefined, jsonpath({json: t1, path: '\\@'})[1]);

        test.done();
    }
});
}());
