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
    [
        'Node vm',
        'JSONPath vm'
    ].forEach((vmType) => {
        const checkingBuiltInVM = vmType === 'JSONPath vm';
        cb(
            vmType,
            checkingBuiltInVM
                ? () => {
                    global.jsonpath = global.jsonpathBuiltin;
                }
                : () => {
                    global.jsonpath = global.jsonpathNodeVM;
                }
        );
    });
}

export {checkBuiltInVMAndNodeVM};
