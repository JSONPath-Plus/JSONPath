# JSONPath [![build status](https://secure.travis-ci.org/s3u/JSONPath.png)](http://travis-ci.org/s3u/JSONPath)

Analyse, transform, and selectively extract data from JSON documents (and JavaScript objects).

# Install
    
    npm install JSONPath

# Usage

In node.js:

```js
var JSONPath = require('JSONPath');
JSONPath({json: obj, path: path});
```

For browser usage you can directly include `lib/jsonpath.js`, no browserify
magic necessary:

```html
<script src="lib/jsonpath.js"></script>
<script>
    JSONPath({json: obj, path: path});
</script>
```

An alternative syntax is available as:

```js
JSONPath(options, obj, path);
```

The following format is now deprecated:

```js
jsonPath.eval(options, obj, path);
```

Other properties that can be supplied for
options (the first argument) include:

- ***autostart*** (**default: true**) - If this is supplied as `false`, one may call the `evaluate` method manually as needed.
- ***flatten*** (**default: false**) - Whether the returned array of results will be flattened to a single dimension array.
- ***resultType*** (**default: "value"**) - Can be case-insensitive form of "value" or "path" to determine whether to return results as the values of the found items or as their absolute paths.
- ***sandbox*** (**default: An empty object **) - Key-value map of variables to be available to code evaluations such as filtering expressions. (Note that the current path and value will also be available; see the Syntax section for details.)
- ***wrap*** (**default: true**) - Whether or not to wrap the results in an array. If `wrap` is set to false, and no results are found, `undefined` will be returned (as opposed to an empty array with `wrap` set to true). If `wrap` is set to false and a single result is found, that result will be the only item returned (not within an array). An array will still be returned if multiple results are found, however.

Syntax with examples
--------

Given the following JSON, taken from http://goessner.net/articles/JsonPath/ :

```json
{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      {
        "category": "fiction",
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
}
```


XPath               | JSONPath               | Result                                | Notes
------------------- | ---------------------- | ------------------------------------- | -----
/store/book/author  | $.store.book[*].author | the authors of all books in the store |
//author            | $..author              | all authors                           |
/store/*            | $.store.*              | all things in store, which are some books and a red bicycle.|
/store//price       | $.store..price         | the price of everything in the store. |
//book[3]           | $..book[2]             | the third book                        |
//book[last()]      | $..book[(@.length-1)]<br>$..book[-1:]  | the last book in order.|
//book[position()<3]| $..book[0,1]<br>$..book[:2]| the first two books               |
//book/*[self::category\|self::author] or //book/(category,author) in XPath 2.0| $..book[category,author]| the categories and authors of all books |
//book[isbn]        | $..book[?(@.isbn)]     | filter all books with isbn number     |
//book[price<10]    | $..book[?(@.price<10)] | filter all books cheapier than 10     |
//*[price>19]/..    | $..[?(@.price>19)]^    | categories with things more expensive than 19 | Parent (caret) not present in original spec
//*                 | $..*                   | all Elements in XML document. All members of JSON structure. |
/store/book/[position()!=1] | $.store.book[?(@path !== "$[\'store\'][\'book\'][0]")] | All books besides that at the path pointing to the first | @path not present in original spec

Any additional variables supplied as properties on the optional
"sandbox" object option are also available to (parenthetical-based)
evaluations.

# Development

Running the tests on node: `npm test`. For in-browser tests:

* Ensure that nodeunit is browser-compiled: `cd node_modules/nodeunit; make browser;`
* Serve the js/html files:

```sh
    node -e "require('http').createServer(function(req,res) { \
        var s = require('fs').createReadStream('.' + req.url); \
        s.pipe(res); s.on('error', function() {}); }).listen(8082);"
```
* To run the tests visit [http://localhost:8082/test/test.html]().


# License

[MIT License](http://www.opensource.org/licenses/mit-license.php).
