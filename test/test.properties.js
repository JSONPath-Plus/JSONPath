/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var json = {
  "test1": {
    "test2": {
      "test3.test4.test5": {
        "test7": "value"
      }
    }
  },
  "datafield": [
    {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
    {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}}
  ]
};

module.exports = testCase({

    // ============================================================================
    'Periods within properties': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = {"test7": "value"};
        var result = jsonpath({json: json, path: "$.test1.test2['test3.test4.test5']", wrap: false});
        test.deepEqual(expected, result);

        test.done();
    },

    // ============================================================================
    'At signs within properties': function (test) {
    // ============================================================================
        test.expect(2);
        var result = jsonpath({json: json, path: "$.datafield[?(@.tag=='035')]", wrap: false});
        test.deepEqual(json.datafield[0], result);
        result = jsonpath({json: json, path: "$.datafield[?(@['@tag']=='042')]", wrap: false});
        test.deepEqual(json.datafield[1], result);

        test.done();
    }

});
}());
