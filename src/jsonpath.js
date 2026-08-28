/* eslint-disable camelcase -- Convenient for escaping */
/* eslint-disable class-methods-use-this -- Consistent monkey-patching */
/* eslint-disable unicorn/prefer-private-class-fields -- Allow
    monkey-patching */
import {SafeScript} from './Safe-Script.js';

const scriptCache = new Map();
const pathCache = new Map();

/**
 * @typedef {any} AnyInput
 */

/**
 * @typedef {((...args: any[]) => any)} SandboxCallback
 */

/**
 * @typedef {any|SandboxCallback} SandboxPropertyValue
 */

/**
 * @typedef {(string|number)[]} ExpressionArray
 */

/**
 * @typedef {"scalar"|"boolean"|"string"|"undefined"
 *   |"function"|"integer"|"number"|"nonFinite"|"object"
 *   |"array"|"other"|"null"} ValueType
 */

/**
 * @typedef {unknown} ParentValue
 */

/**
 * @typedef {unknown} UnknownResult
 */

/**
 * @typedef {string|number|null} ParentProperty
 */

/**
 * @typedef {ReturnObject|string|number|boolean|null|unknown[]
 *   |Record<string, unknown>} PreferredOutput
 */

/**
 * Copies array and then pushes item into it.
 * @param {ExpressionArray} arr Array to copy and into which to push
 * @param {string|number} item Array item to add (to end)
 * @returns {ExpressionArray} Copy of the original array
 */
function push (arr, item) {
    arr = arr.slice();
    arr.push(item);
    return arr;
}
/**
 * Copies array and then unshifts item into it.
 * @param {string|number} item Array item to add (to beginning)
 * @param {ExpressionArray} arr Array to copy and into which to unshift
 * @returns {ExpressionArray} Copy of the original array
 */
function unshift (item, arr) {
    arr = arr.slice();
    arr.unshift(item);
    return arr;
}

/**
 * @typedef {object} ReturnObject
 * @property {ExpressionArray|string} path
 * @property {unknown} value
 * @property {ParentValue} parent
 * @property {ParentProperty} parentProperty
 * @property {boolean} [isParentSelector]
 * @property {boolean} [hasArrExpr]
 * @property {ExpressionArray} [expr]
 * @property {string} [pointer]
 */

/**
 * @callback JSONPathCallback
 * @param {any} preferredOutput Using `any` type instead of `PreferredOutput` so
 *    that user can supply flexible type
 * @param {"value"|"property"} type
 * @param {ReturnObject} fullRetObj
 * @returns {void}
 */

/**
 * @callback OtherTypeCallback
 * @param {unknown} val
 * @param {ExpressionArray} path
 * @param {ParentValue} parent
 * @param {string|number|null} parentPropName
 * @returns {boolean|null}
 */

/**
 * @typedef {any} ContextItem
 */

/**
 * @typedef {any} EvaluatedResult
 */

/**
 * @callback EvalCallback
 * @param {string} code
 * @param {ContextItem} context
 * @returns {EvaluatedResult}
 */

/**
 * @typedef {new (expr: string) => {
 *   runInNewContext: (context: object) => EvaluatedResult
 * }} ScriptConstructor
 */

/**
 * @typedef {ScriptConstructor} EvalClass
 */

/**
 * @typedef {"value"|"path"|"pointer"|"parent"|"parentProperty"
 *   |"all"} ResultType
 */

/**
 * @typedef {EvalCallback|EvalClass|'safe'|'native'|boolean} EvalValue
 */

/**
 * @typedef {string|string[]} PathType
 */

/**
 * @typedef {{Script: ScriptConstructor}} SafeScriptType
 */

/**
 * @typedef {{Script: ScriptConstructor}} ScriptType
 */

/**
 * @typedef {{
 *   _$_path?: string,
 *   _$_parentProperty?: ParentProperty,
 *   _$_parent?: ParentValue,
 *   _$_property?: string|number,
 *   _$_root?: AnyInput,
 *   _$_v?: unknown,
 *   [key: string]: SandboxPropertyValue
 * }} SandboxType
 */

/**
 * @typedef {object} JSONPathOptions
 * @property {AnyInput} [json]
 * @property {PathType} [path]
 * @property {ResultType} [resultType="value"]
 * @property {boolean} [flatten=false]
 * @property {boolean} [wrap=true]
 * @property {SandboxType} [sandbox={}]
 * @property {EvalValue} [eval='safe']
 * @property {any|null} [parent=null]
 * @property {ParentProperty} [parentProperty=null]
 * @property {JSONPathCallback} [callback]
 * @property {OtherTypeCallback} [otherTypeCallback] Defaults to
 *   function which throws on encountering `@other`
 * @property {Record<string, OtherTypeCallback>} [customTypes] Map of custom
 *   type operator names to their evaluation callbacks
 * @property {boolean} [autostart=true]
 * @property {boolean} [ignoreEvalErrors=false]
 */


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
/**
 * @overload
 * @param {JSONPathOptions & {autostart: false}} opts An options object
 *   with `autostart` explicitly set to `false` defers evaluation and
 *   returns the `JSONPathClass` instance instead
 * @returns {JSONPathClass}
 */
