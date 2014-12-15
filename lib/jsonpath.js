/*global module, exports, require*/
/*jslint vars:true, evil:true*/
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

(function (require) {'use strict';

// Keep compatibility with old browsers
if (!Array.isArray) {
    Array.isArray = function (vArg) {
        return Object.prototype.toString.call(vArg) === '[object Array]';
    };
}

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = typeof module !== 'undefined' && !!module.exports;

var allowedResultTypes = ['value', 'path', 'parent', 'parentProperty', 'all'];

var vm = isNode ?
    require('vm') : {
        runInNewContext: function (expr, context) {
            return eval(Object.keys(context).reduce(function (s, vr) {
                return 'var ' + vr + '=' + JSON.stringify(context[vr]).replace(/\u2028|\u2029/g, function (m) {
                    // http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
                    return '\\u202' + (m === '\u2028' ? '8' : '9');
                }) + ';' + s;
            }, expr));
        }
    };

function push (arr, elem) {arr = arr.slice(); arr.push(elem); return arr;}
function unshift (elem, arr) {arr = arr.slice(); arr.unshift(elem); return arr;}

function JSONPath (opts, obj, expr, callback) {
    if (!(this instanceof JSONPath)) {
        try {
            return new JSONPath(opts, obj, expr, callback);
        }
        catch (e) {
            if (!e.avoidNew) {
                throw e;
            }
            return e.value;
        }
    }

    opts = opts || {};
    var objArgs = opts.hasOwnProperty('json') && opts.hasOwnProperty('path');
    this.resultType = (opts.resultType && opts.resultType.toLowerCase()) || 'value';
    this.flatten = opts.flatten || false;
    this.wrap = opts.hasOwnProperty('wrap') ? opts.wrap : true;
    this.sandbox = opts.sandbox || {};
    this.preventEval = opts.preventEval || false;

    if (opts.autostart !== false) {
        var ret = this.evaluate((objArgs ? opts.json : obj), (objArgs ? opts.path : expr), (objArgs ? opts.callback : callback));
        if (!ret || typeof ret !== 'object') {
            throw {avoidNew: true, value: ret, message: "JSONPath should not be called with 'new' (it prevents return of (unwrapped) scalar values)"};
        }
        return ret;
    }
}

// PUBLIC METHODS

JSONPath.prototype.evaluate = function (obj, expr, callback) {
    var self = this;
    this._obj = obj;
    if (!expr || !obj || allowedResultTypes.indexOf(this.resultType) === -1) {
        return;
    }
    var exprList = this._normalize(expr);
    if (exprList[0] === '$' && exprList.length > 1) {exprList.shift();}
    var result = this._trace(exprList, obj, ['$'], null, null, callback); // We could add arguments to let user pass parent and its property name in case it needed to access the parent
    result = result.filter(function (ea) { return ea && !ea.isParentSelector; });
    var resultType = this.resultType;
    if (!result.length) {return this.wrap ? [] : undefined;}
    if (result.length === 1 && !this.wrap && !Array.isArray(result[0].value)) {
        if (resultType === 'all') {
            return result[0];
        }
        return result[0][resultType];
    }
    return result.reduce(function (result, ea) {
        var valOrPath;
        switch (resultType) {
        case 'all':
            result.push(ea);
            return result;
        default:
            valOrPath = self._getPreferredOutput(ea);
            if (self.flatten && Array.isArray(valOrPath)) {
                result = result.concat(valOrPath);
            }
            else {
                result.push(valOrPath);
            }
            return result;
        }
    }, []);
};

// PRIVATE METHODS

JSONPath.prototype._normalize = function (expr) {
    var cache = JSONPath.cache;
    if (cache[expr]) {return cache[expr];}
    var subx = [];
    var normalized = expr
                    // Properties
                    .replace(/~/g, ';~;')
                    // Parenthetical evaluations (filtering and otherwise), directly within brackets or single quotes
                    .replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) {return '[#' + (subx.push($1) - 1) + ']';})
                    // Escape periods within properties
                    .replace(/\['([^'\]]*)'\]/g, function ($0, prop) {
                        return "['" + prop.replace(/\./g, '%@%') + "']";
                    })
                    // Split by property boundaries
                    .replace(/'?\.'?|\['?/g, ';')
                    // Reinsert periods within properties
                    .replace(/%@%/g, '.')
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

JSONPath.prototype._asPath = function (path) {
    var i, n, x = path, p = '$';
    for (i = 1, n = x.length; i < n; i++) {
        p += (x[i] === '~') ? x[i] : ((/^[0-9*]+$/).test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']"));
    }
    return p;
};

JSONPath.prototype._getPreferredOutput = function (ea) {
    var resultType = this.resultType;
    switch (resultType) {
    case 'value': case 'parent': case 'parentProperty':
        return ea[resultType];
    case 'path':
        return this._asPath(ea[resultType]);
    }
};

JSONPath.prototype._handleCallback = function (fullRetObj, callback, type) {
    if (callback) {
        var preferredOutput = fullRetObj;
        if (this.resultType !== 'all') {
            preferredOutput = this._getPreferredOutput(fullRetObj);
        }
        callback(preferredOutput, type, fullRetObj);
    }
};

JSONPath.prototype._trace = function (expr, val, path, parent, parentPropName, callback) {
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
    function addRet (elems) {ret = ret.concat(elems);}

    if (val && val.hasOwnProperty(loc)) { // simple case--directly follow property
        addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback));
    }
    else if (loc === '*') { // all child properties
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
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
    else if (loc[0] === '(') { // [(expr)] (dynamic property/index)
        if (this.preventEval) {
            throw "Eval [(expr)] prevented in JSONPath expression.";
        }
        // As this will resolve to a property name (but we don't know it yet), property and parent information is relative to the parent of the property to which this expression will resolve
        addRet(this._trace(unshift(this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback));
    }
    // The parent sel computation is handled in the frame above using the
    // ancestor object of val
    else if (loc === '^') {
        // This is not a final endpoint, so we do not invoke the callback here
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
    else if (loc.indexOf('?(') === 0) { // [?(expr)] (filtering)
        if (this.preventEval) {
            throw "Eval [?(expr)] prevented in JSONPath expression.";
        }
        this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, x, v, p, par, pr, cb) {
            if (self._eval(l.replace(/^\?\((.*?)\)$/, '$1'), v[m], m, p, par, pr)) {
                addRet(self._trace(unshift(m, x), v, p, par, pr, cb));
            }
        });
    }
    else if (loc.indexOf(',') > -1) { // [name1,name2,...]
        var parts, i;
        for (parts = loc.split(','), i = 0; i < parts.length; i++) {
            addRet(this._trace(unshift(parts[i], x), val, path, parent, parentPropName, callback));
        }
    }
    else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  Python slice syntax
        addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
    }

    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    return ret.reduce(function (all, ea) {
        return all.concat(ea.isParentSelector ? self._trace(ea.expr, val, ea.path, parent, parentPropName, callback) : ea);
    }, []);
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
            if (val.hasOwnProperty(m)) {
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
    end    = (end < 0)    ? Math.max(0, end + len) : Math.min(len, end);
    var ret = [];
    for (i = start; i < end; i += step) {
        ret = ret.concat(this._trace(unshift(i, expr), val, path, parent, parentPropName, callback));
    }
    return ret;
};

JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
    if (!this._obj || !_v) {return false;}
    if (code.indexOf('@parentProperty') > -1) {
        this.sandbox._$_parentProperty = parentPropName;
        code = code.replace(/@parentProperty/g, '_$_parentProperty');
    }
    if (code.indexOf('@parent') > -1) {
        this.sandbox._$_parent = parent;
        code = code.replace(/@parent/g, '_$_parent');
    }
    if (code.indexOf('@property') > -1) {
        this.sandbox._$_property = _vname;
        code = code.replace(/@property/g, '_$_property');
    }
    if (code.indexOf('@path') > -1) {
        this.sandbox._$_path = this._asPath(path.concat([_vname]));
        code = code.replace(/@path/g, '_$_path');
    }
    if (code.indexOf('@') > -1) {
        this.sandbox._$_v = _v;
        code = code.replace(/@/g, '_$_v');
    }
    try {
        return vm.runInNewContext(code, this.sandbox);
    }
    catch(e) {
        console.log(e);
        throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
};


// Could store the cache object itself
JSONPath.cache = {};

// For backward compatibility (deprecated)
JSONPath.eval = function (obj, expr, opts) {
    return JSONPath(opts, obj, expr);
};

if (typeof module === 'undefined') {
    window.jsonPath = { // Deprecated
        eval: JSONPath.eval
    };
    window.JSONPath = JSONPath;
}
else {
    module.exports = JSONPath;
}

}(typeof require === 'undefined' ? null : require));
