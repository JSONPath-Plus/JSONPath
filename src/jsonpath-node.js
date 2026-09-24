import vm from 'node:vm';
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

// Node's vm module shape is wider than ScriptType, but is compatible for
// the properties actually used (Script) -- kept Node-specific here so
// `node:vm` types don't leak into the shared/browser declarations.
/** @type {{vm: ScriptType}} */
(/** @type {unknown} */ (JSONPathClass.prototype)).vm =
    /** @type {ScriptType} */ (
        /** @type {unknown} */ (vm)
    );

export {
    JSONPath, JSONPathClass
};
