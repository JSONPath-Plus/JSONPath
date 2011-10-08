/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var Environment = require('./environment');

var JSONPath = module.exports = {
  eval: function jsonPath(jsonObject, expression, options) {
    if(!jsonObject)
      throw 'You must provide a JSON object';
    if(!expression)
      throw 'An expression is required';
    if(!options)
      options = {};
    if(!options.resultType)
      options.resultType = 'VALUE';
    if(options.resultType != "VALUE" && options.resultType != "PATH")
      throw 'Invalid options, resultType must be "VALUE" or "PATH"';

    var env = new Environment(jsonObject, expression, options);
    return env.execute();
  }
};
