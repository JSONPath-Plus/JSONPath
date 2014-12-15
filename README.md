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

- ***autostart*** (**default: true**) - If this is supplied as `false`, one may call the `evaluate` method manually (with an object and expression) as needed.
- ***flatten*** (**default: false**) - Whether the returned array of results will be flattened to a single dimension array.
- ***resultType*** (**default: "value"**) - Can be case-insensitive form of "value", "path", "parent", or "parentProperty" to determine respectively whether to return results as the values of the found items, as their absolute paths, as their parent objects, or as their parent's property name. If set to "all", all of these types will be returned on an object with the type as key name.
- ***sandbox*** (**default: An empty object **) - Key-value map of variables to be available to code evaluations such as filtering expressions. (Note that the current path and value will also be available to those expressions; see the Syntax section for details.)
- ***wrap*** (**default: true**) - Whether or not to wrap the results in an array. If `wrap` is set to false, and no results are found, `undefined` will be returned (as opposed to an empty array with `wrap` set to true). If `wrap` is set to false and a single result is found, that result will be the only item returned (not within an array). An array will still be returned if multiple results are found, however.
- ***preventEval*** (**default: false**) - Although JavaScript evaluation expressions are allowed by default, for security reasons (if one is operating on untrusted user input, for example), one may wish to set this option to `true` to throw exceptions when these expressions are attempted.

There is also now a class property, on JSONPath.cache which exposes the cache for those who wish to preserve and reuse it for optimization purposes.

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

and the following XML representation:

```xml
<store>
    <book>
        <category>reference</category>
        <author>Nigel Rees</author>
        <title>Sayings of the Century</title>
        <price>8.95</price>
    </book>
    <book>
        <category>fiction</category>
        <author>Evelyn Waugh</author>
        <title>Sword of Honour</title>
        <price>12.99</price>
    </book>
    <book>
        <category>fiction</category>
        <author>Herman Melville</author>
        <title>Moby Dick</title>
        <isbn>0-553-21311-3</isbn>
        <price>8.99</price>
    </book>
    <book>
        <category>fiction</category>
        <author>J. R. R. Tolkien</author>
        <title>The Lord of the Rings</title>
        <isbn>0-395-19395-8</isbn>
        <price>22.99</price>
    </book>
    <bicycle>
        <color>red</color>
        <price>19.95</price>
    </bicycle>
</store>
```

Please note that the XPath examples below do not distinguish between
retrieving elements and their text content (except where useful for
comparisons or to prevent ambiguity).

XPath               | JSONPath               | Result                                | Notes
------------------- | ---------------------- | ------------------------------------- | -----
/store/book/author  | $.store.book[*].author | The authors of all books in the store |
//author            | $..author              | All authors                           |
/store/*            | $.store.*              | All things in store, which are its books (a book array) and a red bicycle (a bicycle object).|
/store//price       | $.store..price         | The price of everything in the store. |
//book[3]           | $..book[2]             | The third book (book object)          |
//book[last()]      | $..book[(@.length-1)]<br>$..book[-1:]  | The last book in order.|
//book[position()<3]| $..book[0,1]<br>$..book[:2]| The first two books               |
//book/*[self::category\|self::author] or //book/(category,author) in XPath 2.0| $..book[0][category,author]| The categories and authors of all books |
//book[isbn]        | $..book[?(@.isbn)]     | Filter all books with an ISBN number     |
//book[price<10]    | $..book[?(@.price<10)] | Filter all books cheaper than 10     |
//\*/\*\|//\*/\*/text()  | $..*                   | All Elements (and text) beneath root in an XML document. All members of a JSON structure beneath the root. |
//*                 | $..                    | All Elements in an XML document. All parent components of a JSON structure including root. | This behavior was not directly specified in the original spec
//*[price>19]/..    | $..[?(@.price>19)]^    | Parent of those specific items with a price greater than 19 (i.e., the store value as the parent of the bicycle and the book array as parent of an individual book) | Parent (caret) not present in the original spec
/store/*/name() in XPath 2.0  | $.store.*~ | The property names of the store sub-object ("book" and "bicycle") | Property name (tilde) is not present in the original spec
/store/book[not(. is /store/book[1])] in XPath 2.0 | $.store.book[?(@path !== "$[\'store\'][\'book\'][0]")] | All books besides that at the path pointing to the first | @path not present in the original spec
//book[parent::*/bicycle/color = "red"]/category | $..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category | Grabs all categories of books where the parent object of the book has a bicycle child whose color is red (i.e., all the books) | @parent is not present in the original spec
//book/*[name() != 'category']     | $..book.*[?(@property !== "category")] | Grabs all children of "book" except for "category" ones  | @property is not present in the original spec
//book/*[position() != 0]    | $..book[?(@property !== 0)] | Grabs all books whose property (which, being that we are reaching inside an array, is the numeric index) is not 0 | @property is not present in the original spec
/store/*/*[name(parent::*) != 'book'] | $.store.*[?(@parentProperty !== "book")] | Grabs the grandchildren of store whose parent property is not book (i.e., bicycle's children, "color" and "price") | @parentProperty is not present in the original spec
//book[count(preceding-sibling::*) != 0]/*/text() | $..book.*[?(@parentProperty !== 0)]  | Get the property values of all book instances whereby the parent property of these values (i.e., the array index holding the book item parent object) is not 0 | @parentProperty is not present in the original spec

Any additional variables supplied as properties on the optional
"sandbox" object option are also available to (parenthetical-based)
evaluations.

# Potential sources of confusion for XPath users

1. In JSONPath, a filter expression, in addition to its `@` being a
reference to its children, actually selects the immediate children
as well, whereas in XPath, filter conditions do not select the children
but delimit which of its parent nodes will be obtained in the result.
1. In JSONPath, array indexes are, as in JavaScript, 0-based (they begin
from 0), whereas in XPath, they are 1-based.
1. In JSONPath, equality tests utilize (as per JavaScript) multiple equal signs
whereas in XPath, they use a single equal sign.

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
