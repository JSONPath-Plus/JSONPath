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
            }).to.throw(Error, 'jsonPath: category is not defined: @.category === category');
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

        it('should throw with `eval: false` and [?()] filtering expression', () => {
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
                    eval: false
                });
            }).to.throw(Error, 'Eval [?(expr)] prevented in JSONPath expression.');
        });

        it('should throw with `eval: false` and [?()] filtering expression (@.length)', () => {
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
                    eval: false
                });
            }).to.throw(Error, 'Eval [(expr)] prevented in JSONPath expression.');
        });

        it('Syntax error in safe mode script', () => {
            expect(() => {
                const json = {tag: 10};
                jsonpath({
                    json,
                    path: '$..[?(this)]',
                    wrap: false,
                    eval: 'safe'
                });
            }).to.throw(Error, 'jsonPath: Unexpected expression: this');
        });

        it('Invalid assignment in safe mode script', () => {
            expect(() => {
                const json = {tag: 10};
                jsonpath({
                    json,
                    path: '$..[?(2 = 8)]',
                    wrap: false,
                    eval: 'safe'
                });
            }).to.throw(Error, 'jsonPath: Invalid left-hand side in assignment: 2 = 8');
        });

        // Parser syntax error tests
        it('should throw with unbalanced brackets', () => {
            expect(() => {
                jsonpath.toPathParts('$.store[?(');
            }).to.throw(SyntaxError, 'Unbalanced');
        });

        it('should throw with unexpected end after dot', () => {
            expect(() => {
                jsonpath.toPathParts('$.store.');
            }).to.throw(SyntaxError, 'Unexpected end after dot');
        });

        it('should throw with unclosed filter', () => {
            expect(() => {
                jsonpath.toPathParts('$.store[?(@.price < 10');
            }).to.throw(SyntaxError);
        });

        it('should throw with unclosed wildcard bracket', () => {
            expect(() => {
                jsonpath.toPathParts('$.store[*');
            }).to.throw(SyntaxError, 'Expected ] after *');
        });

        it('should throw with unexpected character after backtick', () => {
            expect(() => {
                jsonpath.toPathParts('$.`');
            }).to.throw(SyntaxError, 'Unexpected end after backtick');
        });

        it('should throw with unexpected end after opening bracket', () => {
            expect(() => {
                jsonpath.toPathParts('$[');
            }).to.throw(SyntaxError, 'Unexpected end after [');
        });

        it('should throw with missing ( after ? in filter', () => {
            expect(() => {
                jsonpath.toPathParts('$[?');
            }).to.throw(SyntaxError, 'Expected ( after ?');
        });

        it('should throw with missing ] after filter expression', () => {
            expect(() => {
                jsonpath.toPathParts('$[?(@.price < 10)');
            }).to.throw(SyntaxError, 'Expected ] after filter');
        });

        it('should throw with missing ] after dynamic expression', () => {
            expect(() => {
                jsonpath.toPathParts('$[(@ + 1)');
            }).to.throw(SyntaxError, 'Expected ] after dynamic expression');
        });

        it('should throw with malformed multi-property', () => {
            expect(() => {
                jsonpath.toPathParts("$['a','");
            }).to.throw(SyntaxError);
        });
    });
});
