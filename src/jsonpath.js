/* eslint-disable no-eval */

const globalEval = eval;
const supportsNodeVM = typeof module !== 'undefined' && !!module.exports &&
    !(typeof navigator !== 'undefined' && navigator.product === 'ReactNative');
const allowedResultTypes = ['value', 'path', 'pointer', 'parent', 'parentProperty', 'all'];
const {hasOwnProperty} = Object.prototype;

/**
 * Copy items out of one array into another
 * @param {Array} source Array with items to copy
 * @param {Array} target Array to which to copy
 * @param {function} conditionCb Callback passed the current item; will move
 *     item if evaluates to `true`
 * @returns {undefined}
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

const vm = supportsNodeVM
    ? require('vm') : {
        /**
         * @param {string} expr Expression to evaluate
         * @param {object} context Object whose items will be added to evaluation
         * @returns {*} Result of evaluated code
         */
        runInNewContext (expr, context) {
            const keys = Object.keys(context);
            const funcs = [];
            moveToAnotherArray(keys, funcs, (key) => {
                return typeof context[key] === 'function';
            });
            const code = funcs.reduce((s, func) => {
                let fString = context[func].toString();
                if (!(/function/).exec(fString)) {
                    fString = 'function ' + fString;
                }
                return 'var ' + func + '=' + fString + ';' + s;
            }, '') + keys.reduce((s, vr) => {
                return 'var ' + vr + '=' + JSON.stringify(context[vr]).replace(
                    // http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
                    /\u2028|\u2029/g, (m) => {
                        return '\\u202' + (m === '\u2028' ? '8' : '9');
                    }
                ) + ';' + s;
            }, expr);
            return globalEval(code);
        }
    };

/**
 * Copies array and then pushes item into it
 * @param {array} arr Array to copy and into which to push
 * @param {*} item Array item to add (to end)
 * @returns {array} Copy of the original array
 */
function push (arr, item) {
    arr = arr.slice();
    arr.push(item);
    return arr;
}
/**
 * Copies array and then unshifts item into it
 * @param {*} item Array item to add (to beginning)
 * @param {array} arr Array to copy and into which to unshift
 * @returns {array} Copy of the original array
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
     * @param {*} value The evaluated scalar value
     */
    constructor (value) {
        super('JSONPath should not be called with "new" (it prevents return of (unwrapped) scalar values)');
        this.avoidNew = true;
        this.value = value;
    }
}

/**
 * @param {object} [opts] If present, must be an object
 * @param {string} expr JSON path to evaluate
 * @param {JSON} obj JSON object to evaluate against
 * @param {function} callback Passed 3 arguments: 1) desired payload per `resultType`,
 *     2) `"value"|"property"`, 3) Full returned object with all payloads
 * @param {function} otherTypeCallback If `@other()` is at the end of one's query, this
 *  will be invoked with the value of the item, its path, its parent, and its parent's
 *  property name, and it should return a boolean indicating whether the supplied value
 *  belongs to the "other" type or not (or it may handle transformations and return `false`).
 * @constructor
 */
function JSONPath (opts, expr, obj, callback, otherTypeCallback) {
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
        opts = {};
    }
    opts = opts || {};
    const objArgs = opts.hasOwnProperty('json') && opts.hasOwnProperty('path');
    this.json = opts.json || obj;
    this.path = opts.path || expr;
    this.resultType = (opts.resultType && opts.resultType.toLowerCase()) || 'value';
    this.flatten = opts.flatten || false;
    this.wrap = opts.hasOwnProperty('wrap') ? opts.wrap : true;
    this.sandbox = opts.sandbox || {};
    this.preventEval = opts.preventEval || false;
    this.parent = opts.parent || null;
    this.parentProperty = opts.parentProperty || null;
    this.callback = opts.callback || callback || null;
    this.otherTypeCallback = opts.otherTypeCallback || otherTypeCallback || function () {
        throw new Error('You must supply an otherTypeCallback callback option with the @other() operator.');
    };

    if (opts.autostart !== false) {
        const ret = this.evaluate({
            path: (objArgs ? opts.path : expr),
            json: (objArgs ? opts.json : obj)
        });
        if (!ret || typeof ret !== 'object') {
            throw new NewError(ret);
        }
        return ret;
    }
}

