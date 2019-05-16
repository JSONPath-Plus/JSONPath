'use strict';
const {testCase} = require('nodeunit');
const jsonpath = require('../').JSONPath;

(function () {
const json = {
    "test1": {
        "test2": {
            "test3.test4.test5": {
                "test7": "value"
            }
        }
    },
    "datafield": [
        {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
        {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}},
        {"@tag": "045", "045": "secret"}
    ]
};

module.exports = testCase({
    'Periods within properties' (test) {
        test.expect(1);
        const expected = {"test7": "value"};
        const result = jsonpath({json, path: "$.test1.test2['test3.test4.test5']", wrap: false});
        test.deepEqual(expected, result);

        test.done();
    },

    'At signs within properties' (test) {
        test.expect(3);
        let result = jsonpath({json, path: "$.datafield[?(@.tag=='035')]", wrap: false});
        test.deepEqual(json.datafield[0], result);
        result = jsonpath({json, path: "$.datafield[?(@['@tag']=='042')]", wrap: false});
        test.deepEqual(json.datafield[1], result);
        result = jsonpath({json, path: "$.datafield[2][(@['@tag'])]", wrap: false});
        test.deepEqual(json.datafield[2]['045'], result);

        test.done();
    }
});
}());
