/*global require, module*/
/*eslint-disable quotes*/
(function () {'use strict';

var jsonpath = require('../'),
    testCase = require('nodeunit').testCase;

var json = {"store": {
    "book": [
      {"category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {"category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {"category": "reference",
        "author": "Nigel Rees",
        "application/vnd.wordperfect": "sotc.wpd",
        "title": "Sayings of the Century"
      },
      {"category": "reference",
        "author": "Nigel Rees",
        "application~vnd.wordperfect": "sotc.wpd",
        "title": "Sayings of the Century"
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
};

module.exports = testCase({
    'array': function (test) {
        var expected = [
            '/store/book/0/price',
            '/store/book/1/price',
            '/store/bicycle/price'
        ];
        var result = jsonpath({json: json, path: 'store..price', resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'single': function (test) {
        var expected = ['/store'];
        var result = jsonpath({json: json, path: 'store', resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'escape / as ~1': function (test) {
        var expected = ['/store/book/2/application~1vnd.wordperfect'];
        var result = jsonpath({json: json, path: "$['store']['book'][*]['application/vnd.wordperfect']", resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    },

    'escape ~ as ~0': function (test) {
        var expected = ['/store/book/3/application~0vnd.wordperfect'];
        var result = jsonpath({json: json, path: "$['store']['book'][*]['application~vnd.wordperfect']", resultType: 'pointer', flatten: true});
        test.deepEqual(expected, result);
        test.done();
    }
});
}());
