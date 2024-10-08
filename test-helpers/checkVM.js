/**
* @callback BeforeChecker
* @returns {void}
*/

/**
* @callback VMTestIterator
* @param {"Node vm"|"JSONPath vm"} vmType
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
    [
        'Node vm',
        'JSONPath vm'
    ].forEach((vmType) => {
        const checkingBrowserVM = vmType === 'JSONPath vm';
        cb(
            vmType,
            checkingBrowserVM
                ? () => {
                    global.jsonpath = global.jsonpathBrowser;
                }
                : () => {
                    global.jsonpath = global.jsonpathNodeVM;
                }
        );
    });
}

export {checkBuiltInVMAndNodeVM};
