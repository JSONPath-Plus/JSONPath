var assert = require('assert'),
    vows = require('vows'),
    Environment = require("../lib/environment");

vows.describe('JSONPath').addBatch({
  '#match': {
    topic: new Environment({}, '', {}),

    'matches (@.length-1)': function(env) {
      var obj = [1,2,3];
      assert.equal(env.match('(@.length-1)', obj), 2);
    },
    'matches @.isbn': function(env) {
      var obj = { isbn: 'abc123' };
      assert.equal(env.match('@.isbn', obj), 'abc123');
    },
    'matches @.price<10 true': function(env) {
      var obj = { price: 5 };
      assert.isTrue(env.match('@.price<10', obj));
    },
    'matches @.price<10 false': function(env) {
      var obj = { price: 10 };
      assert.isFalse(env.match('@.price<10', obj));
    },
    'matches @.price==10 true': function(env) {
      var obj = { price: 10 };
      assert.isTrue(env.match('@.price==10', obj));
    },
    'matches @.price==10 false': function(env) {
      var obj = { price: 11 };
      assert.isFalse(env.match('@.price==10', obj));
    },
    'returns null if there is nothing to match against': function(env) {
      assert.isNull(env.match('something', null));
    },
    'throws a syntax error for invalid statements': function(env) {
      assert.throws(function() {
        env.match('oogabooga', {});
      });
    }
  }
}).export(module);
