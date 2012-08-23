[![build status](https://secure.travis-ci.org/s3u/JSONPath.png)](http://travis-ci.org/s3u/JSONPath)
Install
=======
    
    npm install JSONPath

Evaluate
========

    var jsonpath = require('JSONPath');
    jsonpath.eval(obj, path);

Or more concisely:

	var jsonpath = require('JSONPath').eval;
	jsonpath(obj, path);

Examples
========

Given the following JSON, taken from http://goessner.net/articles/JsonPath/ :

	{ "store": {
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
	}


XPath               | JSONPath               | Result
------------------- | ---------------------- | -------------------------------------
/store/book/author	| $.store.book[*].author | the authors of all books in the store 
//author            | $..author              | all authors 
/store/*            | $.store.*              | all things in store, which are some books and a red bicycle.
/store//price       | $.store..price         | the price of everything in the store.
//book[3]           | $..book[2]             | the third book
//book[last()]      | $..book[(@.length-1)]  | the last book in order.
                    | $..book[-1:]           |
//book[position()<3]| $..book[0,1]           | the first two books
                    | $..book[:2]            | 
//book[isbn]        | $..book[?(@.isbn)]     | filter all books with isbn number
//book[price<10]    | $..book[?(@.price<10)] | filter all books cheapier than 10
//*                 | $..*                   |all Elements in XML document. All members of JSON structure.



See http://www.opensource.org/licenses/mit-license.php for license.
