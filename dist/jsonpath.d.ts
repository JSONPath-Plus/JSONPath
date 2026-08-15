export type AnyInput = any;
export type SandboxCallback = ((...args: any[]) => any);
export type SandboxPropertyValue = any | SandboxCallback;
export type ExpressionArray = (string | number)[];
export type ValueType = "scalar" | "boolean" | "string" | "undefined" | "function" | "integer" | "number" | "nonFinite" | "object" | "array" | "other" | "null";
export type ParentValue = unknown;
export type UnknownResult = unknown;
export type ParentProperty = string | number | null;
export type PreferredOutput = unknown | ParentValue | string | ReturnObject;
export type ReturnObject = {
    path: ExpressionArray | string;
    value: unknown;
    parent: ParentValue;
    parentProperty: ParentProperty;
    isParentSelector?: boolean | undefined;
    hasArrExpr?: boolean | undefined;
    expr?: ExpressionArray | undefined;
    pointer?: string | undefined;
};
export type JSONPathCallback = (preferredOutput: any, type: "value" | "property", fullRetObj: ReturnObject) => void;
export type OtherTypeCallback = (val: unknown, path: ExpressionArray, parent: ParentValue, parentPropName: string | null) => boolean;
export type ContextItem = any;
export type EvaluatedResult = any;
export type EvalCallback = (code: string, context: ContextItem) => EvaluatedResult;
export type EvalClass = typeof SafeScript;
export type ResultType = "value" | "path" | "pointer" | "parent" | "parentProperty" | "all";
export type EvalValue = EvalCallback | EvalClass | "safe" | "native" | boolean;
export type PathType = string | string[];
export type SafeScriptType = {
    Script: typeof SafeScript;
};
export type ScriptType = {
    Script: typeof Script;
};
export type SandboxType = {
    _$_path?: string;
    _$_parentProperty?: ParentProperty;
    _$_parent?: ParentValue;
    _$_property?: string | number;
    _$_root?: AnyInput;
    _$_v?: unknown;
    [key: string]: SandboxPropertyValue;
};
export type JSONPathOptions = {
    json?: AnyInput;
    path?: PathType | undefined;
    resultType?: ResultType | undefined;
    flatten?: boolean | undefined;
    wrap?: boolean | undefined;
    sandbox?: SandboxType | undefined;
    eval?: EvalValue | undefined;
    parent?: any | null;
    parentProperty?: string | null | undefined;
    callback?: JSONPathCallback | undefined;
    /**
     * Defaults to
     * function which throws on encountering `@other`
     */
    otherTypeCallback?: OtherTypeCallback | undefined;
    autostart?: boolean | undefined;
    ignoreEvalErrors?: boolean | undefined;
};
/**
 * @overload
 * @param {string} opts JSON path to evaluate
 * @param {AnyInput} [expr] JSON object to evaluate against
 * @param {JSONPathCallback} [obj] Passed 3 arguments: 1) desired
 *     payload per `resultType`, 2) `"value"|"property"`, 3) Full returned
 *     object with all payloads
 * @param {OtherTypeCallback} [callback] If `@other()` is at the
 *   end of one's query, this will be invoked with the value of the item,
 *   its path, its parent, and its parent's property name, and it should
 *   return a boolean indicating whether the supplied value belongs to the
 *   "other" type or not (or it may handle transformations and return
 *   `false`).
 * @param {undefined} [otherTypeCallback]
 * @returns {unknown} The string form always has `autostart` implicitly
 *   `true`, so the result is the evaluated value, not a `JSONPathClass`
 */
export function JSONPath(opts: string, expr?: AnyInput, obj?: JSONPathCallback | undefined, callback?: OtherTypeCallback | undefined, otherTypeCallback?: undefined): unknown;
/**
 * @overload
 * @param {JSONPathOptions & {autostart: false}} opts An options object
 *   with `autostart` explicitly set to `false` defers evaluation and
 *   returns the `JSONPathClass` instance instead
 * @returns {JSONPathClass}
 */
export function JSONPath(opts: JSONPathOptions & {
    autostart: false;
}): JSONPathClass;
/**
 * @overload
 * @param {JSONPathOptions} opts If a string, will be treated as
 *   `expr`
 * @returns {unknown}
 */
export function JSONPath(opts: JSONPathOptions): unknown;
export namespace JSONPath {
    let cache: Record<string, unknown>;
    /**
     * @param {string[]} pathArr Array to convert
     * @returns {string} The path string
     */
    function toPathString(pathArr: string[]): string;
    /**
     * @param {string[]} pointer JSON Path array
     * @returns {string} JSON Pointer
     */
    function toPointer(pointer: string[]): string;
    /**
     * @param {string} expr Expression to convert
     * @returns {string[]}
     */
    function toPathArray(expr: string): string[];
}
/**
 *
 */
