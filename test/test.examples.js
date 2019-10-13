'use strict';

(function () {
// tests based on examples at http://goessner.net/articles/jsonpath/

const json = {
    "store": {
        "book": [{
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
        }],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }
};

describe('JSONPath - Examples', function () {
    it('wildcards (with and without $.)', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        let result = jsonpath({json, path: '$.store.book[*].author'});
        assert.deepEqual(expected, result);
        result = jsonpath({json, path: 'store.book[*].author'});
        assert.deepEqual(expected, result);
    });

    it('all properties, entire tree', () => {
        const books = json.store.book;
        const expected = [books[0].author, books[1].author, books[2].author, books[3].author];
        const result = jsonpath({json, path: '$..author'});
        assert.deepEqual(expected, result);
    });

    it('all sub properties, single level', () => {
        const expected = [json.store.book, json.store.bicycle];
        const result = jsonpath({json, path: '$.store.*'});
        assert.deepEqual(expected, result);
    });

    it('all sub properties, entire tree', () => {
        const books = json.store.book;
        const expected = [books[0].price, books[1].price, books[2].price, books[3].price, json.store.bicycle.price];
        const result = jsonpath({json, path: '$.store..price'});
        assert.deepEqual(expected, result);
    });

    it('n property of entire tree', () => {
        const books = json.store.book;
        const expected = [books[2]];
        const result = jsonpath({json, path: '$..book[2]'});
        assert.deepEqual(expected, result);
    });

    it('last property of entire tree', () => {
        const books = json.store.book;
        const expected = [books[3]];
        let result = jsonpath({json, path: '$..book[(@.length-1)]'});
        assert.deepEqual(expected, result);

        result = jsonpath({json, path: '$..book[-1:]'});
        assert.deepEqual(expected, result);
    });

    it('range of property of entire tree', () => {
        const books = json.store.book;
        const expected = [books[0], books[1]];
        let result = jsonpath({json, path: '$..book[0,1]'});
        assert.deepEqual(expected, result);

        result = jsonpath({json, path: '$..book[:2]'});
        assert.deepEqual(expected, result);
    });

    it('categories and authors of all books', () => {
        const expected = ['reference', 'Nigel Rees'];
        const result = jsonpath({json, path: '$..book[0][category,author]'});
        assert.deepEqual(expected, result);
    });

    it('filter all properties if sub property exists, of entire tree', () => {
        const books = json.store.book;
        const expected = [books[2], books[3]];
        const result = jsonpath({json, path: '$..book[?(@.isbn)]'});
        assert.deepEqual(expected, result);
    });

    it('filter all properties if sub property greater than of entire tree', () => {
        const books = json.store.book;
        const expected = [books[0], books[2]];
        const result = jsonpath({json, path: '$..book[?(@.price<10)]'});
        assert.deepEqual(expected, result);
    });

    it('@ as a scalar value', () => {
        const expected = [json.store.bicycle.price].concat(json.store.book.slice(1).map(function (book) {
            return book.price;
        }));
        const result = jsonpath({json, path: "$..*[?(@property === 'price' && @ !== 8.95)]", wrap: false});
        assert.deepEqual(expected, result);
    });

    it('all properties of a JSON structure (beneath the root)', () => {
        const expected = [
            json.store,
            json.store.book,
            json.store.bicycle
        ];
        json.store.book.forEach((book) => {
            expected.push(book);
        });
        json.store.book.forEach(function (book) {
            Object.keys(book).forEach(function (p) {
                expected.push(book[p]);
            });
        });
        expected.push(json.store.bicycle.color);
        expected.push(json.store.bicycle.price);

        const result = jsonpath({json, path: '$..*'});
        assert.deepEqual(expected, result);
    });

    it('all parent components of a JSON structure', () => {
        const expected = [
            json,
            json.store,
            json.store.book
        ];
        json.store.book.forEach((book) => {
            expected.push(book);
        });
        expected.push(json.store.bicycle);

        const result = jsonpath({json, path: '$..'});
        assert.deepEqual(expected, result);
    });

    it('root', () => {
        const expected = json;
        const result = jsonpath({json, path: '$', wrap: false});
        assert.deepEqual(expected, result);
    });

    it('Custom operator: parent (caret)', () => {
        const expected = [json.store, json.store.book];
        const result = jsonpath({json, path: '$..[?(@.price>19)]^'});
        assert.deepEqual(expected, result);
    });
    it('Custom operator: property name (tilde)', () => {
        const expected = ['book', 'bicycle'];
        const result = jsonpath({json, path: '$.store.*~'});
        assert.deepEqual(expected, result);
    });
    it('Custom property @path', () => {
        const expected = json.store.book.slice(1);
        const result = jsonpath({json, path: '$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]'});
        assert.deepEqual(expected, result);
    });
    it('Custom property: @parent', () => {
        const expected = ['reference', 'fiction', 'fiction', 'fiction'];
        const result = jsonpath({json, path: '$..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category'});
        assert.deepEqual(expected, result);
    });
    it('Custom property: @property', () => {
        let expected = json.store.book.reduce(function (arr, book) {
            arr.push(book.author, book.title);
            if (book.isbn) { arr.push(book.isbn); }
            arr.push(book.price);
            return arr;
        }, []);
        let result = jsonpath({json, path: '$..book.*[?(@property !== "category")]'});
        assert.deepEqual(expected, result);

        expected = json.store.book.slice(1);
        result = jsonpath({json, path: '$..book[?(@property !== 0)]'});
        assert.deepEqual(expected, result);
    });
    it('Custom property: @parentProperty', () => {
        let expected = [json.store.bicycle.color, json.store.bicycle.price];
        let result = jsonpath({json, path: '$.store.*[?(@parentProperty !== "book")]'});
        assert.deepEqual(expected, result);

        expected = json.store.book.slice(1).reduce(function (rslt, book) {
            return rslt.concat(Object.keys(book).reduce(function (reslt, prop) {
                reslt.push(book[prop]);
                return reslt;
            }, []));
        }, []);
        result = jsonpath({json, path: '$..book.*[?(@parentProperty !== 0)]'});
        assert.deepEqual(expected, result);
    });

    it('Custom property: @root', () => {
        const expected = [json.store.book[2]];
        const result = jsonpath({json, path: '$..book[?(@.price === @root.store.book[2].price)]'});
        assert.deepEqual(expected, result);
    });

    it('@number()', () => {
        const expected = [8.95, 12.99, 8.99, 22.99];
        const result = jsonpath({json, path: '$.store.book..*@number()', flatten: true});
        assert.deepEqual(expected, result);
    });
});
}());
