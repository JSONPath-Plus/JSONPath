export type AnyInput = import("./jsonpath.js").AnyInput;
export type SandboxCallback = import("./jsonpath.js").SandboxCallback;
export type SandboxPropertyValue = import("./jsonpath.js").SandboxPropertyValue;
export type ExpressionArray = import("./jsonpath.js").ExpressionArray;
export type ValueType = import("./jsonpath.js").ValueType;
export type ParentValue = import("./jsonpath.js").ParentValue;
export type UnknownResult = import("./jsonpath.js").UnknownResult;
export type ParentProperty = import("./jsonpath.js").ParentProperty;
export type PreferredOutput = import("./jsonpath.js").PreferredOutput;
export type ReturnObject = import("./jsonpath.js").ReturnObject;
export type JSONPathCallback = import("./jsonpath.js").JSONPathCallback;
export type OtherTypeCallback = import("./jsonpath.js").OtherTypeCallback;
export type ContextItem = import("./jsonpath.js").ContextItem;
export type EvaluatedResult = import("./jsonpath.js").EvaluatedResult;
export type EvalCallback = import("./jsonpath.js").EvalCallback;
export type EvalClass = import("./jsonpath.js").EvalClass;
export type ResultType = import("./jsonpath.js").ResultType;
export type EvalValue = import("./jsonpath.js").EvalValue;
export type PathType = import("./jsonpath.js").PathType;
export type SafeScriptType = import("./jsonpath.js").SafeScriptType;
export type ScriptType = import("./jsonpath.js").ScriptType;
export type SandboxType = import("./jsonpath.js").SandboxType;
export type JSONPathOptions = import("./jsonpath.js").JSONPathOptions;
export type ConditionCallback<T> = (item: T) => boolean;
import { JSONPath } from './jsonpath.js';
import { JSONPathClass } from './jsonpath.js';
/**
 * In-browser replacement for NodeJS' VM.Script.
 */
export class Script {
    /**
     * @param {string} expr Expression to evaluate
     */
    constructor(expr: string);
    code: string;
    /**
     * @param {SandboxType} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext(context: SandboxType): EvaluatedResult;
}
export { JSONPath, JSONPathClass };
