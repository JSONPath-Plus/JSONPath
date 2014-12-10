var JSONPath = require('../'),
    testCase = require('nodeunit').testCase


var json = {
  "test1": {
    "test2": {
      "test3.test4.test5": {
        "test7": "value"
      }
    }
  }
};


module.exports = testCase({

    // ============================================================================
    'Periods within properties': function (test) {
        // ============================================================================
        test.expect(1);
        var expected = {"test7": "value"};
        var result = JSONPath({json: json, path: "$.test1.test2['test3.test4.test5']", flatten: true});
        test.deepEqual(expected, result);

        test.done();
    }
});
