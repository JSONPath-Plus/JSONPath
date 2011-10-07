var assert = require('assert'),
    fs = require('fs'),
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
    },

    'matches $.quotes[?(@.pricing.signature == "abc123")].journey.stages[*]': function() {
      var obj = JSON.parse(fs.readFileSync('test/fixtures/bing.json'));
      var expected = [
        {"id":"13", "carrier":"CO", "depInt":4,"arrInt":5,"duration":405,"redeye":false,"shortConnection":false,"longConnection":false,"depOrder":30534,"arrOrder":30759,"legs":[{"id":"14/0",
"orig":"LAN",
"dest":"ORD",
"dep":"2011-10-28T16:18",
"arr":"2011-10-28T16:18",
"duration":60,"carrier":"CO",
"flight":"6440"},{"id":"15/0",
"orig":"ORD",
"dest":"PDX",
"dep":"2011-10-28T17:50",
"arr":"2011-10-28T20:03",
"duration":253,"carrier":"CO",
"flight":"949"}],"connections":[{"duration":92,"short":false,"long":false}]},{"id":"16",
"carrier":"CO",
"depInt":2,"arrInt":5,"duration":509,"redeye":false,"shortConnection":false,"longConnection":false,"depOrder":32878,"arrOrder":33567,"legs":[{"id":"17/0",
"orig":"PDX",
"dest":"ORD",
"dep":"2011-10-30T07:22",
"arr":"2011-10-30T13:10",
"duration":228,"carrier":"CO",
"flight":"705"},{"id":"18/0",
"orig":"ORD",
"dest":"LAN",
"dep":"2011-10-30T16:59",
"arr":"2011-10-30T18:51",
"duration":52,"carrier":"CO",
"flight":"6046"}],"connections":[{"duration":229,"short":false,"long":false}]}];

      assert.deepEqual(jsonpath(obj[0], '$.quotes[?(@.pricing.signature == "A6tT8o3xQqjRVMhxbd7URwf2rj53c5Jjl88UXYblt5ZgyfxY.7eepx2sh3ZLMAO-RQKS8aatkf7aDxGybFSHXIfaxmSXlepOVwSjaZAMQx2Vn0kVawxAqk-fy9C1X1MfYSAmVBR1c05iblSMFrysgRVwIQ4UNr0daD7sfPUJbfqF2lwKG2aBab41sQ3LfZC2P4or9Fjxs0zwreDp3PBfGLT8RLqnrYaonWfqqA.HFbA4ScgOFU3YsUD36CSod1cu1aMhtbccJD9ZvTP5g6hXLMYq4XXQT4zwgAx3zp7kjEm2x.epFpYZ2MQ8yYrvN4e6R2BbN0jPfWV1QWirpfSh2IKUzsCV3b3b-FK1BTKYlQCzzXoZRUGu8uxg--pzE11wMBKyMF12OavJpx4TXdey56gLDXLVdYUvFbzswfv2YlxQ7k6cNugvO8WgZbaJmQbalCJ.9gnN0sBfryrTRC79lEaLOjsPiOCTnIyDcECDuf-C")].journey.stages[*]'), expected);
    },
  }
}).export(module);
