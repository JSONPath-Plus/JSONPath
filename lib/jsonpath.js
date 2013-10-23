/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

(function(exports, require) {

// Keep compatibility with old browsers
if (!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = false;
if (typeof module !== 'undefined' && module.exports) {
  isNode = true;
}

var vm = isNode ?
    require('vm') : {
        runInNewContext: function(expr, context) { with (context || {}) return eval(expr); }
    };
exports.eval = jsonPath;

var cache = {};

function push(arr, elem) { arr = arr.slice(); arr.push(elem); return arr; }
function unshift(elem, arr) { arr = arr.slice(); arr.unshift(elem); return arr; }

function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      flatten: arg && arg.flatten || false,
      wrap: (arg && arg.hasOwnProperty('wrap')) ? arg.wrap : true,
      sandbox: (arg && arg.sandbox) ? arg.sandbox : {},
      normalize: function(expr) {
         if (cache[expr]) return cache[expr];
         var subx = [];
         var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
                     .replace(/'?\.'?|\['?/g, ";")
                     .replace(/(;)?(\^+)(;)?/g, function(_, front, ups, back) { return ';' + ups.split('').join(';') + ';'; })
                     .replace(/;;;|;;/g, ";..;")
                     .replace(/;$|'?\]|'$/g, "")
                     .replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
         return cache[expr] = normalized.split(';');
      },
      asPath: function(path) {
         var x = path.split(";"), p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      store: function(p, v) {
         if (!p) return false;
         var toStore = P.resultType == "PATH" ? P.asPath(p) : v;
         if (Array.isArray(toStore) && P.flatten) {
             if (!P.result) P.result = [];
             if (!Array.isArray(P.result)) P.result = [P.result];
             P.result = P.result.concat(toStore);
         } else if (P.result) {
             if (!Array.isArray(P.result)) P.result = [P.result];
             P.result.push(toStore);
         } else {
             P.result = toStore;
         }
         return true;
      },
      trace: function(expr, val, path) {
         if (expr && expr.length) {
            var loc = expr[0], x = expr.slice(1);
            if (val && val.hasOwnProperty(loc)) // simple case, directly follow property
               P.trace(x, val[loc], push(path, loc));
            else if (loc === "*")
               P.walk(loc, x, val, path, function(m,l,x,v,p) { P.trace(unshift(m, x), v, p); });
            else if (loc === "..") {
               P.trace(x, val, path);
               P.walk(loc, x, val, path, function(m,l,x,v,p) { if (typeof v[m] === "object") P.trace(unshift("..", x), v[m], push(p, m)); });
            }
            else if (loc[0] === '(') // [(expr)]
               P.trace(unshift(P.eval(loc, val, path[path.length]),x), val, path);
            else if (loc.indexOf('?(') === 0) // [?(expr)]
               P.walk(loc, x, val, path, function(m,l,x,v,p) { if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m)) P.trace(unshift(m,x),v,p); });
            else if (loc.indexOf(',') > -1) { // [name1,name2,...]
               for (var parts = loc.split(','), i = 0; i < parts.length; i++)
                  P.trace(unshift(parts[i], x), val, path);
            }
            else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  python slice syntax
               P.slice(loc, x, val, path);
         }
         else
            P.store(path, val);
      },
      walk: function(loc, expr, val, path, f) {
         if (val instanceof Array) {
            for (var i=0,n=val.length; i<n; i++)
               f(i,loc,expr,val,path);
         }
         else if (typeof val === "object") {
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m,loc,expr,val,path);
         }
      },
      slice: function(loc, expr, val, path) {
         if (!(val instanceof Array)) return;
         var len = val.length, parts = loc.split(':'),
             start = (parts[0] && parseInt(parts[0])) || 0,
             end = (parts[1] && parseInt(parts[1])) || len,
             step = (parts[2] && parseInt(parts[2])) || 1;
         start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
         end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
         for (var i=start; i<end; i+=step) P.trace(unshift(i,expr), val, path);
      },
      eval: function(x, _v, _vname) {
         P.sandbox["_v"] = _v;
         try {
             return $ && _v && vm.runInNewContext(x.replace(/@/g, "_v"), P.sandbox);
         }
         catch(e) {
             console.log(e);
             throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a"));
         }
      }
   };
   P.result = P.wrap === true ? [] : undefined;

   var $ = obj;
   if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
      var exprList = P.normalize(expr);
      if (exprList[0] === "$" && exprList.length > 1) exprList.shift();
      P.trace(exprList, obj, ["$"]);
      if(!Array.isArray(P.result) && P.wrap) P.result = [P.result];
      return P.result ? P.result : false;
   }
}
})(typeof exports === 'undefined' ? this['jsonPath'] = {} : exports, typeof require == "undefined" ? null : require);
