/**
* @callback BeforeChecker
* @returns {void}
*/

/**
 * @typedef {"Node vm"|"JSONPath vm"} VmType
 */

/**
* @callback VMTestIterator
* @param {VmType} vmType
* @param {BeforeChecker} beforeChecker
* @returns {void}
*/

/**
 * @param {VMTestIterator} cb
 * @returns {void}
 */
function checkBuiltInVMAndNodeVM (cb) {
    if (typeof process === 'undefined') {
        // eslint-disable-next-line n/no-callback-literal -- Convenient
        cb('JSONPath vm', () => {
            //
        });
        return;
    }
    /** @type {VmType[]} */
    ([
        'Node vm',
        'JSONPath vm'
    ]).forEach((vmType) => {
        const checkingBrowserVM = vmType === 'JSONPath vm';
        cb(
            vmType,
            checkingBrowserVM
                ? () => {
                    // eslint-disable-next-line @stylistic/max-len -- Long
                    // eslint-disable-next-line unicorn/no-global-object-property-assignment -- Test env
                    globalThis.jsonpath = globalThis.jsonpathBrowser;
                }
                : () => {
                    // eslint-disable-next-line @stylistic/max-len -- Long
                    // eslint-disable-next-line unicorn/no-global-object-property-assignment -- Test env
                    globalThis.jsonpath = globalThis.jsonpathNodeVM;
                }
        );
    });
}

export {checkBuiltInVMAndNodeVM};
