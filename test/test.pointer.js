
describe('JSONPath - Pointers', function () {
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
                "category": "reference",
                "author": "Nigel Rees",
                "application/vnd.wordperfect": "sotc.wpd",
                "title": "Sayings of the Century"
            },
            {
                "category": "reference",
                "author": "Nigel Rees",
                "application~vnd.wordperfect": "sotc.wpd",
                "title": "Sayings of the Century"
            }],
            "bicycle": {
                "color": "red",
                "price": 19.95
            }
        }
    };

    it('array', () => {
        const expected = [
            '/store/book/0/price',
            '/store/book/1/price',
            '/store/bicycle/price'
        ];
        const result = jsonpath({json, path: 'store..price', resultType: 'pointer', flatten: true});
        assert.deepEqual(result, expected);
    });
    it('single', () => {
        const expected = ['/store'];
        const result = jsonpath({json, path: 'store', resultType: 'pointer', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('escape / as ~1', () => {
        const expected = ['/store/book/2/application~1vnd.wordperfect'];
        const result = jsonpath({json, path: "$['store']['book'][*]['application/vnd.wordperfect']", resultType: 'pointer', flatten: true});
        assert.deepEqual(result, expected);
    });

    it('escape ~ as ~0', () => {
        const expected = ['/store/book/3/application~0vnd.wordperfect'];
        const result = jsonpath({json, path: "$['store']['book'][*]['application~vnd.wordperfect']", resultType: 'pointer', flatten: true});
        assert.deepEqual(result, expected);
    });
});
