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
var json2 = {
    "name": "root",
    "children": [
        {"name": "child1", "children": [{"name": "child1_1"},{"name": "child1_2"}]},
        {"name": "child2", "children": [{"name": "child2_1"},{"name": "child2_2"}]},
        {"name": "child3", "children": [{"name": "child3_1"}]},
        {"name": "child4", "children": [{"name": "child4_1"}, {"name": "child4_3"}]}
    ]
};


module.exports = testCase({

    // ============================================================================
    "simple parent selection": function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [json.store];
        var result = jsonpath(json, "$.store.book^");
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    "parent selection with multiple matches": function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [json.store.book,json.store.book];
        var result = jsonpath(json, "$.store.book[1:3]^");
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    "select matchingsiblings via parent": function(test) {
    // ============================================================================
        test.expect(1);
        var expected = [{"name": "child1_2"}];
        var result = jsonpath(json2, "$..[?(@.name && @.name.match(/1_1$/))]^[?(@.name.match(/_2$/))]");
        test.deepEqual(expected, result);
        test.done();
    },

    // ============================================================================
    "parent parent parent": function(test) {
    // ============================================================================
        test.expect(1);
        var expected = json2.children[0].children;
        var result = jsonpath(json2, "$..[?(@.name && @.name.match(/1_1$/))].name^^", {flatten: true});
        test.deepEqual(expected, result);
        test.done();
    }

});
