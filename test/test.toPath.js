/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;


var json = {"store": {
    "book": [
      { "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      { "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      { "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      { "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
};


module.exports = testCase({

    // ============================================================================
    'toPathString': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = "$['store']['bicycle']['color']";
        var result = jsonpath.toPathString(['$', 'store', 'bicycle', 'color']);
        test.equal(expected, result);

        test.done();
    },
    
        // ============================================================================
    'toPathArray': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = ['$', 'store', 'bicycle', 'color'];
        var result = jsonpath.toPathArray("$['store']['bicycle']['color']");
        test.deepEqual(expected, result);

        test.done();
    },
    
    'toPathArray (unnormalized)': function (test) {
    // ============================================================================
        test.expect(1);
        var expected = ['$', 'store', 'bicycle', 'color'];
        var result = jsonpath.toPathArray("$.store['bicycle'].color");
        test.deepEqual(expected, result);

        test.done();
    }
});

}());
