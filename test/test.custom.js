var jsonpath = require("../").eval
  , testCase = require('nodeunit').testCase

// tests based on examples at http://goessner.net/articles/JsonPath/

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
    "custom current": function(test) {
    // ============================================================================
        test.expect(1);
        var books = json.store.book;
        var expected = [books[2], books[3]];
        var result = jsonpath(json, "$..book[?(@current.isbn)]", {current: '@current'});
        test.deepEqual(expected, result);

        test.done();
    },


    "custom path": function (test) {
        var expected = json.store.book[1];
        var result = jsonpath(json, "$..[?(@mypath==\"$['store']['book'][1]\")]", {wrap: false, path: '@mypath'});
        test.deepEqual(expected, result);
        test.done();
    }


});