export class JSONPathClass {
    /**
     * @overload
     * @param {string} opts JSON path to evaluate
     * @param {AnyInput} [expr] JSON object to evaluate against
     * @param {JSONPathCallback} [obj] Passed 3 arguments: 1) desired
     *     payload per `resultType`, 2) `"value"|"property"`, 3) Full returned
     *     object with all payloads
     * @param {OtherTypeCallback} [callback] If `@other()` is at the
     *   end of one's query, this will be invoked with the value of the item,
     *   its path, its parent, and its parent's property name, and it should
     *   return a boolean indicating whether the supplied value belongs to the
     *   "other" type or not (or it may handle transformations and return
     *   `false`).
     * @param {undefined} [otherTypeCallback]
     * @returns {JSONPath|JSONPathClass}
     */
    constructor(opts: string, expr?: AnyInput, obj?: JSONPathCallback | undefined, callback?: OtherTypeCallback | undefined, otherTypeCallback?: undefined);
    /**
     * @overload
     * @param {JSONPathOptions} opts If a string, will be treated as
     *   `expr`
     */
    constructor(opts: JSONPathOptions);
    /** @type {ResultType|undefined} */
    currResultType: ResultType | undefined;
    /** @type {EvalValue|undefined} */
    currEval: EvalValue | undefined;
    /** @type {OtherTypeCallback|undefined} */
    currOtherTypeCallback: OtherTypeCallback | undefined;
    /** @type {SafeScriptType} */
    safeVm: SafeScriptType;
    /** @type {ScriptType} */
    vm: ScriptType;
    /** @type {SandboxType|undefined} */
    currSandbox: SandboxType | undefined;
    _hasParentSelector: boolean;
    json: any;
    path: any;
    resultType: ResultType;
    flatten: boolean | undefined;
    wrap: boolean | undefined;
    sandbox: SandboxType;
    eval: EvalValue;
    ignoreEvalErrors: boolean;
    parent: any;
    parentProperty: string | null | undefined;
    callback: JSONPathCallback;
    otherTypeCallback: OtherTypeCallback;
    /**
     * @overload
     * @param {JSONPathOptions} [expr]
     * @returns {ReturnObject|ReturnObject[]|undefined|unknown}
     */
    evaluate(expr?: JSONPathOptions | undefined): ReturnObject | ReturnObject[] | undefined | unknown;
    /**
     * @overload
     * @param {PathType|undefined} [expr]
     * @param {AnyInput} [json]
     * @param {JSONPathCallback|null} [callback]
     * @param {OtherTypeCallback} [otherTypeCallback]
     * @returns {ReturnObject|ReturnObject[]|undefined|unknown}
     */
    evaluate(expr?: PathType | undefined, json?: AnyInput, callback?: JSONPathCallback | null | undefined, otherTypeCallback?: OtherTypeCallback | undefined): ReturnObject | ReturnObject[] | undefined | unknown;
    /**
     * @param {ReturnObject} ea
     * @returns {PreferredOutput}
     */
    _getPreferredOutput(ea: ReturnObject): PreferredOutput;
    /**
     * @param {ReturnObject} fullRetObj
     * @param {JSONPathCallback|undefined} callback
     * @param {"value"|"property"} type
     * @returns {void}
     */
    _handleCallback(fullRetObj: ReturnObject, callback: JSONPathCallback | undefined, type: "value" | "property"): void;
    /**
     *
     * @param {ExpressionArray} expr
     * @param {unknown} val
     * @param {ExpressionArray} path
     * @param {ParentValue} parent
     * @param {ParentProperty} parentPropName
     * @param {JSONPathCallback|undefined} callback
     * @param {boolean|undefined} hasArrExpr
     * @param {boolean} [literalPriority]
     * @returns {ReturnObject|ReturnObject[]}
     */
    _trace(expr: ExpressionArray, val: unknown, path: ExpressionArray, parent: ParentValue, parentPropName: ParentProperty, callback: JSONPathCallback | undefined, hasArrExpr: boolean | undefined, literalPriority?: boolean): ReturnObject | ReturnObject[];
    /**
     * @param {unknown} val
     * @param {(prop: string|number) => void} f
     * @returns {void}
     */
    _walk(val: unknown, f: (prop: string | number) => void): void;
    /**
     * @param {string} loc
     * @param {ExpressionArray} expr
     * @param {unknown} val
     * @param {ExpressionArray} path
     * @param {ParentValue} parent
     * @param {ParentProperty} parentPropName
     * @param {JSONPathCallback|undefined} callback
     * @returns {ReturnObject[]|undefined}
     */
    _slice(loc: string, expr: ExpressionArray, val: unknown, path: ExpressionArray, parent: ParentValue, parentPropName: ParentProperty, callback: JSONPathCallback | undefined): ReturnObject[] | undefined;
    /**
     * @param {string} code
     * @param {unknown} _v
     * @param {string|number} _vname
     * @param {ExpressionArray} path
     * @param {ParentValue} parent
     * @param {ParentProperty} parentPropName
     * @returns {UnknownResult}
     */
    _eval(code: string, _v: unknown, _vname: string | number, path: ExpressionArray, parent: ParentValue, parentPropName: ParentProperty): UnknownResult;
}
import { SafeScript } from './Safe-Script.js';
import type { Script } from './jsonpath-browser.js';
