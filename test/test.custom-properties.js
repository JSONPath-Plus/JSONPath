
describe('JSONPath - Custom properties', function () {
    const t1 = {
        b: {true: 'abc', false: 'def'},
        c: {true: 'qrs', false: 'tuv'}
    };

    it('@path for index', () => {
        const result = jsonpath({json: t1, path: '$.*[(@path === "$[\'b\']")]', wrap: false});
        assert.deepEqual(['abc', 'tuv'], result);
    });
});