// PUBLIC METHODS
JSONPath.prototype.evaluate = function (expr, json, callback, otherTypeCallback) {
    const self = this;
    let currParent = this.parent,
        currParentProperty = this.parentProperty;
    let {flatten, wrap} = this;

    this.currResultType = this.resultType;
    this.currPreventEval = this.preventEval;
    this.currSandbox = this.sandbox;
    callback = callback || this.callback;
    this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;

    json = json || this.json;
    expr = expr || this.path;
    if (expr && typeof expr === 'object') {
        if (!expr.path) {
            throw new Error('You must supply a "path" property when providing an object argument to JSONPath.evaluate().');
        }
        json = expr.hasOwnProperty('json') ? expr.json : json;
        flatten = expr.hasOwnProperty('flatten') ? expr.flatten : flatten;
        this.currResultType = expr.hasOwnProperty('resultType') ? expr.resultType : this.currResultType;
        this.currSandbox = expr.hasOwnProperty('sandbox') ? expr.sandbox : this.currSandbox;
        wrap = expr.hasOwnProperty('wrap') ? expr.wrap : wrap;
        this.currPreventEval = expr.hasOwnProperty('preventEval') ? expr.preventEval : this.currPreventEval;
        callback = expr.hasOwnProperty('callback') ? expr.callback : callback;
        this.currOtherTypeCallback = expr.hasOwnProperty('otherTypeCallback') ? expr.otherTypeCallback : this.currOtherTypeCallback;
        currParent = expr.hasOwnProperty('parent') ? expr.parent : currParent;
        currParentProperty = expr.hasOwnProperty('parentProperty') ? expr.parentProperty : currParentProperty;
        expr = expr.path;
    }
    currParent = currParent || null;
    currParentProperty = currParentProperty || null;

    if (Array.isArray(expr)) {
        expr = JSONPath.toPathString(expr);
    }
    if (!expr || !json || !allowedResultTypes.includes(this.currResultType)) {
        return;
    }
    this._obj = json;

    const exprList = JSONPath.toPathArray(expr);
    if (exprList[0] === '$' && exprList.length > 1) { exprList.shift(); }
    this._hasParentSelector = null;
    const result = this
        ._trace(exprList, json, ['$'], currParent, currParentProperty, callback)
        .filter(function (ea) { return ea && !ea.isParentSelector; });

    if (!result.length) { return wrap ? [] : undefined; }
    if (result.length === 1 && !wrap && !Array.isArray(result[0].value)) {
        return this._getPreferredOutput(result[0]);
    }
    return result.reduce(function (result, ea) {
        const valOrPath = self._getPreferredOutput(ea);
        if (flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
        } else {
            result.push(valOrPath);
        }
        return result;
    }, []);
};

// PRIVATE METHODS

JSONPath.prototype._getPreferredOutput = function (ea) {
    const resultType = this.currResultType;
    switch (resultType) {
    case 'all':
        ea.path = typeof ea.path === 'string' ? ea.path : JSONPath.toPathString(ea.path);
        return ea;
    case 'value': case 'parent': case 'parentProperty':
        return ea[resultType];
    case 'path':
        return JSONPath.toPathString(ea[resultType]);
    case 'pointer':
        return JSONPath.toPointer(ea.path);
    }
};

JSONPath.prototype._handleCallback = function (fullRetObj, callback, type) {
    if (callback) {
        const preferredOutput = this._getPreferredOutput(fullRetObj);
        fullRetObj.path = typeof fullRetObj.path === 'string'
            ? fullRetObj.path
            : JSONPath.toPathString(fullRetObj.path);
        callback(preferredOutput, type, fullRetObj);
    }
};

