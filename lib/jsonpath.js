/*global exports, require*/
/* eslint-disable no-eval */
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var module;
(function (glbl, require) {'use strict';

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example). Will also check if we are
// in react-native
var isNode = module && !!module.exports && !(typeof navigator !== 'undefined' && navigator.product === 'ReactNative');

var allowedResultTypes = ['value', 'path', 'pointer', 'parent', 'parentProperty', 'all'];

if (!Array.prototype.includes) {
    Array.prototype.includes = function (item) { // eslint-disable-line no-extend-native
        return this.indexOf(item) > -1;
    };
}
if (!String.prototype.includes) {
    String.prototype.includes = function (item) { // eslint-disable-line no-extend-native
        return this.indexOf(item) > -1;
    };
}

var moveToAnotherArray = function (source, target, conditionCb) {
  for (var i = 0, kl = source.length; i < kl; i++) {
      var key = source[i];
      if (conditionCb(key)) {
          target.push(source.splice(i--, 1)[0]);
      }
  }
};

var vm = isNode
    ? require('vm') : {
        runInNewContext: function (expr, context) {
            var keys = Object.keys(context);
            var funcs = [];
            moveToAnotherArray(keys, funcs, function (key) {
                return typeof context[key] === 'function';
            });
            var code = funcs.reduce(function (s, func) {
                return 'var ' + func + '=' + context[func].toString() + ';' + s;
            }, '');
            code += keys.reduce(function (s, vr) {
                return 'var ' + vr + '=' + JSON.stringify(context[vr]).replace(/\u2028|\u2029/g, function (m) {
                    // http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
                    return '\\u202' + (m === '\u2028' ? '8' : '9');
                }) + ';' + s;
            }, expr);
            return eval(code);
        }
    };

function push (arr, elem) {arr = arr.slice(); arr.push(elem); return arr;}
function unshift (elem, arr) {arr = arr.slice(); arr.unshift(elem); return arr;}
function NewError (value) {
  this.avoidNew = true;
  this.value = value;
  this.message = 'JSONPath should not be called with "new" (it prevents return of (unwrapped) scalar values)';
}

function JSONPath (opts, expr, obj, callback, otherTypeCallback) {
    if (!(this instanceof JSONPath)) {
        try {
            return new JSONPath(opts, expr, obj, callback, otherTypeCallback);
        }
        catch (e) {
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
    var objArgs = opts.hasOwnProperty('json') && opts.hasOwnProperty('path');
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
        var ret = this.evaluate({
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
    var self = this,
        flatten = this.flatten,
        wrap = this.wrap,
        currParent = this.parent,
        currParentProperty = this.parentProperty;

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

    var exprList = JSONPath.toPathArray(expr);
    if (exprList[0] === '$' && exprList.length > 1) {exprList.shift();}
    this._hasParentSelector = null;
    var result = this._trace(exprList, json, ['$'], currParent, currParentProperty, callback);
    result = result.filter(function (ea) {return ea && !ea.isParentSelector;});

    if (!result.length) {return wrap ? [] : undefined;}
    if (result.length === 1 && !wrap && !Array.isArray(result[0].value)) {
        return this._getPreferredOutput(result[0]);
    }
    return result.reduce(function (result, ea) {
        var valOrPath = self._getPreferredOutput(ea);
        if (flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
        }
        else {
            result.push(valOrPath);
        }
        return result;
    }, []);
};

// PRIVATE METHODS

JSONPath.prototype._getPreferredOutput = function (ea) {
    var resultType = this.currResultType;
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
        var preferredOutput = this._getPreferredOutput(fullRetObj);
        fullRetObj.path = typeof fullRetObj.path === 'string' ? fullRetObj.path : JSONPath.toPathString(fullRetObj.path);
        callback(preferredOutput, type, fullRetObj);
    }
};

JSONPath.prototype._trace = function (expr, val, path, parent, parentPropName, callback, literalPriority) {
    // No expr to follow? return path and value as the result of this trace branch
    var retObj, self = this;
    if (!expr.length) {
        retObj = {path: path, value: val, parent: parent, parentProperty: parentPropName};
        this._handleCallback(retObj, callback, 'value');
        return retObj;
    }

    var loc = expr[0], x = expr.slice(1);

    // We need to gather the return value of recursive trace calls in order to
    // do the parent sel computation.
    var ret = [];
    function retPush (elem) {
        ret.push(elem);
    }
    function addRet (elems) {
        if (Array.isArray(elems)) {
            elems.forEach(retPush);
        } else {
            ret.push(elems);
        }
    }

    if ((typeof loc !== 'string' || literalPriority) && val && Object.prototype.hasOwnProperty.call(val, loc)) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback));
    }
    else if (loc === '*') { // all child properties
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            addRet(self._trace(unshift(m, x), v, p, par, pr, cb, true));
        });
    }
    else if (loc === '..') { // all descendent parent properties
        addRet(this._trace(x, val, path, parent, parentPropName, callback)); // Check remaining expression with val's immediate children
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            // We don't join m and x here because we only want parents, not scalar values
            if (typeof v[m] === 'object') { // Keep going with recursive descent on val's object children
                addRet(self._trace(unshift(l, x), v[m], push(p, m), v, m, cb));
            }
        });
    }
    // The parent sel computation is handled in the frame above using the
    // ancestor object of val
    else if (loc === '^') {
        // This is not a final endpoint, so we do not invoke the callback here
        this._hasParentSelector = true;
        return path.length ? {
            path: path.slice(0, -1),
            expr: x,
            isParentSelector: true
        } : [];
    }
    else if (loc === '~') { // property name
        retObj = {path: push(path, loc), value: parentPropName, parent: parent, parentProperty: null};
        this._handleCallback(retObj, callback, 'property');
        return retObj;
    }
    else if (loc === '$') { // root only
        addRet(this._trace(x, val, path, null, null, callback));
    }
    else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  Python slice syntax
        addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
    }
    else if (loc.indexOf('?(') === 0) { // [?(expr)] (filtering)
        if (this.currPreventEval) {
            throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
        }
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            if (self._eval(l.replace(/^\?\((.*?)\)$/, '$1'), v[m], m, p, par, pr)) {
                addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
            }
        });
    }
    else if (loc[0] === '(') { // [(expr)] (dynamic property/index)
        if (this.currPreventEval) {
            throw new Error('Eval [(expr)] prevented in JSONPath expression.');
        }
        // As this will resolve to a property name (but we don't know it yet), property and parent information is relative to the parent of the property to which this expression will resolve
        addRet(this._trace(unshift(this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback));
    }
    else if (loc[0] === '@') { // value type: @boolean(), etc.
        var addType = false;
        var valueType = loc.slice(1, -2);
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
        case 'number':
            if (typeof val === valueType && isFinite(val)) {
                addType = true;
            }
            break;
        case 'nonFinite':
            if (typeof val === 'number' && !isFinite(val)) {
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
            retObj = {path: path, value: val, parent: parent, parentProperty: parentPropName};
            this._handleCallback(retObj, callback, 'value');
            return retObj;
        }
    }
    else if (loc[0] === '`' && val && Object.prototype.hasOwnProperty.call(val, loc.slice(1))) { // `-escaped property
        var locProp = loc.slice(1);
        addRet(this._trace(x, val[locProp], push(path, locProp), val, locProp, callback, true));
    }
    else if (loc.includes(',')) { // [name1,name2,...]
        var parts, i;
        for (parts = loc.split(','), i = 0; i < parts.length; i++) {
            addRet(this._trace(unshift(parts[i], x), val, path, parent, parentPropName, callback));
        }
    }
    else if (!literalPriority && val && Object.prototype.hasOwnProperty.call(val, loc)) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, true));
    }

    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    if (this._hasParentSelector) {
        for (var t = 0; t < ret.length; t++) {
            var rett = ret[t];
            if (rett.isParentSelector) {
                var tmp = self._trace(rett.expr, val, rett.path, parent, parentPropName, callback);
                if (Array.isArray(tmp)) {
                    ret[t] = tmp[0];
                    for (var tt = 1, tl = tmp.length; tt < tl; tt++) {
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
    var i, n, m;
    if (Array.isArray(val)) {
        for (i = 0, n = val.length; i < n; i++) {
            f(i, loc, expr, val, path, parent, parentPropName, callback);
        }
    }
    else if (typeof val === 'object') {
        for (m in val) {
            if (Object.prototype.hasOwnProperty.call(val, m)) {
                f(m, loc, expr, val, path, parent, parentPropName, callback);
            }
        }
    }
};

JSONPath.prototype._slice = function (loc, expr, val, path, parent, parentPropName, callback) {
    if (!Array.isArray(val)) {return;}
    var i,
        len = val.length, parts = loc.split(':'),
        start = (parts[0] && parseInt(parts[0], 10)) || 0,
        end = (parts[1] && parseInt(parts[1], 10)) || len,
        step = (parts[2] && parseInt(parts[2], 10)) || 1;
    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
    var ret = [];
    for (i = start; i < end; i += step) {
        var tmp = this._trace(unshift(i, expr), val, path, parent, parentPropName, callback);
        if (Array.isArray(tmp)) {
            tmp.forEach(function (t) {
                ret.push(t);
            });
        }
        else {
            ret.push(tmp);
        }
    }
    return ret;
};

JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
    if (!this._obj || !_v) {return false;}
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
    if (code.match(/@([\.\s\)\[])/)) {
        this.currSandbox._$_v = _v;
        code = code.replace(/@([\.\s\)\[])/g, '_$_v$1');
    }
    try {
        return vm.runInNewContext(code, this.currSandbox);
    }
    catch (e) {
        console.log(e);
        throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
};

// PUBLIC CLASS PROPERTIES AND METHODS

// Could store the cache object itself
JSONPath.cache = {};

JSONPath.toPathString = function (pathArr) {
    var i, n, x = pathArr, p = '$';
    for (i = 1, n = x.length; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += (/^[0-9*]+$/).test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
        }
    }
    return p;
};

JSONPath.toPointer = function (pointer) {
    var i, n, x = pointer, p = '';
    for (i = 1, n = x.length; i < n; i++) {
        if (!(/^(~|\^|@.*?\(\))$/).test(x[i])) {
            p += '/' + x[i].toString()
                  .replace(/\~/g, '~0')
                  .replace(/\//g, '~1');
        }
    }
    return p;
};

JSONPath.toPathArray = function (expr) {
    var cache = JSONPath.cache;
    if (cache[expr]) {return cache[expr].concat();}
    var subx = [];
    var normalized = expr
                    // Properties
                    .replace(/@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/g, ';$&;')
                    // Parenthetical evaluations (filtering and otherwise), directly within brackets or single quotes
                    .replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) {return '[#' + (subx.push($1) - 1) + ']';})
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
                    .replace(/'?\.'?(?![^\[]*\])|\['?/g, ';')
                    // Reinsert periods within properties
                    .replace(/%@%/g, '.')
                    // Reinsert tildes within properties
                    .replace(/%%@@%%/g, '~')
                    // Parent
                    .replace(/(?:;)?(\^+)(?:;)?/g, function ($0, ups) {return ';' + ups.split('').join(';') + ';';})
                    // Descendents
                    .replace(/;;;|;;/g, ';..;')
                    // Remove trailing
                    .replace(/;$|'?\]|'$/g, '');

    var exprList = normalized.split(';').map(function (expr) {
        var match = expr.match(/#([0-9]+)/);
        return !match || !match[1] ? expr : subx[match[1]];
    });
    cache[expr] = exprList;
    return cache[expr];
};

// For backward compatibility (deprecated)
JSONPath.eval = function (obj, expr, opts) {
    return JSONPath(opts, expr, obj);
};

if (typeof define === 'function' && define.amd) {
    define(function () {return JSONPath;});
}
else if (isNode) {
    module.exports = JSONPath;
}
else {
    glbl.jsonPath = { // Deprecated
        eval: JSONPath.eval
    };
    glbl.JSONPath = JSONPath;
}
}(this || self, typeof require === 'undefined' ? null : require));
