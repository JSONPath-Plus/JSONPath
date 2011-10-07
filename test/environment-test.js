var assert = require('assert'),
    vows = require('vows'),
    Environment = require("../lib/environment");

vows.describe('Environment').addBatch({
  '#match': {
    topic: new Environment({}, '', {}),

    'returns null if there is nothing to match against': function(env) {
      assert.isNull(env.match('something', null));
    },
    'matches the expression against the current object': function(env) {
      var obj = { isbn: 'abc123' };
      assert.equal(env.match('@.isbn', obj), 'abc123');
    }
  }
}).export(module);
