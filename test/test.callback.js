
describe('JSONPath - Callback', function () {
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

    it('Callback', () => {
        const expected = ['value', json.store.bicycle, {path: "$['store']['bicycle']", value: json.store.bicycle, parent: json.store, parentProperty: 'bicycle', hasArrExpr: undefined}];
        let result;
        /**
         *
         * @param {PlainObject} data
         * @param {string} type
         * @param {PlainObject} fullData
         * @returns {void}
         */
        function callback (data, type, fullData) {
            if (!result) {
                result = [];
            }
            result.push(type, data, fullData);
        }
        jsonpath({json, path: '$.store.bicycle', resultType: 'value', wrap: false, callback});
        assert.deepEqual(result, expected);
    });

    it('Callback with `resultType`: "all"', () => {
        const expected = [
            'value',
            {
                path: "$['store']['bicycle']",
                value: json.store.bicycle,
                parent: json.store,
                parentProperty: 'bicycle',
                pointer: '/store/bicycle',
                hasArrExpr: undefined
            },
            {
                path: "$['store']['bicycle']",
                value: json.store.bicycle,
                parent: json.store,
                parentProperty: 'bicycle',
                pointer: '/store/bicycle',
                hasArrExpr: undefined
            }
        ];
        let result;
        /**
         *
         * @param {PlainObject} data
         * @param {string} type
         * @param {PlainObject} fullData
         * @returns {void}
         */
        function callback (data, type, fullData) {
            if (!result) {
                result = [];
            }
            result.push(type, data, fullData);
        }
        jsonpath({json, path: '$.store.bicycle', resultType: 'all', wrap: false, callback});
        assert.deepEqual(result[0], expected[0]);
        assert.deepEqual(result, expected);
    });

    // https://github.com/s3u/JSONPath/issues/126
    it('Using callback to set', function () {
        const expected = {
            age: 30,
            email: 'abc@example.com',
            'something_deeper': {
                abc: 1,
                quantity: 11
            },
            firstName: 'John',
            lastName: 'Doe'
        };
        const givenPerson = {
            age: 30,
            email: 'abc@example.com',
            // let's add firstName, lastName fields
            'something_deeper': {
                abc: 1
                // let's add quantity here
            }
        };

        // defined an object with "json_path":"value" format,
        // made sure it is not a deep object.
        const obj1 = {
            $: {
                'firstName': 'John',
                'lastName': 'Doe'
            },
            '$.something_deeper': {
                quantity: 11
            }
        };

        Object.entries(obj1).forEach(([path, valuesToSet]) => {
            jsonpath({
                json: givenPerson,
                path,
                wrap: false,
                callback (obj) {
                    Object.entries(valuesToSet).forEach(([key, val]) => {
                        obj[key] = val;
                    });
                }
            });
        });
        const result = givenPerson;
        assert.deepEqual(result, expected);
    });
});
