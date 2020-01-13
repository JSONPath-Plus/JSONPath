/**
* @callback BeforeChecker
* @returns {void}
*/

/**
* @callback VMTestIterator
* @param {"Node vm"|"Built-in vm"} vmType
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
        'Built-in vm'
    ].forEach((vmType) => {
        const checkingBuiltInVM = vmType === 'Built-in vm';
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
