/* exported require */
/*global nodeunit, JSONPath, ActiveXObject */
// helper to get all the test cases
'use strict';
var suites = [], _testCase = nodeunit.testCase;
nodeunit.testCase = function (tc) {
    suites.push(tc);
    return _testCase(tc);
};
// stubs to load nodejs tests
function require (path) { // eslint-disable-line no-unused-vars
    if (path === 'nodeunit') {return nodeunit;}
    if (path.match(/^\.\.\/?$/)) {return JSONPath;}
}
var module = {exports: {}}; // eslint-disable-line no-unused-vars

// synchronous load function for JS code, uses XMLHttpRequest abstraction from
// http://www.quirksmode.org/js/xmlhttp.html
// Since the tests are written in node.js style we need to wrap their code into
// a function, otherwise they would pollute the global NS and interfere with each
// other
function get (url, callback) {
    function createXMLHTTPObject () {
        var i, XMLHttpFactories = [
          function () {return new XMLHttpRequest();},
          function () {return new ActiveXObject('Msxml2.XMLHTTP');},
          function () {return new ActiveXObject('Msxml3.XMLHTTP');},
          function () {return new ActiveXObject('Microsoft.XMLHTTP');}];
      for (i = 0; i < XMLHttpFactories.length; i++) {
        try {return XMLHttpFactories[i]();}
            catch (ignore) {}
        }
      return false;
    }
    function sendRequest (url, callback) {
      var req = createXMLHTTPObject();
      req.open('GET', url, false /* sync */);
      req.onreadystatechange = function () {if (req.readyState === 4) {callback(req);}};
      if (req.readyState !== 4) {req.send();}
    }
    sendRequest(url, callback);
}
function loadJS (url) {get(url, function (req) {new Function(req.responseText)();});} // eslint-disable-line no-unused-vars, no-new-func
