var assert = require('assert'),
    vows = require('vows'),
    JSONPath = require("../lib/jsonpath");

var jsonpath = JSONPath.eval;

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

var t1 = {
  simpleString: "simpleString",
  "@" : "@asPropertyName",
  "$" : "$asPropertyName",
  "a$a": "$inPropertyName",
  "$": {
    "@": "withboth",
  },
  a: {
    b: {
      c: "food"
    }
  }
};

vows.describe('JSONPath').addBatch({
  '.eval': {
    'requires a JSON object': function() {
      assert.throws(function() {
          JSONPath.eval();
        },
        /JSON/
      );
    },
    'requires an expression': function() {
      assert.throws(function() {
          JSONPath.eval({});
        },
        /expression/
      );
    },
    'requires a valid resultType': function() {
      assert.throws(function() {
          JSONPath.eval({}, 'yo', { resultType: 'foo' });
        },
        /resultType/
      );
    }
  },

  'tests based on examples at http://goessner.net/articles/JsonPath/': {
    "wildcards": function(test) {
        var books = json.store.book;
        var expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        var result = jsonpath(json, "$.store.book[*].author");
        assert.deepEqual(result, expected);
    },
    
    "all properties, entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        var result = jsonpath(json, "$..author");
        assert.deepEqual(result, expected);
    },
    
    "all sub properties, single level": function(test) {
        var expected = [json.store.book, json.store.bicycle];
        var result = jsonpath(json, "$.store.*");
        assert.deepEqual(result, expected);
    },

    "all sub properties, entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[0].price, books[1].price, books[2].price, books[3].price, json.store.bicycle.price];
        var result = jsonpath(json, "$.store..price");
        assert.deepEqual(result, expected);
    },
    
    "n property of entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[2]];
        var result = jsonpath(json, "$..book[2]");
        assert.deepEqual(result, expected);
    },

    "last property of entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[3]];
        var result = jsonpath(json, "$..book[(@.length-1)]");
        assert.deepEqual(result, expected);
        
        result = jsonpath(json, "$..book[-1:]"); 
        assert.deepEqual(result, expected);
    },
    
    "range of property of entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[0], books[1]];
        var result = jsonpath(json, "$..book[0,1]"); 
        assert.deepEqual(result, expected);
        
        result = jsonpath(json, "$..book[:2]"); 
        assert.deepEqual(result, expected);
    },
    
    "filter all properties if sub property exists, or entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[2], books[3]];
        var result = jsonpath(json, "$..book[?(@.isbn)]"); 
        assert.deepEqual(result, expected);
    },
    
    "filter all properties if sub property greater than of entire tree": function(test) {
        var books = json.store.book;
        var expected = [books[0], books[2]];
        var result = jsonpath(json, "$..book[?(@.price<10)]"); 
        assert.deepEqual(result, expected);
    },
    
    "all properties of a json structure": function(test) {
        var expected = [
          json.store,
          json.store.book,
          json.store.bicycle,
        ];
        json.store.book.forEach(function(book) { expected.push(book); });
        json.store.book.forEach(function(book) { Object.keys(book).forEach(function(p) { expected.push(book[p]); })});
        expected.push(json.store.bicycle.color);
        expected.push(json.store.bicycle.price);

        var result = jsonpath(json, "$..*"); 
        assert.deepEqual(result, expected);
    },

    "test undefined, null": function(test) {
        assert.throws(function() { jsonpath(undefined, "foo") });
        assert.throws(function() { jsonpath(null, "foo") });
        assert.equal(undefined, jsonpath({}, "foo")[0]);
        assert.equal(undefined, jsonpath({ a: "b" }, "foo")[0]);
        assert.equal(undefined, jsonpath({ a: "b" }, "foo")[100]);
    },

    "test $ and @": function(test) {
        assert.equal(t1["$"],   jsonpath(t1, "\$")[0]);
        assert.equal(t1["$"],   jsonpath(t1, "$")[0]);
        assert.equal(t1["a$a"], jsonpath(t1, "a$a")[0]);
        assert.equal(t1["@"],   jsonpath(t1, "\@")[0]);
        assert.equal(t1["@"],   jsonpath(t1, "@")[0]);
        assert.equal(t1["$"]["@"], jsonpath(t1, "$.$.@")[0]);
        assert.equal(undefined, jsonpath(t1, "\@")[1]);
    }
  }
}).export(module);