/**
 * @overload
 * @param {JSONPathOptions} opts If a string, will be treated as
 *   `expr`
 * @returns {unknown}
 */
/**
 * @param {JSONPathOptions|string} opts If a string, will be treated as `expr`
 * @param {string|AnyInput} [expr] JSON path to evaluate
 * @param {AnyInput|JSONPathCallback} [obj] JSON object to evaluate against
 * @param {JSONPathCallback|OtherTypeCallback} [callback] Passed 3
 *     arguments: 1) desired payload per `resultType`,
 *     2) `"value"|"property"`, 3) Full returned object with
 *     all payloads
 * @param {OtherTypeCallback} [otherTypeCallback] If `@other()` is at the end
 *   of one's query, this will be invoked with the value of the item, its
 *   path, its parent, and its parent's property name, and it should return
 *   a boolean indicating whether the supplied value belongs to the "other"
 *   type or not (or it may handle transformations and return `false`).
 * @throws {Error}
 * @returns {unknown|JSONPathClass}
 */
function JSONPath (opts, expr, obj, callback, otherTypeCallback) {
    try {
        if (opts && typeof opts === 'object') {
            return new JSONPathClass(opts);
        }
        return new JSONPathClass(
            opts,
            expr,
            /** @type {JSONPathCallback|undefined} */ (obj),
            /** @type {OtherTypeCallback|undefined} */ (callback),
            /** @type {undefined} */ (otherTypeCallback)
        );
    } catch (e) {
        if (new.target) {
            throw e;
        }
        if (e && typeof e === 'object' && 'value' in e) {
            return /** @type {{value: UnknownResult}} */ (e).value;
        }
        throw e;
    }
}

/**
 *
 */
class JSONPathClass {
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
     */
    /**
     * @overload
     * @param {JSONPathOptions} opts If a string, will be treated as
     *   `expr`
     */
    /**
     * @param {null|string|JSONPathOptions} opts If a string, will be treated as
     *   `expr`
     * @param {string|AnyInput} [expr] JSON path to evaluate
     * @param {AnyInput|JSONPathCallback} [obj] JSON object to evaluate against
     * @param {JSONPathCallback|OtherTypeCallback} [callback] Passed 3
     *     arguments: 1) desired payload per `resultType`,
     *     2) `"value"|"property"`, 3) Full returned
     *     object with all payloads
     * @param {OtherTypeCallback} [otherTypeCallback] If `@other()` is at the
     *   end of one's query, this will be invoked with the value of the item,
     *   its path, its parent, and its parent's property name, and it should
     *   return a boolean indicating whether the supplied value belongs to the
     *   "other" type or not (or it may handle transformations and return
     *   `false`).
     */
    constructor (opts, expr, obj, callback, otherTypeCallback) {
        if (typeof opts === 'string') {
            otherTypeCallback = /** @type {OtherTypeCallback} */ (
                callback
            );
            callback = /** @type {JSONPathCallback} */ (
                obj
            );
            obj = expr;
            expr = opts;
            opts = null;
        }
        const optObj = opts && typeof opts === 'object';
        opts ||= /** @type {JSONPathOptions} */ ({});
        /** @type {ResultType|undefined} */
        this.currResultType = undefined;

        /** @type {EvalValue|undefined} */
        this.currEval = undefined;

        /** @type {OtherTypeCallback|undefined} */
        this.currOtherTypeCallback = undefined;

        /** @type {Record<string, OtherTypeCallback>|undefined} */
        this.currCustomTypes = undefined;

        /** @type {SandboxType|undefined} */
        this.currSandbox = undefined;

        this._hasParentSelector = false;

        this.json = opts.json || obj;
        this.path = opts.path || expr;
        this.resultType = opts.resultType || 'value';
        this.flatten = Object.hasOwn(opts, 'flatten') ? opts.flatten : false;
        this.wrap = Object.hasOwn(opts, 'wrap') ? opts.wrap : true;
        this.sandbox = opts.sandbox || {};
        this.eval = opts.eval === undefined ? 'safe' : opts.eval;
        this.ignoreEvalErrors = (typeof opts.ignoreEvalErrors === 'undefined')
            ? false
            : opts.ignoreEvalErrors;
        this.parent = Object.hasOwn(opts, 'parent') ? opts.parent : null;
        this.parentProperty = Object.hasOwn(opts, 'parentProperty')
            ? opts.parentProperty
            : null;
        this.callback = opts.callback ||
            /** @type {JSONPathCallback} */
            (callback) ||
            null;
        this.otherTypeCallback = opts.otherTypeCallback ||
            otherTypeCallback ||
            function () {
                throw new TypeError(
                    'You must supply an otherTypeCallback callback option ' +
                    'with the @other() operator.'
                );
            };
        this.customTypes = opts.customTypes || {};

        if (opts.autostart !== false) {
            const args = /** @type {JSONPathOptions} */ ({
                path: (optObj ? opts.path : expr)
            });
            if (!optObj && obj !== undefined) {
                args.json = obj;
            } else if ('json' in opts) {
                args.json = opts.json;
            }
            const ret = this.evaluate(args);
            if (!ret || typeof ret !== 'object') {
                const err = /** @type {Error & {value: UnknownResult}} */ (
                    new Error(
                        'JSONPath should not be called with "new" (it ' +
                        'prevents return of (unwrapped) scalar values)'
                    )
                );
                err.value = ret;
                throw err;
            }

            // eslint-disable-next-line @stylistic/max-len -- Long
            // @ts-expect-error - Constructor returns evaluate result for legacy API
            // eslint-disable-next-line no-constructor-return -- Legacy API
            return ret;
        }
    }

