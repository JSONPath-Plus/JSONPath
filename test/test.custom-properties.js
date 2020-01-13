import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Custom properties (${vmType})`, function () {
        before(setBuiltInState);

        const t1 = {
            b: {true: 'abc', false: 'def'},
            c: {true: 'qrs', false: 'tuv'}
        };

        it('@path for index', () => {
            const result = jsonpath({json: t1, path: '$.*[(@path === "$[\'b\']")]', wrap: false});
            assert.deepEqual(result, ['abc', 'tuv']);
        });
    });
});