JSONPath.prototype._trace = function (
    expr, val, path, parent, parentPropName, callback, literalPriority
) {
    // No expr to follow? return path and value as the result of this trace branch
    let retObj;
    const self = this;
    if (!expr.length) {
        retObj = {path, value: val, parent, parentProperty: parentPropName};
        this._handleCallback(retObj, callback, 'value');
        return retObj;
    }

    const loc = expr[0], x = expr.slice(1);

    // We need to gather the return value of recursive trace calls in order to
    // do the parent sel computation.
    const ret = [];
    function addRet (elems) {
        if (Array.isArray(elems)) {
            elems.forEach((t) => {
                ret.push(t);
            });
        } else {
            ret.push(elems);
        }
    }

    if ((typeof loc !== 'string' || literalPriority) && val &&
        hasOwnProperty.call(val, loc)
    ) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback));
    } else if (loc === '*') { // all child properties
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            addRet(self._trace(unshift(m, x), v, p, par, pr, cb, true));
        });
    } else if (loc === '..') { // all descendent parent properties
        addRet(this._trace(x, val, path, parent, parentPropName, callback)); // Check remaining expression with val's immediate children
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            // We don't join m and x here because we only want parents, not scalar values
            if (typeof v[m] === 'object') { // Keep going with recursive descent on val's object children
                addRet(self._trace(unshift(l, x), v[m], push(p, m), v, m, cb));
            }
        });
    // The parent sel computation is handled in the frame above using the
    // ancestor object of val
    } else if (loc === '^') {
        // This is not a final endpoint, so we do not invoke the callback here
        this._hasParentSelector = true;
        return path.length ? {
            path: path.slice(0, -1),
            expr: x,
            isParentSelector: true
        } : [];
    } else if (loc === '~') { // property name
        retObj = {path: push(path, loc), value: parentPropName, parent, parentProperty: null};
        this._handleCallback(retObj, callback, 'property');
        return retObj;
    } else if (loc === '$') { // root only
        addRet(this._trace(x, val, path, null, null, callback));
    } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  Python slice syntax
        addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
    } else if (loc.indexOf('?(') === 0) { // [?(expr)] (filtering)
        if (this.currPreventEval) {
            throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
        }
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            if (self._eval(l.replace(/^\?\((.*?)\)$/, '$1'), v[m], m, p, par, pr)) {
                addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
            }
        });
    } else if (loc[0] === '(') { // [(expr)] (dynamic property/index)
        if (this.currPreventEval) {
            throw new Error('Eval [(expr)] prevented in JSONPath expression.');
        }
        // As this will resolve to a property name (but we don't know it yet), property and parent information is relative to the parent of the property to which this expression will resolve
        addRet(this._trace(unshift(
            this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName),
            x
        ), val, path, parent, parentPropName, callback));
    } else if (loc[0] === '@') { // value type: @boolean(), etc.
        let addType = false;
        const valueType = loc.slice(1, -2);
        switch (valueType) {
        case 'scalar':
            if (!val || !(['object', 'function'].includes(typeof val))) {
                addType = true;
            }
            break;
        case 'boolean': case 'string': case 'undefined': case 'function':
            if (typeof val === valueType) { // eslint-disable-line valid-typeof
                addType = true;
            }
            break;
        case 'number':
            if (typeof val === valueType && isFinite(val)) { // eslint-disable-line valid-typeof
                addType = true;
            }
            break;
        case 'nonFinite':
            if (typeof val === 'number' && !isFinite(val)) {
                addType = true;
            }
            break;
        case 'object':
            if (val && typeof val === valueType) { // eslint-disable-line valid-typeof
                addType = true;
            }
            break;
        case 'array':
            if (Array.isArray(val)) {
                addType = true;
            }
            break;
        case 'other':
            addType = this.currOtherTypeCallback(val, path, parent, parentPropName);
            break;
        case 'integer':
            if (val === +val && isFinite(val) && !(val % 1)) {
                addType = true;
            }
            break;
        case 'null':
            if (val === null) {
                addType = true;
            }
            break;
        }
        if (addType) {
            retObj = {path, value: val, parent, parentProperty: parentPropName};
            this._handleCallback(retObj, callback, 'value');
            return retObj;
        }
    } else if (loc[0] === '`' && val && hasOwnProperty.call(val, loc.slice(1))) { // `-escaped property
        const locProp = loc.slice(1);
        addRet(this._trace(x, val[locProp], push(path, locProp), val, locProp, callback, true));
    } else if (loc.includes(',')) { // [name1,name2,...]
        const parts = loc.split(',');
        for (const part of parts) {
            addRet(this._trace(unshift(part, x), val, path, parent, parentPropName, callback));
        }
    } else if (!literalPriority && val && hasOwnProperty.call(val, loc)) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, true));
    }

    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    if (this._hasParentSelector) {
        for (let t = 0; t < ret.length; t++) {
            const rett = ret[t];
            if (rett.isParentSelector) {
                const tmp = self._trace(
                    rett.expr, val, rett.path, parent, parentPropName, callback
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
};

JSONPath.prototype._walk = function (loc, expr, val, path, parent, parentPropName, callback, f) {
    if (Array.isArray(val)) {
        const n = val.length;
        for (let i = 0; i < n; i++) {
            f(i, loc, expr, val, path, parent, parentPropName, callback);
        }
    } else if (typeof val === 'object') {
        for (const m in val) {
            if (hasOwnProperty.call(val, m)) {
                f(m, loc, expr, val, path, parent, parentPropName, callback);
            }
        }
    }
};

JSONPath.prototype._slice = function (loc, expr, val, path, parent, parentPropName, callback) {
    if (!Array.isArray(val)) { return; }
    const len = val.length, parts = loc.split(':'),
        step = (parts[2] && parseInt(parts[2], 10)) || 1;
    let start = (parts[0] && parseInt(parts[0], 10)) || 0,
        end = (parts[1] && parseInt(parts[1], 10)) || len;
    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
    const ret = [];
    for (let i = start; i < end; i += step) {
        const tmp = this._trace(unshift(i, expr), val, path, parent, parentPropName, callback);
        if (Array.isArray(tmp)) {
            tmp.forEach((t) => {
                ret.push(t);
            });
        } else {
            ret.push(tmp);
        }
    }
    return ret;
};

JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
    if (!this._obj || !_v) { return false; }
    if (code.includes('@parentProperty')) {
        this.currSandbox._$_parentProperty = parentPropName;
        code = code.replace(/@parentProperty/g, '_$_parentProperty');
    }
    if (code.includes('@parent')) {
        this.currSandbox._$_parent = parent;
        code = code.replace(/@parent/g, '_$_parent');
    }
    if (code.includes('@property')) {
        this.currSandbox._$_property = _vname;
        code = code.replace(/@property/g, '_$_property');
    }
    if (code.includes('@path')) {
        this.currSandbox._$_path = JSONPath.toPathString(path.concat([_vname]));
        code = code.replace(/@path/g, '_$_path');
    }
    if (code.match(/@([.\s)[])/)) {
        this.currSandbox._$_v = _v;
        code = code.replace(/@([.\s)[])/g, '_$_v$1');
    }
    try {
        return vm.runInNewContext(code, this.currSandbox);
    } catch (e) {
        console.log(e);
        throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
};

// PUBLIC CLASS PROPERTIES AND METHODS

// Could store the cache object itself
JSONPath.cache = {};

/**
 * @param {string[]} pathArr Array to convert
 * @returns {string} The path string
 */
JSONPath.toPathString = function (pathArr) {
    const x = pathArr, n = x.length;
    let p = '$';
    for (let i = 1; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += (/^[0-9*]+$/).test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
        }
    }
    return p;
};

/**
 * @param {string} pointer JSON Path
 * @returns {string} JSON Pointer
 */
JSONPath.toPointer = function (pointer) {
    const x = pointer, n = x.length;
    let p = '';
    for (let i = 1; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += '/' + x[i].toString()
                .replace(/~/g, '~0')
                .replace(/\//g, '~1');
        }
    }
    return p;
};

/**
 * @param {string} expr Expression to convert
 * @returns {string[]}
 */
JSONPath.toPathArray = function (expr) {
    const {cache} = JSONPath;
    if (cache[expr]) { return cache[expr].concat(); }
    const subx = [];
    const normalized = expr
        // Properties
        .replace(
            /@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/g,
            ';$&;'
        )
        // Parenthetical evaluations (filtering and otherwise), directly
        //   within brackets or single quotes
        .replace(/[['](\??\(.*?\))[\]']/g, function ($0, $1) {
            return '[#' + (subx.push($1) - 1) + ']';
        })
        // Escape periods and tildes within properties
        .replace(/\['([^'\]]*)'\]/g, function ($0, prop) {
            return "['" + prop
                .replace(/\./g, '%@%')
                .replace(/~/g, '%%@@%%') +
                "']";
        })
        // Properties operator
        .replace(/~/g, ';~;')
        // Split by property boundaries
        .replace(/'?\.'?(?![^[]*\])|\['?/g, ';')
        // Reinsert periods within properties
        .replace(/%@%/g, '.')
        // Reinsert tildes within properties
        .replace(/%%@@%%/g, '~')
        // Parent
        .replace(/(?:;)?(\^+)(?:;)?/g, function ($0, ups) {
            return ';' + ups.split('').join(';') + ';';
        })
        // Descendents
        .replace(/;;;|;;/g, ';..;')
        // Remove trailing
        .replace(/;$|'?\]|'$/g, '');

    const exprList = normalized.split(';').map(function (expr) {
        const match = expr.match(/#([0-9]+)/);
        return !match || !match[1] ? expr : subx[match[1]];
    });
    cache[expr] = exprList;
    return cache[expr];
};

export {JSONPath};
