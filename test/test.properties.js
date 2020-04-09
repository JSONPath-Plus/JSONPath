import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Properties (${vmType})`, function () {
        before(setBuiltInState);

        const json = {
            "test1": {
                "test2": {
                    "test3.test4.test5": {
                        "test7": "value"
                    }
                }
            },
            "datafield": [
                {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
                {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}},
                {"@tag": "045", "045": "secret"}
            ]
        };

        it('Periods within properties', () => {
            const expected = {"test7": "value"};
            const result = jsonpath({json, path: "$.test1.test2['test3.test4.test5']", wrap: false});
            assert.deepEqual(result, expected);
        });

        it('At signs within properties', () => {
            let result = jsonpath({json, path: "$.datafield[?(@.tag=='035')]", wrap: false});
            assert.deepEqual(result, [json.datafield[0]]);
            result = jsonpath({json, path: "$.datafield[?(@['@tag']=='042')]", wrap: false});
            assert.deepEqual(result, [json.datafield[1]]);
            result = jsonpath({json, path: "$.datafield[2][(@['@tag'])]", wrap: false});
            assert.deepEqual(result, json.datafield[2]['045']);
        });

        it('At signs within properties (null data)', () => {
            const result = jsonpath({json: {
                datafield: [null]
            }, path: "$.datafield[?(@.tag=='xxx')]", wrap: false});
            assert.deepEqual(result, undefined);
        });

        it('Checking properties of child object (through `@` as parent object)', function () {
            const jsonObj = {
                test1: {
                    a: 4,
                    b: 8
                }
            };
            const result = jsonpath({
                json: jsonObj, path: "$.[?(@.a == 4)]", wrap: false});
            assert.deepEqual(result, [jsonObj.test1]);
        });
        it('Checking properties of child object (through `@` as property)', function () {
            const jsonObj = {
                test1: {
                    a: 4,
                    b: 8
                }
            };
            const result = jsonpath({
                json: jsonObj, path: "$.[?(@property == 'a' && @ == 4)]^", wrap: false});
            assert.deepEqual(result, [jsonObj.test1]);
        });
    });
});
