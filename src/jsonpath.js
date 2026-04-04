/* eslint-disable camelcase -- Convenient for escaping */

import {SafeScript} from './Safe-Script.js';

/**
 * @typedef {null|boolean|number|string|object|GenericArray} JSONObject
 */

/**
 * @typedef {any} AnyItem
 */

/**
 * @typedef {any} AnyResult
 */

/**
 * Copies array and then pushes item into it.
 * @param {GenericArray} arr Array to copy and into which to push
 * @param {AnyItem} item Array item to add (to end)
 * @returns {GenericArray} Copy of the original array
 */
function push (arr, item) {
    arr = arr.slice();
    arr.push(item);
    return arr;
}
/**
 * Copies array and then unshifts item into it.
 * @param {AnyItem} item Array item to add (to beginning)
 * @param {GenericArray} arr Array to copy and into which to unshift
 * @returns {GenericArray} Copy of the original array
 */
function unshift (item, arr) {
    arr = arr.slice();
    arr.unshift(item);
    return arr;
}

/**
 * Caught when JSONPath is used without `new` but rethrown if with `new`
 * @extends Error
 */
class NewError extends Error {
    /**
     * @param {AnyResult} value The evaluated scalar value
     */
    constructor (value) {
        super(
            'JSONPath should not be called with "new" (it prevents return ' +
            'of (unwrapped) scalar values)'
        );
        this.avoidNew = true;
        this.value = value;
        this.name = 'NewError';
    }
}

/**
* @typedef {object} ReturnObject
* @property {string} path
* @property {JSONObject} value
* @property {object|GenericArray} parent
* @property {string} parentProperty
*/

/**
* @callback JSONPathCallback
* @param {string|object} preferredOutput
* @param {"value"|"property"} type
* @param {ReturnObject} fullRetObj
* @returns {void}
*/

/**
* @callback OtherTypeCallback
* @param {JSONObject} val
* @param {string} path
* @param {object|GenericArray} parent
* @param {string} parentPropName
* @returns {boolean}
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
 * @typedef {typeof SafeScript} EvalClass
 */

/**
 * @typedef {object} JSONPathOptions
 * @property {JSON} json
 * @property {string|string[]} path
 * @property {"value"|"path"|"pointer"|"parent"|"parentProperty"|
 *   "all"} [resultType="value"]
 * @property {boolean} [flatten=false]
 * @property {boolean} [wrap=true]
 * @property {object} [sandbox={}]
 * @property {EvalCallback|EvalClass|'safe'|'native'|
 *   boolean} [eval = 'safe']
 * @property {object|GenericArray|null} [parent=null]
 * @property {string|null} [parentProperty=null]
 * @property {JSONPathCallback} [callback]
 * @property {OtherTypeCallback} [otherTypeCallback] Defaults to
 *   function which throws on encountering `@other`
 * @property {boolean} [autostart=true]
 */

/**
 * @param {string|JSONPathOptions} opts If a string, will be treated as `expr`
 * @param {string} [expr] JSON path to evaluate
 * @param {JSON} [obj] JSON object to evaluate against
 * @param {JSONPathCallback} [callback] Passed 3 arguments: 1) desired payload
 *     per `resultType`, 2) `"value"|"property"`, 3) Full returned object with
 *     all payloads
 * @param {OtherTypeCallback} [otherTypeCallback] If `@other()` is at the end
 *   of one's query, this will be invoked with the value of the item, its
 *   path, its parent, and its parent's property name, and it should return
 *   a boolean indicating whether the supplied value belongs to the "other"
 *   type or not (or it may handle transformations and return `false`).
 * @returns {JSONPath}
 * @class
 */
function JSONPath (opts, expr, obj, callback, otherTypeCallback) {
    // eslint-disable-next-line no-restricted-syntax -- Allow for pseudo-class
    if (!(this instanceof JSONPath)) {
        try {
            return new JSONPath(opts, expr, obj, callback, otherTypeCallback);
        } catch (e) {
            if (!e.avoidNew) {
                throw e;
            }
            return e.value;
        }
    }

    if (typeof opts === 'string') {
        otherTypeCallback = callback;
        callback = obj;
        obj = expr;
        expr = opts;
        opts = null;
    }
    const optObj = opts && typeof opts === 'object';
    opts = opts || {};
    this.json = opts.json || obj;
    this.path = opts.path || expr;
    this.resultType = opts.resultType || 'value';
    this.flatten = opts.flatten || false;
    this.wrap = Object.hasOwn(opts, 'wrap') ? opts.wrap : true;
    this.sandbox = opts.sandbox || {};
    this.eval = opts.eval === undefined ? 'safe' : opts.eval;
    this.ignoreEvalErrors = (typeof opts.ignoreEvalErrors === 'undefined')
        ? false
        : opts.ignoreEvalErrors;
    this.parent = opts.parent || null;
    this.parentProperty = opts.parentProperty || null;
    this.callback = opts.callback || callback || null;
    this.otherTypeCallback = opts.otherTypeCallback ||
        otherTypeCallback ||
        function () {
            throw new TypeError(
                'You must supply an otherTypeCallback callback option ' +
                'with the @other() operator.'
            );
        };

    if (opts.autostart !== false) {
        const args = {
            path: (optObj ? opts.path : expr)
        };
        if (!optObj) {
            args.json = obj;
        } else if ('json' in opts) {
            args.json = opts.json;
        }
        const ret = this.evaluate(args);
        if (!ret || typeof ret !== 'object') {
            throw new NewError(ret);
        }
        return ret;
    }
}