    // PUBLIC METHODS

    /**
     * @overload
     * @param {JSONPathOptions} [expr]
     * @returns {ReturnObject|ReturnObject[]|undefined|unknown}
     */

    /**
     * @overload
     * @param {PathType|undefined} [expr]
     * @param {AnyInput} [json]
     * @param {JSONPathCallback|null} [callback]
     * @param {OtherTypeCallback} [otherTypeCallback]
     * @returns {ReturnObject|ReturnObject[]|undefined|unknown}
     */

    /**
     * @param {PathType|JSONPathOptions|undefined} [expr]
     * @param {AnyInput} [json]
     * @param {JSONPathCallback|null} [callback]
     * @param {OtherTypeCallback} [otherTypeCallback]
     * @returns {ReturnObject|ReturnObject[]|undefined|unknown}
     */
    evaluate (
        expr, json, callback, otherTypeCallback
    ) {
        let currParent = this.parent,
            currParentProperty = this.parentProperty;
        let {flatten, wrap} = this;

        this.currResultType = this.resultType;
        this.currEval = this.eval;
        this.currSandbox = this.sandbox;
        callback ||= this.callback;
        this.currOtherTypeCallback = otherTypeCallback ||
            this.otherTypeCallback;
        this.currCustomTypes = this.customTypes;

        if (expr && typeof expr === 'object' && !Array.isArray(expr)) {
            const exprObj = expr;
            if (!exprObj.path && exprObj.path !== '') {
                throw new TypeError(
                    'You must supply a "path" property when providing an ' +
                    'object argument to JSONPath.evaluate().'
                );
            }
            if (!(Object.hasOwn(exprObj, 'json'))) {
                throw new TypeError(
                    'You must supply a "json" property when providing an ' +
                    'object argument to JSONPath.evaluate().'
                );
            }
            ({json} = exprObj);
            flatten = Object.hasOwn(exprObj, 'flatten')
                ? exprObj.flatten
                : flatten;
            this.currResultType = Object.hasOwn(exprObj, 'resultType')
                ? exprObj.resultType
                : this.currResultType;
            this.currSandbox = Object.hasOwn(exprObj, 'sandbox')
                ? exprObj.sandbox
                : this.currSandbox;
            wrap = Object.hasOwn(exprObj, 'wrap') ? exprObj.wrap : wrap;
            this.currEval = Object.hasOwn(exprObj, 'eval')
                ? exprObj.eval
                : this.currEval;
            callback = Object.hasOwn(exprObj, 'callback')
                ? exprObj.callback
                : callback;
            this.currOtherTypeCallback = Object.hasOwn(
                exprObj, 'otherTypeCallback'
            )
                ? exprObj.otherTypeCallback
                : this.currOtherTypeCallback;
            this.currCustomTypes = Object.hasOwn(
                exprObj, 'customTypes'
            )
                ? exprObj.customTypes
                : this.currCustomTypes;
            currParent = Object.hasOwn(exprObj, 'parent')
                ? exprObj.parent
                : currParent;
            currParentProperty = Object.hasOwn(exprObj, 'parentProperty')
                ? exprObj.parentProperty
                : currParentProperty;
            expr = exprObj.path;
        } else {
            json ||= this.json;
            expr ||= this.path;
        }
        currParent ||= null;
        currParentProperty ||= null;

        if (Array.isArray(expr)) {
            expr = JSONPath.toPathString(expr);
        }
        if (!json || (!expr && expr !== '')) {
            return undefined;
        }

        const exprList = JSONPath.toPathArray(
            /** @type {string} */
            (expr)
        );
        if (exprList[0] === '$' && exprList.length > 1) {
            exprList.shift();
        }
        this._hasParentSelector = false;
        const traceResult = this._trace(
            exprList, json, ['$'], currParent,
            currParentProperty,
            callback ?? undefined,
            undefined
        );

        // eslint-disable-next-line @stylistic/max-len -- Long
        /* c8 ignore next 2 -- Unreachable: _trace returns array when hasArrExpr set */
        const result = (
            Array.isArray(traceResult) ? traceResult : [traceResult]
        ).filter((ea) => {
            return ea && !ea.isParentSelector;
        });

        if (!result.length) {
            // eslint-disable-next-line @stylistic/max-len -- Long
            /* c8 ignore next -- Unreachable: valid queries always produce results */
            return wrap ? [] : undefined;
        }
        if (!wrap && result.length === 1 && !result[0].hasArrExpr) {
            const preferredOutput = this._getPreferredOutput(result[0]);
            return preferredOutput;
        }
        const reduced = result.reduce(
            (rslt, ea) => {
                const valOrPath = this._getPreferredOutput(ea);
                if (flatten && Array.isArray(valOrPath)) {
                    rslt = rslt.concat(valOrPath);
                } else {
                    rslt.push(valOrPath);
                }
                return rslt;
            },
            /** @type {UnknownResult[]} */
            ([])
        );

        return reduced;
    }

