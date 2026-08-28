import {JSONPath, JSONPathClass} from './jsonpath.js';

/**
 * @typedef {import('./jsonpath.js').AnyInput} AnyInput
 */
/**
 * @typedef {import('./jsonpath.js').SandboxCallback} SandboxCallback
 */
/**
 * @typedef {import('./jsonpath.js').SandboxPropertyValue} SandboxPropertyValue
 */
/**
 * @typedef {import('./jsonpath.js').ExpressionArray} ExpressionArray
 */
/**
 * @typedef {import('./jsonpath.js').ValueType} ValueType
 */
/**
 * @typedef {import('./jsonpath.js').ParentValue} ParentValue
 */
/**
 * @typedef {import('./jsonpath.js').UnknownResult} UnknownResult
 */
/**
 * @typedef {import('./jsonpath.js').ParentProperty} ParentProperty
 */
/**
 * @typedef {import('./jsonpath.js').PreferredOutput} PreferredOutput
 */
/**
 * @typedef {import('./jsonpath.js').ReturnObject} ReturnObject
 */
/**
 * @typedef {import('./jsonpath.js').JSONPathCallback} JSONPathCallback
 */
/**
 * @typedef {import('./jsonpath.js').OtherTypeCallback} OtherTypeCallback
 */
/**
 * @typedef {import('./jsonpath.js').ContextItem} ContextItem
 */
/**
 * @typedef {import('./jsonpath.js').EvaluatedResult} EvaluatedResult
 */
/**
 * @typedef {import('./jsonpath.js').EvalCallback} EvalCallback
 */
/**
 * @typedef {import('./jsonpath.js').EvalClass} EvalClass
 */
/**
 * @typedef {import('./jsonpath.js').ResultType} ResultType
 */
/**
 * @typedef {import('./jsonpath.js').EvalValue} EvalValue
 */
/**
 * @typedef {import('./jsonpath.js').PathType} PathType
 */
/**
 * @typedef {import('./jsonpath.js').SafeScriptType} SafeScriptType
 */
/**
 * @typedef {import('./jsonpath.js').ScriptType} ScriptType
 */
/**
 * @typedef {import('./jsonpath.js').SandboxType} SandboxType
 */
/**
 * @typedef {import('./jsonpath.js').JSONPathOptions} JSONPathOptions
 */

/**
 * @template T
 * @callback ConditionCallback
 * @param {T} item
 * @returns {boolean}
 */

/**
 * Copy items out of one array into another.
 * @template T
 * @param {T[]} source Array with items to copy
 * @param {T[]} target Array to which to copy
 * @param {ConditionCallback<T>} conditionCb Callback passed the current item;
 *     will move item if evaluates to `true`
 * @returns {void}
 */
const moveToAnotherArray = function (source, target, conditionCb) {
    const il = source.length;
    for (let i = 0; i < il; i++) {
        const item = source[i];
        if (conditionCb(item)) {
            target.push(source.splice(i--, 1)[0]);
        }
    }
};

/**
 * In-browser replacement for NodeJS' VM.Script.
 */
class Script {
    /**
     * @param {string} expr Expression to evaluate
     */
    constructor (expr) {
        this.code = expr;
    }

    /**
     * @param {SandboxType} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext (context) {
        let expr = this.code;
        const keys = Object.keys(context);
        const funcs = /** @type {string[]} */ ([]);
        moveToAnotherArray(keys, funcs, (key) => {
            return typeof context[key] === 'function';
        });
        const values = keys.map((vr) => {
            return context[vr];
        });

        const funcString = funcs.reduce((s, func) => {
            let fString = context[func].toString();
            if (!(/function/v).test(fString)) {
                fString = 'function ' + fString;
            }
            return 'var ' + func + '=' + fString + ';' + s;
        }, '');

        expr = funcString + expr;

        // Mitigate https://perfectionkills.com/global-eval-what-are-the-options/#new_function
        if (!(/(['"])use strict\1/v).test(expr) && !keys.includes('arguments')) {
            expr = 'var arguments = undefined;' + expr;
        }

        // Remove last semi so `return` will be inserted before
        //  the previous one instead, allowing for the return
        //  of a bare ending expression
        expr = expr.replace(/;\s*$/v, '');

        // Insert `return`
        const lastStatementEnd = expr.lastIndexOf(';');
        const code =
            lastStatementEnd !== -1
                ? expr.slice(0, lastStatementEnd + 1) +
                  ' return ' +
                  expr.slice(lastStatementEnd + 1)
                : ' return ' + expr;

        // eslint-disable-next-line no-new-func -- User's choice
        return new Function(...keys, code)(...values);
    }
}

/** @type {{vm: ScriptType}} */
(/** @type {unknown} */ (JSONPathClass.prototype)).vm = {
    Script
};

export {JSONPath, JSONPathClass, Script};