// PUBLIC METHODS
JSONPath.prototype.evaluate = function (
    expr, json, callback, otherTypeCallback
) {
    let currParent = this.parent,
        currParentProperty = this.parentProperty;
    let {flatten, wrap} = this;

    this.currResultType = this.resultType;
    this.currEval = this.eval;
    this.currSandbox = this.sandbox;
    callback = callback || this.callback;
    this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;

    json = json || this.json;
    expr = expr || this.path;
    if (expr && typeof expr === 'object' && !Array.isArray(expr)) {
        if (!expr.path && expr.path !== '') {
            throw new TypeError(
                'You must supply a "path" property when providing an object ' +
                'argument to JSONPath.evaluate().'
            );
        }
        if (!(Object.hasOwn(expr, 'json'))) {
            throw new TypeError(
                'You must supply a "json" property when providing an object ' +
                'argument to JSONPath.evaluate().'
            );
        }
        ({json} = expr);
        flatten = Object.hasOwn(expr, 'flatten') ? expr.flatten : flatten;
        this.currResultType = Object.hasOwn(expr, 'resultType')
            ? expr.resultType
            : this.currResultType;
        this.currSandbox = Object.hasOwn(expr, 'sandbox')
            ? expr.sandbox
            : this.currSandbox;
        wrap = Object.hasOwn(expr, 'wrap') ? expr.wrap : wrap;
        this.currEval = Object.hasOwn(expr, 'eval')
            ? expr.eval
            : this.currEval;
        callback = Object.hasOwn(expr, 'callback') ? expr.callback : callback;
        this.currOtherTypeCallback = Object.hasOwn(expr, 'otherTypeCallback')
            ? expr.otherTypeCallback
            : this.currOtherTypeCallback;
        currParent = Object.hasOwn(expr, 'parent') ? expr.parent : currParent;
        currParentProperty = Object.hasOwn(expr, 'parentProperty')
            ? expr.parentProperty
            : currParentProperty;
        expr = expr.path;
    }
    currParent = currParent || null;
    currParentProperty = currParentProperty || null;

    if (Array.isArray(expr)) {
        expr = JSONPath.toPathString(expr);
    }
    if ((!expr && expr !== '') || !json) {
        return undefined;
    }

    const exprList = JSONPath.toPathParts(expr);
    if (exprList[0] && exprList[0].type === 'root' && exprList.length > 1) {
        exprList.shift();
    }
    this._hasParentSelector = null;
    this._json = json; // Store root for parent selector navigation
    const result = this
        ._trace(
            exprList, json, ['$'], currParent, currParentProperty, callback
        )
        .filter(function (ea) {
            return ea && !ea.isParentSelector;
        });

    if (!result.length) {
        return wrap ? [] : undefined;
    }
    if (!wrap && result.length === 1 && !result[0].hasArrExpr) {
        return this._getPreferredOutput(result[0]);
    }
    return result.reduce((rslt, ea) => {
        const valOrPath = this._getPreferredOutput(ea);
        if (flatten && Array.isArray(valOrPath)) {
            rslt = rslt.concat(valOrPath);
        } else {
            rslt.push(valOrPath);
        }
        return rslt;
    }, []);
};

// PRIVATE METHODS

JSONPath.prototype._getPreferredOutput = function (ea) {
    const resultType = this.currResultType;
    switch (resultType) {
    case 'all': {
        const path = Array.isArray(ea.path)
            ? ea.path
            : JSONPath.toPathParts(ea.path);
        ea.pointer = JSONPath.toPointer(path);
        ea.path = typeof ea.path === 'string'
            ? ea.path
            : JSONPath.toPathString(ea.path);
        return ea;
    } case 'value': case 'parent': case 'parentProperty':
        return ea[resultType];
    case 'path':
        return JSONPath.toPathString(ea[resultType]);
    case 'pointer':
        return JSONPath.toPointer(ea.path);
    default:
        throw new TypeError('Unknown result type');
    }
};

JSONPath.prototype._handleCallback = function (fullRetObj, callback, type) {
    if (callback) {
        const preferredOutput = this._getPreferredOutput(fullRetObj);
        fullRetObj.path = typeof fullRetObj.path === 'string'
            ? fullRetObj.path
            : JSONPath.toPathString(fullRetObj.path);
        // eslint-disable-next-line n/callback-return -- No need to return
        callback(preferredOutput, type, fullRetObj);
    }
};

/**
 *
 * @param {string} expr
 * @param {JSONObject} val
 * @param {string} path
 * @param {object|GenericArray} parent
 * @param {string} parentPropName
 * @param {JSONPathCallback} callback
 * @param {boolean} hasArrExpr
 * @param {boolean} literalPriority
 * @returns {ReturnObject|ReturnObject[]}
 */
