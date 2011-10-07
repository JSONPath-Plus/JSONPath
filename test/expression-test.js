var assert = require('assert'),
    vows = require('vows'),
    Expression = require("../lib/expression");

vows.describe('Expression').addBatch({
  '.execute': {
    'matches (@.length-1)': function() {
      var obj = [1,2,3];
      assert.equal(Expression.execute('(@.length-1)', obj), 2);
    },
    'matches @.isbn': function() {
      var obj = { isbn: 'abc123' };
      assert.equal(Expression.execute('@.isbn', obj), 'abc123');
    },
    'matches @.price<10 true': function() {
      var obj = { price: 5 };
      assert.isTrue(Expression.execute('@.price<10', obj));
    },
    'matches @.price<10 false': function() {
      var obj = { price: 10 };
      assert.isFalse(Expression.execute('@.price<10', obj));
    },
    'matches @.price==10 true': function() {
      var obj = { price: 10 };
      assert.isTrue(Expression.execute('@.price==10', obj));
    },
    'matches @.price==10 false': function() {
      var obj = { price: 11 };
      assert.isFalse(Expression.execute('@.price==10', obj));
    },
    'matches @.one.two true': function() {
      var obj = { one: { two: 3 } };
      assert.isTrue(Expression.execute('@.one.two==3', obj));
    },
    'matches @.one.two false': function() {
      var obj = { one: { two: 6 } };
      assert.isFalse(Expression.execute('@.one.two==3', obj));
    },
    'matches @.one.two undefined': function() {
      var obj = { one: { five: 6 } };
      assert.isFalse(Expression.execute('@.one.two==6', obj));
    },

    'throws a syntax error for invalid statements': function() {
      assert.throws(function() {
        Expression.execute('oogabooga', {});
      });
    }
  }
}).export(module);