    // PRIVATE METHODS

    /**
     * @param {ReturnObject} ea
     * @returns {PreferredOutput}
     */
    _getPreferredOutput (ea) {
        const resultType = this.currResultType;
        switch (resultType) {
        case 'all': {
            const path = Array.isArray(ea.path)
                ? ea.path
                : JSONPath.toPathArray(ea.path);
            ea.pointer = JSONPath.toPointer(/** @type {string[]} */ (path));
            ea.path = typeof ea.path === 'string'
                ? ea.path
                : JSONPath.toPathString(/** @type {string[]} */ (ea.path));
            return ea;
        } case 'value': case 'parent': case 'parentProperty':
            return /** @type {PreferredOutput} */ (ea[resultType]);
        case 'path':
            if (typeof ea.path === 'string') {
                return ea.path;
            }
            return JSONPath.toPathString(/** @type {string[]} */ (ea.path));
        case 'pointer': {
            const pathArray = Array.isArray(ea.path)
                ? ea.path
                : JSONPath.toPathArray(ea.path);
            return JSONPath.toPointer(/** @type {string[]} */ (pathArray));
        }
        default:
            throw new TypeError('Unknown result type');
        }
    }

    /**
     * @param {ReturnObject} fullRetObj
     * @param {JSONPathCallback|undefined} callback
     * @param {"value"|"property"} type
     * @returns {void}
     */
    _handleCallback (fullRetObj, callback, type) {
        // Early return if no callback provided (defensive
        //   check for internal calls)
        if (!callback) {
            return;
        }
        const preferredOutput = this._getPreferredOutput(fullRetObj);
        if (Array.isArray(fullRetObj.path)) {
            fullRetObj.path = JSONPath.toPathString(
                /** @type {string[]} */ (fullRetObj.path)
            );
        }
        callback(preferredOutput, type, fullRetObj);
    }

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
    _trace (
        expr, val, path, parent, parentPropName, callback, hasArrExpr,
        literalPriority
    ) {
        // No expr to follow? return path and value as the result of
        //  this trace branch
        let retObj;
        if (!expr.length) {
            retObj = {
                path,
                value: val,
                parent,
                parentProperty: parentPropName,
                hasArrExpr
            };
            this._handleCallback(retObj, callback, 'value');
            return retObj;
        }

        const loc = /** @type {string} */ (expr[0]), x = expr.slice(1);

        // We need to gather the return value of recursive trace calls in order
        //  to do the parent sel computation.
        /** @type {ReturnObject[]} */
        const ret = [];
        /**
         *
         * @param {ReturnObject|ReturnObject[]} elems
         * @returns {void}
         */
        function addRet (elems) {
            if (Array.isArray(elems)) {
                // This was causing excessive stack size in Node (with or
                //  without Babel) against our performance test:
                //  `ret.push(...elems);`
                elems.forEach((t) => {
                    ret.push(t);
                });
            } else {
                ret.push(elems);
            }
        }
        if (val && (typeof loc !== 'string' || literalPriority) &&
            Object.hasOwn(val, /** @type {PropertyKey} */ (loc))
        ) { // simple case--directly follow property
            const valObj = /** @type {Record<string, unknown>} */ (val);
            addRet(this._trace(
                x, valObj[/** @type {string} */ (loc)],
                push(path, loc),
                val, /** @type {string|number} */ (loc), callback,
                hasArrExpr
            ));
        // eslint-disable-next-line unicorn/prefer-switch -- Part of larger `if`
        } else if (loc === '*') { // all child properties
            this._walk(val, (m) => {
                const valObj = /** @type {Record<string, unknown>} */ (val);
                addRet(this._trace(
                    x, valObj[m], push(path, m), val, m, callback, true, true
                ));
            });
        } else if (loc === '..') { // all descendent parent properties
            // Check remaining expression with val's immediate children
            addRet(
                this._trace(x, val, path, parent, parentPropName, callback,
                    hasArrExpr)
            );
            this._walk(val, (m) => {
                // We don't join m and x here because we only want parents,
                //   not scalar values
                const valObj = /** @type {Record<string, unknown>} */ (val);
                if (typeof valObj[m] === 'object') {
                    // Keep going with recursive descent on val's
                    //   object children
                    addRet(this._trace(
                        expr.slice(),
                        valObj[m],
                        push(path, m),
                        val,
                        m,
                        callback,
                        true
                    ));
                }
            });
        // The parent sel computation is handled in the frame above using the
        // ancestor object of val
        } else if (loc === '^') {
            // This is not a final endpoint, so we do not invoke the
            //   callback here
            this._hasParentSelector = true;
            return /** @type {ReturnObject} */ ({
                path: path.slice(0, -1),
                expr: x,
                isParentSelector: true,
                value: undefined,
                parent: undefined,
                parentProperty: null
            });
        } else if (loc === '~') { // property name
            retObj = {
                path: push(path, loc),
                value: parentPropName,
                parent,
                parentProperty: null
            };
            this._handleCallback(retObj, callback, 'property');
            return retObj;
        } else if (loc === '$') { // root only
            addRet(this._trace(x, val, path, null, null, callback, hasArrExpr));
        } else if ((/^(-?\d*):(-?\d*):?(\d*)$/u).test(loc)) { // [start:end:step]  Python slice syntax
            const sliceResult = this._slice(
                loc, x, val, path, parent, parentPropName, callback
            );
            if (sliceResult) {
                addRet(sliceResult);
            }
        } else if (loc.indexOf('?(') === 0) { // [?(expr)] (filtering)
            if (this.currEval === false) {
                throw new Error(
                    'Eval [?(expr)] prevented in JSONPath expression.'
                );
            }
            const safeLoc = loc.replace(/^\?\((.*?)\)$/u, '$1');
            // check for a nested filter expression

            const nested = (/@.?([^?]*)[['](\??\(.*?\))(?!.\)\])[\]']/gu).exec(safeLoc);
            if (nested) {
                // find if there are matches in the nested expression
                // add them to the result set if there is at least one match
                this._walk(val, (m) => {
                    const npath = [nested[2]];
                    const valObj2 = /** @type {Record<string, unknown>} */ (
                        val
                    );
                    const nvalue = /** @type {ValueType} */ (nested[1]
                        ? /** @type {Record<string, unknown>} */ (
                            valObj2[m]
                        )[nested[1]]
                        : valObj2[m]);
                    const filterResults = this._trace(npath, nvalue, path,
                        parent, parentPropName, callback, true);
                    // eslint-disable-next-line @stylistic/max-len -- Long
                    /* c8 ignore next 3 -- Unreachable: _trace always returns array for nested filters */
                    const filterArray = Array.isArray(filterResults)
                        ? filterResults
                        : [filterResults];
                    if (filterArray.length > 0) {
                        addRet(this._trace(x, valObj2[m], push(path, m), val,
                            m, callback, true));
                    }
                });
            } else {
                const valObj3 = /** @type {Record<string, unknown>} */ (val);
                this._walk(val, (m) => {
                    if (this._eval(safeLoc, valObj3[m], m, path, parent,
                        parentPropName)) {
                        addRet(this._trace(x, valObj3[m], push(path, m), val, m,
                            callback, true));
                    }
                });
            }
        } else if (loc[0] === '(') { // [(expr)] (dynamic property/index)
            if (this.currEval === false) {
                throw new Error(
                    'Eval [(expr)] prevented in JSONPath expression.'
                );
            }
            // As this will resolve to a property name (but we don't know it
            //  yet), property and parent information is relative to the
            const evalResult = this._eval(
                /** @type {string} */ (loc),
                val, /** @type {string|number} */ (path.at(-1)),
                path.slice(0, -1), parent, parentPropName
            );
            const exprToUse = /** @type {string|number} */ (
                evalResult !== undefined ? evalResult : ''
            );
            addRet(this._trace(unshift(
                exprToUse,
                x
            ), val, path, parent, parentPropName, callback, hasArrExpr));
        } else if (loc[0] === '@') { // value type: @boolean(), etc.
            let addType = false;
            const valueType = /** @type {ValueType|string} */ (
                loc
            ).slice(1, -2);
            switch (valueType) {
            case 'scalar':
                if (!val || !(['object', 'function'].includes(typeof val))) {
                    addType = true;
                }
                break;
            case 'boolean': case 'string': case 'undefined': case 'function':
                if (typeof val === valueType) {
                    addType = true;
                }
                break;
            case 'integer':
                if (Number.isFinite(val) &&
                    !(/** @type {number} */ (val) % 1)) {
                    addType = true;
                }
                break;
            case 'number':
                if (Number.isFinite(val)) {
                    addType = true;
                }
                break;
            case 'nonFinite':
                if (typeof val === 'number' && !Number.isFinite(val)) {
                    addType = true;
                }
                break;
            case 'object':
                if (val && typeof val === valueType) {
                    addType = true;
                }
                break;
            case 'array':
                if (Array.isArray(val)) {
                    addType = true;
                }
                break;
            case 'other':
                addType = /** @type {OtherTypeCallback} */ (
                    this.currOtherTypeCallback
                )(
                    val, path, parent, parentPropName
                ) || false;
                break;
            case 'null':
                if (val === null) {
                    addType = true;
                }
                break;
            /* c8 ignore next 2 */
            default:
                if (this.currCustomTypes &&
                    Object.hasOwn(this.currCustomTypes, valueType)
                ) {
                    addType = this.currCustomTypes[valueType](
                        val, path, parent, parentPropName
                    ) || false;
                } else {
                    throw new TypeError('Unknown value type ' + valueType);
                }
            }
            if (addType) {
                retObj = {
                    path, value: val, parent, parentProperty: parentPropName
                };
                this._handleCallback(retObj, callback, 'value');
                return retObj;
            }
        // `-escaped property
        } else if (val && loc[0] === '`' &&
            Object.hasOwn(val, loc.slice(1))
        ) {
            const locProp = loc.slice(1);
            const valObj = /** @type {Record<string, unknown>} */ (val);
            addRet(this._trace(
                x, valObj[locProp], push(path, locProp), val, locProp, callback,
                hasArrExpr, true
            ));
        } else if (loc.includes(',')) { // [name1,name2,...]
            const parts = loc.split(',');
            for (const part of parts) {
                addRet(this._trace(
                    unshift(part, x),
                    val,
                    path,
                    parent,
                    parentPropName,
                    callback,
                    true
                ));
            }
        // simple case--directly follow property
        } else if (
            !literalPriority && val && Object.hasOwn(val, loc)
        ) {
            const valObj = /** @type {Record<string, unknown>} */ (val);
            addRet(
                this._trace(x, valObj[loc], push(path, loc), val, loc, callback,
                    hasArrExpr, true)
            );
        }

        // We check the resulting values for parent selections. For parent
        // selections we discard the value object and continue the trace with
        // the current val object
        if (this._hasParentSelector) {
            for (let t = 0; t < ret.length; t++) {
                const rett = ret[t];
                if (rett && rett.isParentSelector) {
                    const exprToUse = /** @type {ExpressionArray} */ (
                        rett.expr
                    );
                    const pathToUse = /** @type {ExpressionArray} */ (
                        rett.path
                    );
                    const tmp = this._trace(
                        exprToUse,
                        val,
                        pathToUse,
                        parent,
                        parentPropName,
                        callback,
                        hasArrExpr
                    );
                    if (Array.isArray(tmp)) {
                        ret[t] = tmp[0];
                        const tl = tmp.length;
                        for (let tt = 1; tt < tl; tt++) {
                            t++;
                            ret.splice(t, 0, tmp[tt]);
                        }
                    } else {
                        ret[t] = tmp;
                    }
                }
            }
        }
        return ret;
    }

    /**
     * @param {unknown} val
     * @param {(prop: string|number) => void} f
     * @returns {void}
     */
    _walk (val, f) {
        if (Array.isArray(val)) {
            const n = val.length;
            for (let i = 0; i < n; i++) {
                f(i);
            }
        } else if (val && typeof val === 'object') {
            Object.keys(val).forEach((m) => {
                f(m);
            });
        }
    }

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
    _slice (
        loc, expr, val, path, parent, parentPropName, callback
    ) {
        if (!Array.isArray(val)) {
            return undefined;
        }
        const len = val.length, parts = loc.split(':'),
            step = (parts[2] && Number(parts[2])) || 1;
        let start = (parts[0] && Number(parts[0])) || 0,
            end = parts[1] ? Number(parts[1]) : len;
        start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
        end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
        /** @type {ReturnObject[]} */
        const ret = [];
        for (let i = start; i < end; i += step) {
            const tmp = this._trace(
                unshift(i, expr),
                val,
                path,
                parent,
                parentPropName,
                callback,
                true
            );
            // Should only be possible to be an array here since first part of
            //   ``unshift(i, expr)` passed in above would not be empty,
            //     nor `~`, nor begin with `@` (as could return objects)
            // This was causing excessive stack size in Node (with or
            //  without Babel) against our performance test: `ret.push(...tmp);`
            // eslint-disable-next-line @stylistic/max-len -- Long
            /* c8 ignore next -- Unreachable: _trace returns array when expr non-empty */
            const tmpArray = Array.isArray(tmp) ? tmp : [tmp];
            tmpArray.forEach((t) => {
                ret.push(t);
            });
        }
        return ret;
    }

    /**
     * @param {string} code
     * @param {unknown} _v
     * @param {string|number} _vname
     * @param {ExpressionArray} path
     * @param {ParentValue} parent
     * @param {ParentProperty} parentPropName
     * @returns {UnknownResult}
     */
    _eval (
        code, _v, _vname, path, parent, parentPropName
    ) {
        if (this.currSandbox) {
            this.currSandbox._$_parentProperty = parentPropName;
            this.currSandbox._$_parent = parent;
            this.currSandbox._$_property = _vname;
            this.currSandbox._$_root = this.json;
            this.currSandbox._$_v = _v;
        }

        const containsPath = code.includes('@path');
        if (containsPath) {
            // eslint-disable-next-line @stylistic/max-len -- Long
            /* c8 ignore next -- Unreachable: currSandbox set in evaluate() before _eval */
            const currSandbox = this.currSandbox ?? {};
            currSandbox._$_path = JSONPath.toPathString(
                /** @type {string[]} */ (path.concat([_vname]))
            );
        }

        const scriptCacheKey = this.currEval + 'Script:' + code;
        if (!scriptCache.has(scriptCacheKey)) {
            let script = code
                .replaceAll('@parentProperty', '_$_parentProperty')
                .replaceAll('@parent', '_$_parent')
                .replaceAll('@property', '_$_property')
                .replaceAll('@root', '_$_root')
                .replaceAll(/@([.\s)[])/gu, '_$_v$1');
            if (containsPath) {
                script = script.replaceAll('@path', '_$_path');
            }
            const evalType = /** @type {string|boolean|undefined} */ (
                this.currEval
            );
            if (['safe', true, undefined].includes(evalType)) {
                // eslint-disable-next-line @stylistic/max-len -- Long
                /* eslint-disable unicorn/no-undeclared-class-members -- Prototype members */
                scriptCache.set(scriptCacheKey, new (
                    /**
                     * @type {JSONPathClass & {
                     *   safeVm: SafeScriptType,
                     *   vm: ScriptType
                     * }}
                     */ (/** @type {unknown} */ (this))
                ).safeVm.Script(script));
            // eslint-disable-next-line @stylistic/max-len -- Long
            /* eslint-enable unicorn/no-undeclared-class-members -- End prototype member scope */
            } else if (this.currEval === 'native') {
                // eslint-disable-next-line @stylistic/max-len -- Long
                /* eslint-disable unicorn/no-undeclared-class-members -- Prototype members */
                scriptCache.set(scriptCacheKey, new (
                    /**
                     * @type {JSONPathClass & {
                     *   safeVm: SafeScriptType,
                     *   vm: ScriptType
                     * }}
                     */ (/** @type {unknown} */ (this))
                ).vm.Script(script));
                // eslint-disable-next-line @stylistic/max-len -- Long
                /* eslint-enable unicorn/no-undeclared-class-members -- End prototype member scope */
            } else if (
                typeof this.currEval === 'function' &&
                this.currEval.prototype &&
                Object.hasOwn(this.currEval.prototype, 'runInNewContext')
            ) {
                const CurrEval = this.currEval;
                // eslint-disable-next-line @stylistic/max-len -- Long
                // @ts-expect-error - Type checked above to have proper constructor
                scriptCache.set(scriptCacheKey, new CurrEval(script));
            } else if (typeof this.currEval === 'function') {
                // Type narrowing: at this point currEval is a function
                //   but not a constructor
                const evalFunc = /** @type {EvalCallback} */ (this.currEval);
                scriptCache.set(scriptCacheKey, {
                    runInNewContext: (
                        /** @type {ContextItem} */ context
                    ) => evalFunc(script, context)
                });
            } else {
                throw new TypeError(
                    `Unknown "eval" property "${this.currEval}"`
                );
            }
        }

        try {
            /**
             * @typedef {{
             *   runInNewContext: (
             *     ctx: SandboxType|undefined
             *   ) => EvaluatedResult
             * }} RunInNewContext
             */

            return /** @type {RunInNewContext} */ (
                scriptCache.get(scriptCacheKey)
            ).runInNewContext(
                this.currSandbox
            );
        } catch (e) {
            if (this.ignoreEvalErrors) {
                return false;
            }
            const error = /** @type {Error} */ (e);
            throw new Error('jsonPath: ' + error.message + ': ' + code, {
                cause: e
            });
        }
    }
}

/** @type {{safeVm: SafeScriptType}} */
(/** @type {unknown} */ (JSONPathClass.prototype)).safeVm = {
    Script: SafeScript
};

JSONPath.prototype = JSONPathClass.prototype;

// PUBLIC CLASS PROPERTIES AND METHODS

/**
 * Clears cached parsed paths and compiled scripts.
 * @returns {void}
 */
JSONPath.clearCache = function () {
    pathCache.clear();
    scriptCache.clear();
};

/**
 * @param {string[]} pathArr Array to convert
 * @returns {string} The path string
 */
JSONPath.toPathString = function (pathArr) {
    const x = pathArr, n = x.length;
    let p = '$';
    for (let i = 1; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/u).test(x[i])) {
            p += (/^[0-9*]+$/u).test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
        }
    }
    return p;
};