JSONPath.prototype._trace = function (
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
        return [retObj];
    }

    const token = expr[0], x = expr.slice(1);

    // We need to gather the return value of recursive trace calls in order to
    // do the parent sel computation.
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

    // Fast path for primitive tokens (strings and numbers)
    if (typeof token === 'string') {
        // Simple property access
        if (val && Object.hasOwn(val, token)) {
            addRet(this._trace(
                x, val[token], push(path, token), val, token, callback, hasArrExpr
            ));
        }
    } else if (typeof token === 'number') {
        // Simple numeric index access
        if (Array.isArray(val) && token >= 0 && token < val.length) {
            addRet(this._trace(
                x, val[token], push(path, token), val, token, callback, hasArrExpr
            ));
        }
    } else if (token && typeof token === 'object' && token.type) {
        // Handle complex token objects
        switch (token.type) {
        case 'root': // $
            addRet(this._trace(x, val, path, null, null, callback, hasArrExpr));
            break;

        case 'property': {
            const propName = token.value;
            // Check if property exists (escaped flag just means it's not wildcard)
            if (val && Object.hasOwn(val, propName)) {
                addRet(this._trace(
                    x, val[propName], push(path, propName), val, propName, callback,
                    hasArrExpr, true
                ));
            }
            break;
        }

        case 'wildcard': // *
            this._walk(val, (m) => {
                addRet(this._trace(
                    x, val[m], push(path, m), val, m, callback, true, true
                ));
            });
            break;

        case 'descent': // ..
            // Check remaining expression with val's immediate children
            addRet(
                this._trace(x, val, path, parent, parentPropName, callback,
                    hasArrExpr)
            );
            this._walk(val, (m) => {
                // We don't join m and x here because we only want parents,
                //   not scalar values
                if (typeof val[m] === 'object') {
                    // Keep going with recursive descent on val's
                    //   object children
                    addRet(this._trace(
                        expr.slice(), val[m], push(path, m), val, m, callback, true
                    ));
                }
            });
            break;

        case 'parent': // ^
            // This is not a final endpoint, so we do not invoke the callback here
            // Only allow parent selector if we're not already at root
            if (path.length > 1) {
                this._hasParentSelector = true;
                ret.push({
                    path: path.slice(0, -1),
                    expr: x,
                    isParentSelector: true
                });
            }
            break;

        case 'propertyName': // ~
            retObj = {
                path: push(path, '~'),
                value: parentPropName,
                parent,
                parentProperty: null
            };
            this._handleCallback(retObj, callback, 'property');
            ret.push(retObj);
            break;

        case 'index': {
            const idx = token.value;
            if ((Array.isArray(val) && idx >= 0 && idx < val.length) ||
                (val && Object.hasOwn(val, idx))) {
                addRet(this._trace(
                    x, val[idx], push(path, idx), val, idx, callback,
                    hasArrExpr, true
                ));
            }
            break;
        }

        case 'slice':
            addRet(
                this._slice(token, x, val, path, parent, parentPropName, callback)
            );
            break;

        case 'filter': {
            if (this.currEval === false) {
                throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
            }

            // Quick check: Does this filter have nested paths?
            const hasNesting = token.expression.includes('[?(');

            if (!hasNesting) {
                // Fast path: No nesting, skip extraction
                this._walk(val, (m) => {
                    if (this._eval(token.expression, val[m], m, path,
                        parent, parentPropName)) {
                        addRet(this._trace(x, val[m], push(path, m), val, m,
                            callback, true));
                    }
                });
            } else {
                // Slow path: Extract and handle nested filters
                const {expression: modifiedExpr, nestedPaths} =
                    this._extractNestedFilters(token.expression);

                // Check if expression is JUST a nested path (no other JavaScript)
                // If so, we need to check array length for truthiness
                const isSingleNestedPath = nestedPaths.length === 1 &&
                    modifiedExpr.trim() === '_$_jp0';

                // Evaluate filter for each item
                this._walk(val, (m) => {
                    // Evaluate nested paths in context of current item
                    const nestedResults = {};
                    for (const [i, nestedPath] of nestedPaths.entries()) {
                        // Convert @ to $ for parsing (@ means current value)
                        const pathForParsing = nestedPath.replace(/^@/u, '$');
                        try {
                            const nestedTokens = JSONPath.toPathParts(pathForParsing);
                            // Evaluate nested path on current item
                            const nestedResult = this._trace(
                                nestedTokens,
                                val[m],
                                push(path, m),
                                val,
                                m,
                                null, // no callback for nested evaluation
                                true
                            );
                            // Extract values from result objects
                            nestedResults[`_$_jp${i}`] =
                                nestedResult.map((r) => r.value);
                        } catch (e) {
                            // If nested evaluation fails, treat as no matches
                            nestedResults[`_$_jp${i}`] = [];
                        }
                    }

                    // Add nested results to sandbox temporarily
                    const originalSandbox = {...this.currSandbox};
                    Object.assign(this.currSandbox, nestedResults);

                    try {
                        // For single nested path, check if array has elements
                        // (empty arrays are truthy in JS but should be falsy in filter)
                        const matches = isSingleNestedPath
                            ? nestedResults._$_jp0.length > 0
                            : this._eval(modifiedExpr, val[m], m, path,
                                parent, parentPropName);

                        if (matches) {
                            addRet(this._trace(x, val[m], push(path, m), val, m,
                                callback, true));
                        }
                    } finally {
                        // Restore original sandbox (remove nested result placeholders)
                        this.currSandbox = originalSandbox;
                    }
                });
            }
            break;
        }

        case 'dynamic': {
            if (this.currEval === false) {
                throw new Error('Eval [(expr)] prevented in JSONPath expression.');
            }
            // As this will resolve to a property name (but we don't know it
            //  yet), property and parent information is relative to the
            //  parent of the property to which this expression will resolve
            addRet(this._trace(unshift(
                this._eval(
                    token.expression, val, path.at(-1),
                    path.slice(0, -1), parent, parentPropName
                ),
                x
            ), val, path, parent, parentPropName, callback, hasArrExpr));
            break;
        }

        case 'typeOperator': {
            let addType = false;
            const {valueType} = token;
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
                if (Number.isFinite(val) && !(val % 1)) {
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
                addType = this.currOtherTypeCallback(
                    val, path, parent, parentPropName
                );
                break;
            case 'null':
                if (val === null) {
                    addType = true;
                }
                break;
            /* c8 ignore next 2 */
            default:
                throw new TypeError('Unknown value type ' + valueType);
            }
            if (addType) {
                retObj = {
                    path, value: val, parent, parentProperty: parentPropName
                };
                this._handleCallback(retObj, callback, 'value');
                ret.push(retObj);
            }
            break;
        }

        case 'multiProperty': {
            const parts = token.properties;
            const escapedFlags = token.escaped || [];
            for (const [i, part] of parts.entries()) {
                // Check if part is a number (multi-index) or string (multi-property)
                let partToken;
                if (typeof part === 'number') {
                    partToken = {type: 'index', value: part};
                } else {
                    const isEscaped = escapedFlags[i] || false;
                    partToken = {
                        type: 'property',
                        value: part,
                        escaped: isEscaped
                    };
                }
                addRet(this._trace(
                    unshift(partToken, x), val, path, parent, parentPropName,
                    callback, true
                ));
            }
            break;
        }
        }
    } else if ((typeof token !== 'string' || literalPriority) && val &&
        Object.hasOwn(val, token)
    ) { // simple case--directly follow property (for object tokens or with literalPriority)
        addRet(this._trace(x, val[token], push(path, token), val, token, callback,
            hasArrExpr));
    }
    // Note: Legacy string token handling removed - now handled by fast path above

    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    if (this._hasParentSelector) {
        for (let t = 0; t < ret.length; t++) {
            const rett = ret[t];
            if (rett && rett.isParentSelector) {
                // Navigate from root to the parent path to get correct parent context
                // rett.path is the path with last element removed (e.g., ['$', 'children'])
                let resultVal = this._json;
                let resultParent = null;
                let resultParentProp = null;

                // Navigate from root following the path
                // Start at index 1 to skip '$'
                for (let i = 1; i < rett.path.length; i++) {
                    resultParent = resultVal;
                    resultParentProp = rett.path[i];
                    resultVal = resultVal[rett.path[i]];
                }

                const tmp = this._trace(
                    rett.expr, resultVal, rett.path, resultParent,
                    resultParentProp, callback, hasArrExpr
                );
                if (Array.isArray(tmp)) {
                    ret[t] = tmp[0];
                    const tl = tmp.length;
                    for (let tt = 1; tt < tl; tt++) {
                        // eslint-disable-next-line @stylistic/max-len -- Long
                        // eslint-disable-next-line sonarjs/updated-loop-counter -- Convenient
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
};

JSONPath.prototype._walk = function (val, f) {
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
};

/**
 * Extract nested JSONPath expressions from a filter expression.
 * @param {string} expr - Filter expression (e.g., "@.children[?(@.price<10)]")
 * @returns {{expression: string, nestedPaths: string[]}} Modified expression and extracted paths
 */
JSONPath.prototype._extractNestedFilters = function (expr) {
    // Check cache first
    const cache = JSONPath.filterExtractionCache;
    if (cache[expr]) {
        // Return shallow clone to prevent mutation
        return {
            expression: cache[expr].expression,
            nestedPaths: [...cache[expr].nestedPaths]
        };
    }

    const nestedPaths = [];
    let result = expr;
    let placeholderCount = 0;

    // We need to find patterns like @.path[?(...)] or @[?(...)], etc.
    // Use a stack-based approach to handle nested brackets properly

    /**
     * Find the next JSONPath expression starting with @.
     * @param {string} str - String to search
     * @param {number} startPos - Position to start searching
     * @returns {{start: number, end: number, path: string} | null}
     */
    function findNextNestedPath (str, startPos) {
        let i = startPos;

        // Find next @ that's not in a string or regex literal
        while (i < str.length) {
            const ch = str[i];

            // Skip string literals
            if (ch === '"' || ch === "'") {
                const quote = ch;
                i++;
                while (i < str.length) {
                    if (str[i] === '\\' && i + 1 < str.length) {
                        i += 2; // Skip escaped character
                    } else if (str[i] === quote) {
                        i++;
                        break;
                    } else {
                        i++;
                    }
                }
                continue;
            }

            // Skip regex literals (simplified detection)
            if (ch === '/' && i > 0) {
                // Check if this might be a regex (not division)
                // Look back for operators that could precede a regex
                const prevNonSpace = str.slice(0, i).trimEnd().slice(-1);
                if ('=([{,;:!&|?'.includes(prevNonSpace) || i === startPos) {
                    i++;
                    while (i < str.length) {
                        if (str[i] === '\\' && i + 1 < str.length) {
                            i += 2;
                        } else if (str[i] === '/') {
                            i++;
                            // Skip regex flags
                            while (i < str.length && (/[gimsuvy]/u).test(str[i])) {
                                i++;
                            }
                            break;
                        } else {
                            i++;
                        }
                    }
                    continue;
                }
            }

            // Found @ - check if it's followed by JSONPath syntax
            if (ch === '@') {
                const pathStart = i;
                i++; // Move past @

                // Check if there's path syntax after @
                // Could be: @.prop, @[, @.., @@
                if (i >= str.length) {
                    return null;
                }

                let hasPathSyntax = false;
                let path = '@';

                // Parse the JSONPath expression
                while (i < str.length) {
                    const c = str[i];

                    // Path components
                    if (c === '.' || c === '[' || c === '*' ||
                        c === '^' || c === '~') {
                        hasPathSyntax = true;
                        path += c;
                        i++;

                        // Handle bracket notation with bracket matching
                        if (c === '[') {
                            let depth = 1;
                            /* eslint-disable unicorn/prefer-switch --
                               Complex bracket matching with nested quotes */
                            while (i < str.length && depth > 0) {
                                if (str[i] === '\\' && i + 1 < str.length) {
                                    path += str[i] + str[i + 1];
                                    i += 2;
                                } else if (str[i] === '"' || str[i] === "'") {
                                    // Handle quoted strings in brackets
                                    const q = str[i];
                                    path += str[i];
                                    i++;
                                    while (i < str.length && str[i] !== q) {
                                        if (str[i] === '\\' && i + 1 < str.length) {
                                            path += str[i] + str[i + 1];
                                            i += 2;
                                        } else {
                                            path += str[i];
                                            i++;
                                        }
                                    }
                                    if (i < str.length) {
                                        path += str[i];
                                        i++;
                                    }
                                } else if (str[i] === '[') {
                                    depth++;
                                    path += str[i];
                                    i++;
                                } else if (str[i] === ']') {
                                    depth--;
                                    path += str[i];
                                    i++;
                                } else {
                                    path += str[i];
                                    i++;
                                }
                            }
                            /* eslint-enable unicorn/prefer-switch --
                               Re-enable after bracket matching section */
                        }
                    } else if ((/[\w$]/u).test(c)) {
                        // Property name characters
                        hasPathSyntax = true;
                        path += c;
                        i++;
                    } else {
                        // End of path
                        break;
                    }
                }

                // Check if this path contains a filter (has [?(...)])
                // Only extract paths that have filters to avoid unnecessary evaluation
                if (hasPathSyntax && path.includes('[?')) {
                    return {
                        start: pathStart,
                        end: i,
                        path
                    };
                }

                // No filter found, continue searching
                continue;
            }

            i++;
        }

        return null;
    }

    // Extract all nested paths
    let searchPos = 0;
    const replacements = [];

    while (searchPos < result.length) {
        const found = findNextNestedPath(result, searchPos);
        if (!found) {
            break;
        }

        // Store the replacement to be made
        replacements.push({
            start: found.start,
            end: found.end,
            path: found.path,
            placeholder: `_$_jp${placeholderCount}`
        });

        nestedPaths.push(found.path);
        placeholderCount++;
        searchPos = found.end;
    }

    // Apply replacements in reverse order to maintain positions
    for (let i = replacements.length - 1; i >= 0; i--) {
        const {start, end, placeholder} = replacements[i];
        result = result.slice(0, start) + placeholder + result.slice(end);
    }

    // Cache the result
    const extractionResult = {
        expression: result,
        nestedPaths
    };
    cache[expr] = extractionResult;

    return {
        expression: result,
        nestedPaths: [...nestedPaths]
    };
};

JSONPath.prototype._slice = function (
    token, expr, val, path, parent, parentPropName, callback
) {
    if (!Array.isArray(val)) {
        return undefined;
    }
    const len = val.length;
    let start = token.start === null ? 0 : token.start;
    let end = token.end === null ? len : token.end;
    const step = token.step === null ? 1 : token.step;

    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
    const ret = [];
    for (let i = start; i < end; i += step) {
        const tmp = this._trace(
            unshift(i, expr), val, path, parent, parentPropName, callback, true
        );
        // Should only be possible to be an array here since first part of
        //   ``unshift(i, expr)` passed in above would not be empty, nor `~`,
        //     nor begin with `@` (as could return objects)
        // This was causing excessive stack size in Node (with or
        //  without Babel) against our performance test: `ret.push(...tmp);`
        tmp.forEach((t) => {
            ret.push(t);
        });
    }
    return ret;
};

JSONPath.prototype._eval = function (
    code, _v, _vname, path, parent, parentPropName
) {
    this.currSandbox._$_parentProperty = parentPropName;
    this.currSandbox._$_parent = parent;
    this.currSandbox._$_property = _vname;
    this.currSandbox._$_root = this.json;
    this.currSandbox._$_v = _v;

    const containsPath = code.includes('@path');
    if (containsPath) {
        this.currSandbox._$_path = JSONPath.toPathString(path.concat([_vname]));
    }

    const scriptCacheKey = this.currEval + 'Script:' + code;
    if (!JSONPath.cache[scriptCacheKey]) {
        let script = code
            .replaceAll('@parentProperty', '_$_parentProperty')
            .replaceAll('@parent', '_$_parent')
            .replaceAll('@property', '_$_property')
            .replaceAll('@root', '_$_root')
            .replaceAll(/@([.\s)[])/gu, '_$_v$1');
        if (containsPath) {
            script = script.replaceAll('@path', '_$_path');
        }
        if (
            this.currEval === 'safe' ||
            this.currEval === true ||
            this.currEval === undefined
        ) {
            JSONPath.cache[scriptCacheKey] = new this.safeVm.Script(script);
        } else if (this.currEval === 'native') {
            JSONPath.cache[scriptCacheKey] = new this.vm.Script(script);
        } else if (
            typeof this.currEval === 'function' &&
            this.currEval.prototype &&
            Object.hasOwn(this.currEval.prototype, 'runInNewContext')
        ) {
            const CurrEval = this.currEval;
            JSONPath.cache[scriptCacheKey] = new CurrEval(script);
        } else if (typeof this.currEval === 'function') {
            JSONPath.cache[scriptCacheKey] = {
                runInNewContext: (context) => this.currEval(script, context)
            };
        } else {
            throw new TypeError(`Unknown "eval" property "${this.currEval}"`);
        }
    }

    try {
        return JSONPath.cache[scriptCacheKey].runInNewContext(this.currSandbox);
    } catch (e) {
        if (this.ignoreEvalErrors) {
            return false;
        }
        throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
};

// PUBLIC CLASS PROPERTIES AND METHODS

// Could store the cache object itself
JSONPath.cache = {};
JSONPath.pathPartsCache = {};
JSONPath.filterExtractionCache = {};

/**
 * @param {string[]|object[]} pathArr Array to convert
 * @returns {string} The path string
 */
JSONPath.toPathString = function (pathArr) {
    const x = pathArr, n = x.length;
    let p = '$';
    for (let i = 1; i < n; i++) {
        const item = x[i];

        // Handle both old string format and new token format
        if (typeof item === 'number') {
            // Array index
            p += '[' + item + ']';
        } else if (typeof item === 'string') {
            // Legacy path
            if (!(/^(~|\^|@.*?\(\))$/u).test(item)) {
                p += (/^[0-9*]+$/u).test(item) ? ('[' + item + ']') : ("['" + item + "']");
            }
        } else if (item && typeof item === 'object') {
            // New token format
            switch (item.type) {
            case 'property':
                p += "['" + item.value + "']";
                break;
            case 'index':
                p += '[' + item.value + ']';
                break;
            case 'wildcard':
                p += '[*]';
                break;
            case 'slice':
                p += '[' + item.raw + ']';
                break;
            case 'filter':
                p += '[?(' + item.expression + ')]';
                break;
            case 'dynamic':
                p += '[(' + item.expression + ')]';
                break;
            case 'typeOperator':
                p += '@' + item.valueType + '()';
                break;
            case 'multiProperty':
                p += "['" + item.properties.join("','") + "']";
                break;
            // Special operators don't add to path string
            case 'root':
            case 'descent':
            case 'parent':
            case 'propertyName':
                break;
            }
        }
    }
    return p;
};

/**
 * Converts path array to JSON Pointer format.
 * Handles both legacy string arrays and new token objects.
 * @param {string[]|object[]} pointer - Path array
 * @returns {string} JSON Pointer
 */
JSONPath.toPointer = function (pointer) {
    const x = pointer, n = x.length;
    let p = '';
    for (let i = 1; i < n; i++) {
        const item = x[i];
        let value;

        // Handle different formats
        if (typeof item === 'number') {
            value = String(item);
        } else if (typeof item === 'string') {
            // Legacy string format or special operators
            if ((/^(~|\^|@.*?\(\))$/u).test(item)) {
                continue; // Skip special operators
            }
            value = item;
        } else if (item && typeof item === 'object') {
            // New token format
            switch (item.type) {
            case 'property': {
                const {value: propValue} = item;
                value = propValue;
                break;
            }
            case 'index': {
                const {value: indexValue} = item;
                value = String(indexValue);
                break;
            }
            // Skip special operators
            case 'root':
            case 'wildcard':
            case 'descent':
            case 'parent':
            case 'propertyName':
            case 'filter':
            case 'dynamic':
            case 'slice':
            case 'typeOperator':
            case 'multiProperty':
                continue;
            default:
                continue;
            }
        } else {
            continue;
        }

        // Escape ~ and / per JSON Pointer spec
        p += '/' + value
            .replaceAll('~', '~0')
            .replaceAll('/', '~1');
    }
    return p;
};


/**
 * Parse a JSONPath expression into structured tokens.
 * @param {string} expr - JSONPath expression
 * @returns {Array<string|object>} Array of tokens
 */
/**
 * Parses a JSONPath expression into structured token objects.
 * @param {string} expr - JSONPath expression to parse
 * @returns {object[]} Array of token objects
 */
JSONPath.toPathParts = function (expr) {
    const cache = JSONPath.pathPartsCache;
    if (cache[expr]) {
        // Shallow clone array, shallow clone object tokens
        // (tokens are simple objects with no nested objects)
        return cache[expr].map((token) => (
            typeof token === 'object' && token !== null ? {...token} : token
        ));
    }

    const tokens = [];
    let i = 0;

    // Handle empty path - treat as empty property access
    if (expr === '') {
        // Hybrid token: empty property is a string
        tokens.push('');
        cache[expr] = tokens;
        return cache[expr].map((token) => (
            typeof token === 'object' && token !== null ? {...token} : token
        ));
    }

    /**
     * Extract balanced content between delimiters.
     * @param {number} start - Starting position
     * @param {string} open - Opening delimiter
     * @param {string} close - Closing delimiter
     * @throws {SyntaxError} If delimiters are unbalanced
     * @returns {{content: string, end: number}} Extracted content and end position
     */
    function extractBalanced (start, open, close) {
        let depth = 1;
        let j = start;
        while (j < expr.length && depth > 0) {
            if (expr[j] === open) {
                depth++;
            } else if (expr[j] === close) {
                depth--;
            }
            j++;
        }
        if (depth !== 0) {
            throw new SyntaxError(
                `Unbalanced ${open}${close} in expression at position ${start}`
            );
        }
        return {content: expr.slice(start, j - 1), end: j};
    }

    /**
     * Extract quoted string.
     * @param {number} start - Starting position (after quote)
     * @param {string} quote - Quote character
     * @throws {SyntaxError} If string is unterminated
     * @returns {{content: string, end: number, escaped: boolean}} Extracted content, end position, and whether it's backtick-escaped
     */
    function extractQuoted (start, quote) {
        let j = start;
        let content = '';
        let escaped = false;

        while (j < expr.length) {
            if (expr[j] === '\\' && j + 1 < expr.length) {
                // Handle backslash escape sequences
                content += expr[j + 1];
                j += 2;
            } else if (expr[j] === '`' && j + 1 < expr.length) {
                // Handle backtick escape - backtick escapes next char
                content += expr[j + 1];
                escaped = true;
                j += 2;
            } else if (expr[j] === quote) {
                return {content, end: j + 1, escaped};
            } else {
                content += expr[j];
                j++;
            }
        }
        throw new SyntaxError(`Unterminated string at position ${start - 1}`);
    }

    /**
     * Handle dot notation (.property or ..descendant).
     * @throws {SyntaxError} If malformed
     * @returns {void}
     */
    function handleDotNotation () {
        if (i + 1 < expr.length && expr[i + 1] === '.') {
            // Descendant (..)
            tokens.push({type: 'descent'});
            i += 2;
        } else {
            // Skip the dot and parse property name
            i++;
            if (i >= expr.length) {
                throw new SyntaxError('Unexpected end after dot at position ' + (i - 1));
            }

            // Check what follows the dot
            switch (expr[i]) {
            case '*':
                tokens.push({type: 'wildcard'});
                i++;
                break;
            case '`':
                // Backtick escapes the next character
                i++; // Skip backtick
                if (i >= expr.length) {
                    throw new SyntaxError(
                        'Unexpected end after backtick at position ' + (i - 1)
                    );
                }
                // The escaped character becomes the property name
                tokens.push({
                    type: 'property',
                    value: expr[i],
                    escaped: true
                });
                i++;
                break;
            case '[':
                // Dot followed by bracket: interpret as descent
                // e.g., $.[?(...)] becomes $ .. [?(...)]
                tokens.push({type: 'descent'});
                break;
            default: {
                // Regular property name (until next special char)
                let propName = '';
                while (i < expr.length && !(/[.[\]^~@*]/u).test(expr[i])) {
                    propName += expr[i];
                    i++;
                }
                if (propName) {
                    // Hybrid token: use string for unescaped properties
                    tokens.push(propName);
                }
            }
            }
        }
    }

    /**
     * Handle bracket notation [...].
     * @throws {SyntaxError} If malformed
     * @returns {void}
     */
    function handleBracketNotation () {
        i++; // Skip [
        if (i >= expr.length) {
            throw new SyntaxError('Unexpected end after [ at position ' + (i - 1));
        }

        // Skip whitespace
        while (i < expr.length && (/\s/u).test(expr[i])) {
            i++;
        }

        const ch = expr[i];

        // Wildcard [*]
        if (ch === '*') {
            i++;
            // Skip whitespace and closing bracket
            while (i < expr.length && (/\s/u).test(expr[i])) {
                i++;
            }
            if (expr[i] !== ']') {
                throw new SyntaxError('Expected ] after * at position ' + i);
            }
            i++;
            tokens.push({type: 'wildcard'});
            return;
        }

        // Filter [?(expression)]
        if (ch === '?') {
            if (i + 1 >= expr.length || expr[i + 1] !== '(') {
                throw new SyntaxError(
                    'Expected ( after ? at position ' + i
                );
            }
            i += 2; // Skip ?(
            const result = extractBalanced(i, '(', ')');
            const {content: expression} = result;
            i = result.end;

            // Skip whitespace and closing bracket
            while (i < expr.length && (/\s/u).test(expr[i])) {
                i++;
            }
            if (expr[i] !== ']') {
                throw new SyntaxError(
                    'Expected ] after filter at position ' + i
                );
            }
            i++;
            tokens.push({type: 'filter', expression});
            return;
        }

        // Dynamic [(expression)]
        if (ch === '(') {
            i++; // Skip (
            const result = extractBalanced(i, '(', ')');
            const {content: expression} = result;
            i = result.end;

            // Skip whitespace and closing bracket
            while (i < expr.length && (/\s/u).test(expr[i])) {
                i++;
            }
            if (expr[i] !== ']') {
                throw new SyntaxError(
                    'Expected ] after dynamic expression at position ' + i
                );
            }
            i++;
            tokens.push({type: 'dynamic', expression});
            return;
        }

        // Quoted property ['name'] or ["name"]
        if (ch === "'" || ch === '"') {
            const quote = ch;
            i++; // Skip opening quote
            const result = extractQuoted(i, quote);
            const {content, escaped} = result;
            i = result.end;

            // Skip whitespace
            while (i < expr.length && (/\s/u).test(expr[i])) {
                i++;
            }

            // Check for comma (multi-property)
            if (expr[i] === ',') {
                const properties = [content];
                const escapedFlags = [escaped];
                while (expr[i] === ',') {
                    i++; // Skip comma
                    // Skip whitespace
                    while (i < expr.length && (/\s/u).test(expr[i])) {
                        i++;
                    }
                    if (expr[i] !== "'" && expr[i] !== '"') {
                        throw new SyntaxError(
                            'Expected quoted property after comma at position ' + i
                        );
                    }
                    const q = expr[i];
                    i++;
                    const r = extractQuoted(i, q);
                    properties.push(r.content);
                    escapedFlags.push(r.escaped);
                    i = r.end;
                    // Skip whitespace
                    while (i < expr.length && (/\s/u).test(expr[i])) {
                        i++;
                    }
                }
                if (expr[i] !== ']') {
                    throw new SyntaxError(
                        'Expected ] after multi-property at position ' + i
                    );
                }
                i++;
                tokens.push({
                    type: 'multiProperty',
                    properties,
                    escaped: escapedFlags
                });
                return;
            }

            if (expr[i] !== ']') {
                throw new SyntaxError(
                    'Expected ] after quoted property at position ' + i
                );
            }
            i++;
            // Check if quoted property is wildcard
            if (content === '*' && !escaped) {
                tokens.push({type: 'wildcard'});
            } else if (escaped) {
                // Keep object for escaped properties (metadata needed)
                tokens.push({type: 'property', value: content, escaped: true});
            } else {
                // Hybrid token: use string for unescaped properties
                tokens.push(content);
            }
            return;
        }

        // Number (index, slice, or multi-index)
        if ((/[-\d]/u).test(ch) || ch === ':') {
            let numStr = '';
            while (i < expr.length && (/[-\d:]/u).test(expr[i])) {
                numStr += expr[i];
                i++;
            }

            // Skip whitespace
            while (i < expr.length && (/\s/u).test(expr[i])) {
                i++;
            }

            // Check for comma (multi-index like [0,1,2])
            if (expr[i] === ',') {
                const indices = [Number.parseInt(numStr)];
                while (expr[i] === ',') {
                    i++; // Skip comma
                    // Skip whitespace
                    while (i < expr.length && (/\s/u).test(expr[i])) {
                        i++;
                    }
                    // Read next number
                    let nextNum = '';
                    while (i < expr.length && (/[-\d]/u).test(expr[i])) {
                        nextNum += expr[i];
                        i++;
                    }
                    indices.push(Number.parseInt(nextNum));
                    // Skip whitespace
                    while (i < expr.length && (/\s/u).test(expr[i])) {
                        i++;
                    }
                }
                if (expr[i] !== ']') {
                    throw new SyntaxError(
                        'Expected ] after multi-index at position ' + i
                    );
                }
                i++;
                // Create multiProperty token with numeric properties
                tokens.push({type: 'multiProperty', properties: indices});
                return;
            }

            if (expr[i] !== ']') {
                throw new SyntaxError(
                    'Expected ] after number at position ' + i
                );
            }
            i++;

            // Check if it's a slice (contains :)
            if (numStr.includes(':')) {
                const parts = numStr.split(':');
                const start = parts[0] === ''
                    ? null
                    : Number.parseInt(parts[0]);
                const end = parts[1] === ''
                    ? null
                    : Number.parseInt(parts[1]);
                const step = parts.length > 2 && parts[2] !== ''
                    ? Number.parseInt(parts[2])
                    : null;
                tokens.push({type: 'slice', start, end, step, raw: numStr});
            } else {
                // Simple index - Hybrid token: use number directly
                const index = Number.parseInt(numStr);
                tokens.push(index);
            }
            return;
        }

        // Unquoted property (identifier)
        // In brackets, unquoted properties can have backtick escapes
        let propName = '';
        let escaped = false;
        while (i < expr.length && expr[i] !== ']' && expr[i] !== ',' &&
            !(/\s/u).test(expr[i])) {
            if (expr[i] === '`' && i + 1 < expr.length &&
                expr[i + 1] !== ']' && expr[i + 1] !== ',') {
                // Backtick escapes next character
                propName += expr[i + 1];
                escaped = true;
                i += 2;
            } else {
                propName += expr[i];
                i++;
            }
        }

        // Skip whitespace
        while (i < expr.length && (/\s/u).test(expr[i])) {
            i++;
        }

        // Check for comma (multi-property with unquoted names)
        if (expr[i] === ',') {
            const properties = [propName];
            const escapedFlags = [escaped];
            while (expr[i] === ',') {
                i++; // Skip comma
                // Skip whitespace
                while (i < expr.length && (/\s/u).test(expr[i])) {
                    i++;
                }
                let prop = '';
                let propEscaped = false;
                while (i < expr.length && expr[i] !== ']' && expr[i] !== ',' &&
                    !(/\s/u).test(expr[i])) {
                    if (expr[i] === '`' && i + 1 < expr.length &&
                        expr[i + 1] !== ']' && expr[i + 1] !== ',') {
                        // Backtick escapes next character
                        prop += expr[i + 1];
                        propEscaped = true;
                        i += 2;
                    } else {
                        prop += expr[i];
                        i++;
                    }
                }
                if (!prop) {
                    throw new SyntaxError(
                        'Expected property name after comma at position ' + i
                    );
                }
                properties.push(prop);
                escapedFlags.push(propEscaped);
                // Skip whitespace
                while (i < expr.length && (/\s/u).test(expr[i])) {
                    i++;
                }
            }
            if (expr[i] !== ']') {
                throw new SyntaxError(
                    'Expected ] after multi-property at position ' + i
                );
            }
            i++;
            tokens.push({
                type: 'multiProperty',
                properties,
                escaped: escapedFlags
            });
            return;
        }

        if (expr[i] !== ']') {
            throw new SyntaxError(
                'Expected ] after property at position ' + i
            );
        }
        i++;
        if (propName) {
            if (escaped) {
                // Keep object for escaped properties
                tokens.push({type: 'property', value: propName, escaped: true});
            } else {
                // Hybrid token: use string for unescaped properties
                tokens.push(propName);
            }
        }
    }

    /**
     * Handle type operator `@type()`.
     * @throws {SyntaxError} If malformed
     * @returns {void}
     */
    function handleTypeOperator () {
        i++; // Skip @
        let typeName = '';
        while (i < expr.length && (/[a-z]/ui).test(expr[i])) {
            typeName += expr[i];
            i++;
        }
        if (i + 1 >= expr.length || expr[i] !== '(' || expr[i + 1] !== ')') {
            throw new SyntaxError(
                'Expected () after @' + typeName + ' at position ' + i
            );
        }
        i += 2; // Skip ()
        tokens.push({type: 'typeOperator', valueType: typeName});
    }

    // If path doesn't start with $, [, or other special char, add implicit root
    if (expr.length > 0 && !['$', '[', '.', '^', '~', '@'].includes(expr[0])) {
        tokens.push({type: 'root'});
        // Prepend with a dot to make it valid for our parser
        expr = '.' + expr;
    }

    // Main parsing loop
    while (i < expr.length) {
        const ch = expr[i];

        switch (ch) {
        case '$':
            tokens.push({type: 'root'});
            i++;
            break;
        case '.':
            handleDotNotation();
            break;
        case '[':
            handleBracketNotation();
            break;
        case '*':
            // Wildcard (can appear after .. without a dot)
            tokens.push({type: 'wildcard'});
            i++;
            break;
        case '^':
            // If parent selector comes right after root (or at start),
            // add implicit empty string property
            // This handles cases like "^" or "$^" which should be "['']^"
            if (tokens.length === 0 ||
                (tokens.length === 1 && tokens[0].type === 'root')) {
                // Hybrid token: empty property is a string
                tokens.push('');
            }
            tokens.push({type: 'parent'});
            i++;
            break;
        case '~':
            tokens.push({type: 'propertyName'});
            i++;
            break;
        case '@':
            // Check if this is a type operator like @boolean()
            // Type operators have the pattern: @identifier()
            if ((/^@[a-z]+\(\)/ui).test(expr.slice(i))) {
                handleTypeOperator();
            } else {
                // Treat @ as part of a property name
                let propName = '';
                while (i < expr.length && (/[\w$@\\]/u).test(expr[i])) {
                    propName += expr[i];
                    i++;
                }
                if (propName) {
                    // Hybrid token: use string for unescaped properties
                    tokens.push(propName);
                }
            }
            break;
        case ' ':
        case '\t':
        case '\n':
        case '\r':
            // Skip whitespace
            i++;
            break;
        default:
            // Try to parse as identifier (property name)
            if ((/[\w$]/u).test(ch)) {
                let propName = '';
                while (i < expr.length && (/[\w$]/u).test(expr[i])) {
                    propName += expr[i];
                    i++;
                }
                // Hybrid token: use string for unescaped properties
                tokens.push(propName);
            } else {
                throw new SyntaxError(
                    `Unexpected character '${ch}' at position ${i}`
                );
            }
        }
    }

    cache[expr] = tokens;
    return tokens.map((token) => (
        typeof token === 'object' && token !== null ? {...token} : token
    ));
};

JSONPath.prototype.safeVm = {
    Script: SafeScript
};

export {JSONPath};
