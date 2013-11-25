/* jshint -W116 */
var nativeIsArray = Array.isArray;

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
exports.isArray = nativeIsArray || function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};
/* jshint +W116 */