/**
 * @param {string[]} pointer JSON Path array
 * @returns {string} JSON Pointer
 */
JSONPath.toPointer = function (pointer) {
    const x = pointer, n = x.length;
    let p = '';
    for (let i = 1; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/u).test(x[i])) {
            p += '/' + x[i].toString()
                .replaceAll('~', '~0')
                .replaceAll('/', '~1');
        }
    }
    return p;
};

/**
 * @param {string} expr Expression to convert
 * @returns {string[]}
 */
JSONPath.toPathArray = function (expr) {
    if (pathCache.has(expr)) {
        return /** @type {string[]} */ (pathCache.get(expr)).concat();
    }
    /** @type {string[]} */
    const subx = [];
    const normalized = expr
        // Properties
        .replaceAll(
            /@[\w$-]+\(\)/gu,
            ';$&;'
        )
        // Parenthetical evaluations (filtering and otherwise), directly
        //   within brackets or single quotes
        .replaceAll(/[['](\??\(.*?\))[\]'](?!.\])/gu, function ($0, $1) {
            return '[#' +
                // eslint-disable-next-line @stylistic/max-len -- Long
                // eslint-disable-next-line unicorn/no-return-array-push -- Optimization
                (subx.push($1) - 1) +
                ']';
        })
        // Escape periods and tildes within properties
        .replaceAll(/\[['"]([^'\]]*)['"]\]/gu, function ($0, prop) {
            return "['" + prop
                .replaceAll('.', '%@%')
                .replaceAll('~', '%%@@%%') +
                "']";
        })
        // Properties operator
        .replaceAll('~', ';~;')
        // Split by property boundaries

        .replaceAll(/['"]?\.['"]?(?![^[]*\])|\[['"]?/gu, ';')
        // Reinsert periods within properties
        .replaceAll('%@%', '.')
        // Reinsert tildes within properties
        .replaceAll('%%@@%%', '~')
        // Parent
        .replaceAll(/(?:;)?(\^+)(?:;)?/gu, function ($0, ups) {
            return ';' + ups.split('').join(';') + ';';
        })
        // Descendents
        .replaceAll(/;;;|;;/gu, ';..;')
        // Remove trailing
        .replaceAll(/;$|'?\]|'$/gu, '');

    const exprList = normalized.split(';').map(function (exp) {
        const match = exp.match(/#(\d+)/u);
        return !match || !match[1] ? exp : subx[Number(match[1])];
    });
    pathCache.set(expr, exprList);
    return /** @type {string[]} */ (pathCache.get(expr)).concat();
};

export {JSONPath, JSONPathClass};
