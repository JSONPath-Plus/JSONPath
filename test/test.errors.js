import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Error (${vmType})`, function () {
        before(setBuiltInState);

        it('should throw with missing `path`', function () {
            assert.throws(() => {
                jsonpath({json: []});
            }, TypeError, 'You must supply a "path" property when providing an object ' +
    'argument to JSONPath.evaluate().');
        });
        it('should throw with missing `json`', function () {
            assert.throws(() => {
                jsonpath({path: '$'});
            }, TypeError, 'You must supply a "json" property when providing an object ' +
    'argument to JSONPath.evaluate().');
        });

        it('should throw with a bad filter', () => {
            expect(() => {
                jsonpath({json: {book: []}, path: '$..[?(@.category === category)]'});
            }).to.throw(Error, 'jsonPath: category is not defined: _$_v.category === category');
        });

        it('should throw with a bad result type', () => {
            expect(() => {
                jsonpath({
                    json: {children: [5]},
                    path: '$..children',
                    resultType: 'badType'
                });
            }).to.throw(TypeError, 'Unknown result type');
        });

        it('should throw with `preventEval` and [?()] filtering expression', () => {
            expect(() => {
                const json = {
                    datafield: [
                        {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
                        {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}},
                        {"@tag": "045", "045": "secret"}
                    ]
                };
                jsonpath({
                    json,
                    path: "$.datafield[?(@.tag=='035')]",
                    preventEval: true
                });
            }).to.throw(Error, 'Eval [?(expr)] prevented in JSONPath expression.');
        });

        it('should throw with `preventEval` and [?()] filtering expression', () => {
            expect(() => {
                const json = {
                    datafield: [
                        {"tag": "035", "subfield": {"@code": "a", "#text": "1879"}},
                        {"@tag": "042", "subfield": {"@code": "a", "#text": "5555"}},
                        {"@tag": "045", "045": "secret"}
                    ]
                };
                jsonpath({
                    json,
                    path: '$..datafield[(@.length-1)]',
                    preventEval: true
                });
            }).to.throw(Error, 'Eval [(expr)] prevented in JSONPath expression.');
        });
    });
});
