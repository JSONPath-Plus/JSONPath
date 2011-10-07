var cache = {};

var Environment = module.exports = function(jsonObject, expression, options) {
  this.jsonObject = jsonObject;
  this.expression = this.normalize(expression);
  this.options = options;
  this.result = [];
};

Environment.prototype.execute = function() {
  this.trace(this.expression, this.jsonObject, "$");
  return this.result.length ? this.result : false;
};

Environment.prototype.normalize = function(expression) {
   if(cache[expression]) {
      return cache[expression];
   }

   var subx = [];
   ret = expression.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
              .replace(/'?\.'?|\['?/g, ";")
              .replace(/;;;|;;/g, ";..;")
              .replace(/;$|'?\]|'$/g, "")
              .replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
   cache[expression] = ret;
   return ret.replace(/^\$;/,"");
};
 
Environment.prototype.asPath = function(path) {
   var x = path.split(";"), p = "$";
   for (var i=1,n=x.length; i<n; i++)
      p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
   return p;
};

Environment.prototype.store = function(path, value) {
  if (path) {
    var storageValue = this.options.resultType == "PATH" ? this.asPath(path) : value;
    this.result.push(storageValue);
  }
};

Environment.prototype.trace = function(expression, object, path) {
   var self = this;
   if (expression) {
      var segments = expression.split(";")
      var segment = segments.shift();
      var newExpression = segments.join(";");
      if (object && object.hasOwnProperty(segment))
         this.trace(newExpression, object[segment], path + ";" + segment);
      else if (segment === "*") {
        this.walk(object, function(property) {
          self.trace(property + ";" + newExpression, object, path);
        });
      }
      else if (segment === "..") {
         this.trace(newExpression, object, path);
         this.walk(object, function(property) {
           typeof object[property] === "object" &&
             self.trace("..;" + newExpression, object[property], path + ";" + property);
         });
      }
      else if (/,/.test(segment)) { // [name1,name2,...]
        var s = segment.split(/'?,'?/);
         for (var i=0,n=s.length; i<n; i++)
            this.trace(s[i]+";"+newExpression, object, path);
      }
      else if (/^\(.*?\)$/.test(segment)) { // [(newExpression)]
        var name = path.substr(path.lastIndexOf(";")+1);
        var extendedExpression = this.match(segment, object, name) + ";" + newExpression;
        this.trace(extendedExpression, object, path);
      }
      else if (/^\?\(.*?\)$/.test(segment)) { // [?(newExpression)]
         this.walk(object, function(property) {
           if (self.match(segment.replace(/^\?\((.*?)\)$/,"$1"), object[property], property))
             self.trace(property + ";" + newExpression, object, path);
         });
      }
      else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(segment)) // [start:end:step]  phyton slice syntax
         this.slice(segment, newExpression, object, path);
   } else {
      this.store(path, object);
   }
};
 
Environment.prototype.walk = function(object, callback) {
   if (object instanceof Array) {
     for (var index = 0, n = object.length; index < n; index++)
       callback(index);
   }
   else if (typeof object === "object") {
      for (var property in object)
         if (object.hasOwnProperty(property))
            callback(property);
   }
};

Environment.prototype.slice = function(segment, expression, object, path) {
   if (object instanceof Array) {
      var len=object.length, start=0, end=len, step=1;
      segment.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0,$1,$2,$3) {
        start=parseInt($1||start);
        end=parseInt($2||end);
        step=parseInt($3||step);
      });
      start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
      end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
      for (var i=start; i<end; i+=step)
         this.trace(i+";"+expression, object, path);
   }
};

Environment.prototype.match = function(segment, _v, _vname) {
   try {
     var $ = this.jsonObject;
     return _v && eval(segment.replace(/@/g, "_v"));
   }
   catch(e) {
     throw new SyntaxError("jsonPath: " + e.message + ": " + segment.replace(/@/g, "_v").replace(/\^/g, "_a"));
   }
};
