
describe('JSONPath - toPointer', function () {
    it('toPointer', () => {
        const expected = '/store/bicycle/color';
        const result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color']);
        assert.deepEqual(result, expected);
    });
    it('toPointer (stripped)', () => {
        const expected = '/store/bicycle/color';
        let result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '^']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '@string()']);
        assert.deepEqual(result, expected);
        result = jsonpath.toPointer(['$', 'store', 'bicycle', 'color', '~']);
        assert.deepEqual(result, expected);
    });
});
