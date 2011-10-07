var Expression = module.exports = {
  execute: function(expression, object) {
    if(/[>=<]/.test(expression))
      return this.operate(object, expression, '>=<');
    else if(/[-+*\/]/.test(expression))
      return this.operate(object, expression, '-+*/');
    else if(/\./.test(expression))
      return this.getProperty(expression, object);
    else
      throw new SyntaxError("jsonPath: invalid query syntax: " + expression);
  },

  getProperty: function(expression, object) {
    var parts = expression.match(/\.([^\s]+)/);
    var rhs;
    try {
      rhs = JSON.parse('"' + parts[1] + '"');
    }
    catch(e) {
      throw new SyntaxError("jsonPath: invalid property name: " + parts[1]);
    }
    return object[rhs];
  },

  getValue: function(expression) {
    try {
      return JSON.parse(expression);
    }
    catch(e) {
      throw new SyntaxError("jsonPath: invalid right-hand-side value: " + expression);
    }
  },

  operate: function(object, expression, operators) {
    var regex = new RegExp("([^\(\)" + operators + "]+)([" + operators + "]+)([^\(\)]+)");
    var parts = expression.match(regex);
    var lhs = this.getProperty(parts[1], object);
    var rhs = this.getValue(parts[3]);

    switch(parts[2]) {
    case '==':
      return lhs == rhs;
    case '>=':
      return lhs >= rhs;
    case '<=':
      return lhs <= rhs;
    case '>':
      return lhs > rhs;
    case '<':
      return lhs < rhs;
    case '-':
      return lhs - rhs;
    case '+':
      return lhs + rhs;
    case '*':
      return lhs * rhs;
    case '/':
      return lhs / rhs;
    default:
      throw new SyntaxError("jsonPath: invalid query syntax: " + expression);
    }
  },
};
