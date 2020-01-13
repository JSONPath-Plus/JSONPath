
describe('JSONPath - Errors', function () {
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
});
