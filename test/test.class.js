import {checkBuiltInVMAndNodeVM} from '../test-helpers/checkVM.js';

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Properties (${vmType})`, function () {
        before(setBuiltInState);

        /**
         *
         */
        class Test1 {
            /**
             * Test2.
             */
            constructor () {
                this.test2 = "test2";
            }

            /**
             * Test3.
             * @returns {string}
             */
            // eslint-disable-next-line class-methods-use-this
            get test3 () {
                return "test3";
            }
        }
        const json = new Test1();

        it("Checking simple property", () => {
            assert.equal(
                jsonpath({json, path: "$.test2", wrap: false}),
                "test2"
            );
        });

        it("Checking getter property", () => {
            assert.equal(
                jsonpath({json, path: "$.test3", wrap: false}),
                "test3"
            );
        });
    });
});
