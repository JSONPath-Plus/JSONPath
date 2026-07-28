
describe('JSONPath - Performance', function () {
    this.timeout(5000);
    const arraySize = 12333,
        resultCount = 1150,
        itemCount = 150,
        groupCount = 245;

    /**
     * @typedef {{a: {b: 0, c: 0}, s: {b: {c: number[]}}}[]} Items
     */

    const json = {
        results:
        /** @type {{groups: {items: Items, a: string}[], v?: {v: number[]}}[]} */ (
            []
        )
    };

    const bigArray = /** @type {number[]} */ ([]);
    for (let i = 0; i < arraySize; i++) {
        bigArray[i] = 1;
    }

    const items = /** @type {Items} */ ([]);
    for (let i = 0; i < itemCount; i++) {
        items[i] = {a: {b: 0, c: 0}, s: {b: {c: bigArray}}};
    }

    for (let i = 0; i < resultCount; i++) {
        json.results[i] = {groups: [], v: {v: [1, 2, 3, 4, 5, 6, 7, 8]}};
        json.results[i].groups = [];
        for (let j = 0; j < groupCount; j++) {
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
