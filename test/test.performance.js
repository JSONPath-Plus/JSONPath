
describe('JSONPath - Performance', function () {
    this.timeout(5000);
    const arraySize = 12333,
        resultCount = 1150,
        itemCount = 150,
        groupCount = 245;

    const json = {
        results: []
    };

    let i, j;

    const bigArray = [];
    for (i = 0; i < arraySize; i++) {
        bigArray[i] = 1;
    }

    const items = [];
    for (i = 0; i < itemCount; i++) {
        // eslint-disable-next-line unicorn/prefer-structured-clone -- Want JSON
        items[i] = JSON.parse(JSON.stringify({a: {b: 0, c: 0}, s: {b: {c: bigArray}}}));
    }

    for (i = 0; i < resultCount; i++) {
        json.results[i] = {groups: [], v: {v: [1, 2, 3, 4, 5, 6, 7, 8]}};
        json.results[i].groups = [];
        for (j = 0; j < groupCount; j++) {
            json.results[i].groups[j] = {items, a: "121212"};
        }
    }

    it('performance', () => {
        const expectedDuration = typeof globalThis !== 'undefined' ? 4500 : 2500;
        const start = Date.now();
        jsonpath({json, path: '$.results[*].groups[*].items[42]'});
        assert.strictEqual((Date.now() - start) < expectedDuration, true);
    });
});
