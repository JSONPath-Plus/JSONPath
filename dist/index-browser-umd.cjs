(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JSONPath = {}));
})(this, (function (exports) { 'use strict';

	/**
	 * @implements {IHooks}
	 */
	class Hooks {
	  /**
	   * @callback HookCallback
	   * @this {*|Jsep} this
	   * @param {Jsep} env
	   * @returns: void
	   */
	  /**
	   * Adds the given callback to the list of callbacks for the given hook.
	   *
	   * The callback will be invoked when the hook it is registered for is run.
	   *
	   * One callback function can be registered to multiple hooks and the same hook multiple times.
	   *
	   * @param {string|object} name The name of the hook, or an object of callbacks keyed by name
	   * @param {HookCallback|boolean} callback The callback function which is given environment variables.
	   * @param {?boolean} [first=false] Will add the hook to the top of the list (defaults to the bottom)
	   * @public
	   */
	  add(name, callback, first) {
	    if (typeof arguments[0] != 'string') {
	      // Multiple hook callbacks, keyed by name
	      for (let name in arguments[0]) {
	        this.add(name, arguments[0][name], arguments[1]);
	      }
	    } else {
	      (Array.isArray(name) ? name : [name]).forEach(function (name) {
	        this[name] = this[name] || [];
	        if (callback) {
	          this[name][first ? 'unshift' : 'push'](callback);
	        }
	      }, this);
	    }
	  }

	  /**
	   * Runs a hook invoking all registered callbacks with the given environment variables.
	   *
	   * Callbacks will be invoked synchronously and in the order in which they were registered.
	   *
	   * @param {string} name The name of the hook.
	   * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
	   * @public
	   */
	  run(name, env) {
	    this[name] = this[name] || [];
	    this[name].forEach(function (callback) {
	      callback.call(env && env.context ? env.context : env, env);
	    });
	  }
	}

	/**
	 * @implements {IPlugins}
	 */
	class Plugins {
	  constructor(jsep) {
	    this.jsep = jsep;
	    this.registered = {};
	  }

	  /**
	   * @callback PluginSetup
	   * @this {Jsep} jsep
	   * @returns: void
	   */
	  /**
	   * Adds the given plugin(s) to the registry
	   *
	   * @param {object} plugins
	   * @param {string} plugins.name The name of the plugin
	   * @param {PluginSetup} plugins.init The init function
	   * @public
	   */
	  register(...plugins) {
	    plugins.forEach(plugin => {
	      if (typeof plugin !== 'object' || !plugin.name || !plugin.init) {
	        throw new Error('Invalid JSEP plugin format');
	      }
	      if (this.registered[plugin.name]) {
	        // already registered. Ignore.
	        return;
	      }
	      plugin.init(this.jsep);
	      this.registered[plugin.name] = plugin;
	    });
	  }
	}

	//     JavaScript Expression Parser (JSEP) 1.4.0

	class Jsep {
	  /**
	   * @returns {string}
	   */
	  static get version() {
	    // To be filled in by the template
	    return '1.4.0';
	  }

	  /**
	   * @returns {string}
	   */
	  static toString() {
	    return 'JavaScript Expression Parser (JSEP) v' + Jsep.version;
	  }
	  // ==================== CONFIG ================================
	  /**
	   * @method addUnaryOp
	   * @param {string} op_name The name of the unary op to add
	   * @returns {Jsep}
	   */
	  static addUnaryOp(op_name) {
	    Jsep.max_unop_len = Math.max(op_name.length, Jsep.max_unop_len);
	    Jsep.unary_ops[op_name] = 1;
	    return Jsep;
	  }

	  /**
	   * @method jsep.addBinaryOp
	   * @param {string} op_name The name of the binary op to add
	   * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
	   * @param {boolean} [isRightAssociative=false] whether operator is right-associative
	   * @returns {Jsep}
	   */
	  static addBinaryOp(op_name, precedence, isRightAssociative) {
	    Jsep.max_binop_len = Math.max(op_name.length, Jsep.max_binop_len);
	    Jsep.binary_ops[op_name] = precedence;
	    if (isRightAssociative) {
	      Jsep.right_associative.add(op_name);
	    } else {
	      Jsep.right_associative.delete(op_name);
	    }
	    return Jsep;
	  }

	  /**
	   * @method addIdentifierChar
	   * @param {string} char The additional character to treat as a valid part of an identifier
	   * @returns {Jsep}
	   */
	  static addIdentifierChar(char) {
	    Jsep.additional_identifier_chars.add(char);
	    return Jsep;
	  }

	  /**
	   * @method addLiteral
	   * @param {string} literal_name The name of the literal to add
	   * @param {*} literal_value The value of the literal
	   * @returns {Jsep}
	   */
	  static addLiteral(literal_name, literal_value) {
	    Jsep.literals[literal_name] = literal_value;
	    return Jsep;
	  }

	  /**
	   * @method removeUnaryOp
	   * @param {string} op_name The name of the unary op to remove
	   * @returns {Jsep}
	   */
	  static removeUnaryOp(op_name) {
	    delete Jsep.unary_ops[op_name];
	    if (op_name.length === Jsep.max_unop_len) {
	      Jsep.max_unop_len = Jsep.getMaxKeyLen(Jsep.unary_ops);
	    }
	    return Jsep;
	  }

	  /**
	   * @method removeAllUnaryOps
	   * @returns {Jsep}
	   */
	  static removeAllUnaryOps() {
	    Jsep.unary_ops = {};
	    Jsep.max_unop_len = 0;
	    return Jsep;
	  }

	  /**
	   * @method removeIdentifierChar
	   * @param {string} char The additional character to stop treating as a valid part of an identifier
	   * @returns {Jsep}
	   */
	  static removeIdentifierChar(char) {
	    Jsep.additional_identifier_chars.delete(char);
	    return Jsep;
	  }

	  /**
	   * @method removeBinaryOp
	   * @param {string} op_name The name of the binary op to remove
	   * @returns {Jsep}
	   */
	  static removeBinaryOp(op_name) {
	    delete Jsep.binary_ops[op_name];
	    if (op_name.length === Jsep.max_binop_len) {
	      Jsep.max_binop_len = Jsep.getMaxKeyLen(Jsep.binary_ops);
	    }
	    Jsep.right_associative.delete(op_name);
	    return Jsep;
	  }

	  /**
	   * @method removeAllBinaryOps
	   * @returns {Jsep}
	   */
	  static removeAllBinaryOps() {
	    Jsep.binary_ops = {};
	    Jsep.max_binop_len = 0;
	    return Jsep;
	  }

	  /**
	   * @method removeLiteral
	   * @param {string} literal_name The name of the literal to remove
	   * @returns {Jsep}
	   */
	  static removeLiteral(literal_name) {
	    delete Jsep.literals[literal_name];
	    return Jsep;
	  }

	  /**
	   * @method removeAllLiterals
	   * @returns {Jsep}
	   */
	  static removeAllLiterals() {
	    Jsep.literals = {};
	    return Jsep;
	  }
	  // ==================== END CONFIG ============================

	  /**
	   * @returns {string}
	   */
	  get char() {
	    return this.expr.charAt(this.index);
	  }

	  /**
	   * @returns {number}
	   */
	  get code() {
	    return this.expr.charCodeAt(this.index);
	  }
	  /**
	   * @param {string} expr a string with the passed in express
	   * @returns Jsep
	   */
	  constructor(expr) {
	    // `index` stores the character number we are currently at
	    // All of the gobbles below will modify `index` as we move along
	    this.expr = expr;
	    this.index = 0;
	  }

	  /**
	   * static top-level parser
	   * @returns {jsep.Expression}
	   */
	  static parse(expr) {
	    return new Jsep(expr).parse();
	  }

	  /**
	   * Get the longest key length of any object
	   * @param {object} obj
	   * @returns {number}
	   */
	  static getMaxKeyLen(obj) {
	    return Math.max(0, ...Object.keys(obj).map(k => k.length));
	  }

	  /**
	   * `ch` is a character code in the next three functions
	   * @param {number} ch
	   * @returns {boolean}
	   */
	  static isDecimalDigit(ch) {
	    return ch >= 48 && ch <= 57; // 0...9
	  }

	  /**
	   * Returns the precedence of a binary operator or `0` if it isn't a binary operator. Can be float.
	   * @param {string} op_val
	   * @returns {number}
	   */
	  static binaryPrecedence(op_val) {
	    return Jsep.binary_ops[op_val] || 0;
	  }

	  /**
	   * Looks for start of identifier
	   * @param {number} ch
	   * @returns {boolean}
	   */
	  static isIdentifierStart(ch) {
	    return ch >= 65 && ch <= 90 ||
	    // A...Z
	    ch >= 97 && ch <= 122 ||
	    // a...z
	    ch >= 128 && !Jsep.binary_ops[String.fromCharCode(ch)] ||
	    // any non-ASCII that is not an operator
	    Jsep.additional_identifier_chars.has(String.fromCharCode(ch)); // additional characters
	  }

	  /**
	   * @param {number} ch
	   * @returns {boolean}
	   */
	  static isIdentifierPart(ch) {
	    return Jsep.isIdentifierStart(ch) || Jsep.isDecimalDigit(ch);
	  }

	  /**
	   * throw error at index of the expression
	   * @param {string} message
	   * @throws
	   */
	  throwError(message) {
	    const error = new Error(message + ' at character ' + this.index);
	    error.index = this.index;
	    error.description = message;
	    throw error;
	  }

	  /**
	   * Run a given hook
	   * @param {string} name
	   * @param {jsep.Expression|false} [node]
	   * @returns {?jsep.Expression}
	   */
	  runHook(name, node) {
	    if (Jsep.hooks[name]) {
	      const env = {
	        context: this,
	        node
	      };
	      Jsep.hooks.run(name, env);
	      return env.node;
	    }
	    return node;
	  }

	  /**
	   * Runs a given hook until one returns a node
	   * @param {string} name
	   * @returns {?jsep.Expression}
	   */
	  searchHook(name) {
	    if (Jsep.hooks[name]) {
	      const env = {
	        context: this
	      };
	      Jsep.hooks[name].find(function (callback) {
	        callback.call(env.context, env);
	        return env.node;
	      });
	      return env.node;
	    }
	  }

	  /**
	   * Push `index` up to the next non-space character
	   */
	  gobbleSpaces() {
	    let ch = this.code;
	    // Whitespace
	    while (ch === Jsep.SPACE_CODE || ch === Jsep.TAB_CODE || ch === Jsep.LF_CODE || ch === Jsep.CR_CODE) {
	      ch = this.expr.charCodeAt(++this.index);
	    }
	    this.runHook('gobble-spaces');
	  }

	  /**
	   * Top-level method to parse all expressions and returns compound or single node
	   * @returns {jsep.Expression}
	   */
	  parse() {
	    this.runHook('before-all');
	    const nodes = this.gobbleExpressions();

	    // If there's only one expression just try returning the expression
	    const node = nodes.length === 1 ? nodes[0] : {
	      type: Jsep.COMPOUND,
	      body: nodes
	    };
	    return this.runHook('after-all', node);
	  }

	  /**
	   * top-level parser (but can be reused within as well)
	   * @param {number} [untilICode]
	   * @returns {jsep.Expression[]}
	   */
	  gobbleExpressions(untilICode) {
	    let nodes = [],
	      ch_i,
	      node;
	    while (this.index < this.expr.length) {
	      ch_i = this.code;

	      // Expressions can be separated by semicolons, commas, or just inferred without any
	      // separators
	      if (ch_i === Jsep.SEMCOL_CODE || ch_i === Jsep.COMMA_CODE) {
	        this.index++; // ignore separators
	      } else {
	        // Try to gobble each expression individually
	        if (node = this.gobbleExpression()) {
	          nodes.push(node);
	          // If we weren't able to find a binary expression and are out of room, then
	          // the expression passed in probably has too much
	        } else if (this.index < this.expr.length) {
	          if (ch_i === untilICode) {
	            break;
	          }
	          this.throwError('Unexpected "' + this.char + '"');
	        }
	      }
	    }
	    return nodes;
	  }

	  /**
	   * The main parsing function.
	   * @returns {?jsep.Expression}
	   */
	  gobbleExpression() {
	    const node = this.searchHook('gobble-expression') || this.gobbleBinaryExpression();
	    this.gobbleSpaces();
	    return this.runHook('after-expression', node);
	  }

	  /**
	   * Search for the operation portion of the string (e.g. `+`, `===`)
	   * Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
	   * and move down from 3 to 2 to 1 character until a matching binary operation is found
	   * then, return that binary operation
	   * @returns {string|boolean}
	   */
	  gobbleBinaryOp() {
	    this.gobbleSpaces();
	    let to_check = this.expr.substr(this.index, Jsep.max_binop_len);
	    let tc_len = to_check.length;
	    while (tc_len > 0) {
	      // Don't accept a binary op when it is an identifier.
	      // Binary ops that start with a identifier-valid character must be followed
	      // by a non identifier-part valid character
	      if (Jsep.binary_ops.hasOwnProperty(to_check) && (!Jsep.isIdentifierStart(this.code) || this.index + to_check.length < this.expr.length && !Jsep.isIdentifierPart(this.expr.charCodeAt(this.index + to_check.length)))) {
	        this.index += tc_len;
	        return to_check;
	      }
	      to_check = to_check.substr(0, --tc_len);
	    }
	    return false;
	  }

	  /**
	   * This function is responsible for gobbling an individual expression,
	   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
	   * @returns {?jsep.BinaryExpression}
	   */
	  gobbleBinaryExpression() {
	    let node, biop, prec, stack, biop_info, left, right, i, cur_biop;

	    // First, try to get the leftmost thing
	    // Then, check to see if there's a binary operator operating on that leftmost thing
	    // Don't gobbleBinaryOp without a left-hand-side
	    left = this.gobbleToken();
	    if (!left) {
	      return left;
	    }
	    biop = this.gobbleBinaryOp();

	    // If there wasn't a binary operator, just return the leftmost node
	    if (!biop) {
	      return left;
	    }

	    // Otherwise, we need to start a stack to properly place the binary operations in their
	    // precedence structure
	    biop_info = {
	      value: biop,
	      prec: Jsep.binaryPrecedence(biop),
	      right_a: Jsep.right_associative.has(biop)
	    };
	    right = this.gobbleToken();
	    if (!right) {
	      this.throwError("Expected expression after " + biop);
	    }
	    stack = [left, biop_info, right];

	    // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
	    while (biop = this.gobbleBinaryOp()) {
	      prec = Jsep.binaryPrecedence(biop);
	      if (prec === 0) {
	        this.index -= biop.length;
	        break;
	      }
	      biop_info = {
	        value: biop,
	        prec,
	        right_a: Jsep.right_associative.has(biop)
	      };
	      cur_biop = biop;

	      // Reduce: make a binary expression from the three topmost entries.
	      const comparePrev = prev => biop_info.right_a && prev.right_a ? prec > prev.prec : prec <= prev.prec;
	      while (stack.length > 2 && comparePrev(stack[stack.length - 2])) {
	        right = stack.pop();
	        biop = stack.pop().value;
	        left = stack.pop();
	        node = {
	          type: Jsep.BINARY_EXP,
	          operator: biop,
	          left,
	          right
	        };
	        stack.push(node);
	      }
	      node = this.gobbleToken();
	      if (!node) {
	        this.throwError("Expected expression after " + cur_biop);
	      }
	      stack.push(biop_info, node);
	    }
	    i = stack.length - 1;
	    node = stack[i];
	    while (i > 1) {
	      node = {
	        type: Jsep.BINARY_EXP,
	        operator: stack[i - 1].value,
	        left: stack[i - 2],
	        right: node
	      };
	      i -= 2;
	    }
	    return node;
	  }

	  /**
	   * An individual part of a binary expression:
	   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
	   * @returns {boolean|jsep.Expression}
	   */
	  gobbleToken() {
	    let ch, to_check, tc_len, node;
	    this.gobbleSpaces();
	    node = this.searchHook('gobble-token');
	    if (node) {
	      return this.runHook('after-token', node);
	    }
	    ch = this.code;
	    if (Jsep.isDecimalDigit(ch) || ch === Jsep.PERIOD_CODE) {
	      // Char code 46 is a dot `.` which can start off a numeric literal
	      return this.gobbleNumericLiteral();
	    }
	    if (ch === Jsep.SQUOTE_CODE || ch === Jsep.DQUOTE_CODE) {
	      // Single or double quotes
	      node = this.gobbleStringLiteral();
	    } else if (ch === Jsep.OBRACK_CODE) {
	      node = this.gobbleArray();
	    } else {
	      to_check = this.expr.substr(this.index, Jsep.max_unop_len);
	      tc_len = to_check.length;
	      while (tc_len > 0) {
	        // Don't accept an unary op when it is an identifier.
	        // Unary ops that start with a identifier-valid character must be followed
	        // by a non identifier-part valid character
	        if (Jsep.unary_ops.hasOwnProperty(to_check) && (!Jsep.isIdentifierStart(this.code) || this.index + to_check.length < this.expr.length && !Jsep.isIdentifierPart(this.expr.charCodeAt(this.index + to_check.length)))) {
	          this.index += tc_len;
	          const argument = this.gobbleToken();
	          if (!argument) {
	            this.throwError('missing unaryOp argument');
	          }
	          return this.runHook('after-token', {
	            type: Jsep.UNARY_EXP,
	            operator: to_check,
	            argument,
	            prefix: true
	          });
	        }
	        to_check = to_check.substr(0, --tc_len);
	      }
	      if (Jsep.isIdentifierStart(ch)) {
	        node = this.gobbleIdentifier();
	        if (Jsep.literals.hasOwnProperty(node.name)) {
	          node = {
	            type: Jsep.LITERAL,
	            value: Jsep.literals[node.name],
	            raw: node.name
	          };
	        } else if (node.name === Jsep.this_str) {
	          node = {
	            type: Jsep.THIS_EXP
	          };
	        }
	      } else if (ch === Jsep.OPAREN_CODE) {
	        // open parenthesis
	        node = this.gobbleGroup();
	      }
	    }
	    if (!node) {
	      return this.runHook('after-token', false);
	    }
	    node = this.gobbleTokenProperty(node);
	    return this.runHook('after-token', node);
	  }

	  /**
	   * Gobble properties of of identifiers/strings/arrays/groups.
	   * e.g. `foo`, `bar.baz`, `foo['bar'].baz`
	   * It also gobbles function calls:
	   * e.g. `Math.acos(obj.angle)`
	   * @param {jsep.Expression} node
	   * @returns {jsep.Expression}
	   */
	  gobbleTokenProperty(node) {
	    this.gobbleSpaces();
	    let ch = this.code;
	    while (ch === Jsep.PERIOD_CODE || ch === Jsep.OBRACK_CODE || ch === Jsep.OPAREN_CODE || ch === Jsep.QUMARK_CODE) {
	      let optional;
	      if (ch === Jsep.QUMARK_CODE) {
	        if (this.expr.charCodeAt(this.index + 1) !== Jsep.PERIOD_CODE) {
	          break;
	        }
	        optional = true;
	        this.index += 2;
	        this.gobbleSpaces();
	        ch = this.code;
	      }
	      this.index++;
	      if (ch === Jsep.OBRACK_CODE) {
	        node = {
	          type: Jsep.MEMBER_EXP,
	          computed: true,
	          object: node,
	          property: this.gobbleExpression()
	        };
	        if (!node.property) {
	          this.throwError('Unexpected "' + this.char + '"');
	        }
	        this.gobbleSpaces();
	        ch = this.code;
	        if (ch !== Jsep.CBRACK_CODE) {
	          this.throwError('Unclosed [');
	        }
	        this.index++;
	      } else if (ch === Jsep.OPAREN_CODE) {
	        // A function call is being made; gobble all the arguments
	        node = {
	          type: Jsep.CALL_EXP,
	          'arguments': this.gobbleArguments(Jsep.CPAREN_CODE),
	          callee: node
	        };
	      } else if (ch === Jsep.PERIOD_CODE || optional) {
	        if (optional) {
	          this.index--;
	        }
	        this.gobbleSpaces();
	        node = {
	          type: Jsep.MEMBER_EXP,
	          computed: false,
	          object: node,
	          property: this.gobbleIdentifier()
	        };
	      }
	      if (optional) {
	        node.optional = true;
	      } // else leave undefined for compatibility with esprima

	      this.gobbleSpaces();
	      ch = this.code;
	    }
	    return node;
	  }

	  /**
	   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
	   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
	   * @returns {jsep.Literal}
	   */
	  gobbleNumericLiteral() {
	    let number = '',
	      ch,
	      chCode;
	    while (Jsep.isDecimalDigit(this.code)) {
	      number += this.expr.charAt(this.index++);
	    }
	    if (this.code === Jsep.PERIOD_CODE) {
	      // can start with a decimal marker
	      number += this.expr.charAt(this.index++);
	      while (Jsep.isDecimalDigit(this.code)) {
	        number += this.expr.charAt(this.index++);
	      }
	    }
	    ch = this.char;
	    if (ch === 'e' || ch === 'E') {
	      // exponent marker
	      number += this.expr.charAt(this.index++);
	      ch = this.char;
	      if (ch === '+' || ch === '-') {
	        // exponent sign
	        number += this.expr.charAt(this.index++);
	      }
	      while (Jsep.isDecimalDigit(this.code)) {
	        // exponent itself
	        number += this.expr.charAt(this.index++);
	      }
	      if (!Jsep.isDecimalDigit(this.expr.charCodeAt(this.index - 1))) {
	        this.throwError('Expected exponent (' + number + this.char + ')');
	      }
	    }
	    chCode = this.code;

	    // Check to make sure this isn't a variable name that start with a number (123abc)
	    if (Jsep.isIdentifierStart(chCode)) {
	      this.throwError('Variable names cannot start with a number (' + number + this.char + ')');
	    } else if (chCode === Jsep.PERIOD_CODE || number.length === 1 && number.charCodeAt(0) === Jsep.PERIOD_CODE) {
	      this.throwError('Unexpected period');
	    }
	    return {
	      type: Jsep.LITERAL,
	      value: parseFloat(number),
	      raw: number
	    };
	  }

	  /**
	   * Parses a string literal, staring with single or double quotes with basic support for escape codes
	   * e.g. `"hello world"`, `'this is\nJSEP'`
	   * @returns {jsep.Literal}
	   */
	  gobbleStringLiteral() {
	    let str = '';
	    const startIndex = this.index;
	    const quote = this.expr.charAt(this.index++);
	    let closed = false;
	    while (this.index < this.expr.length) {
	      let ch = this.expr.charAt(this.index++);
	      if (ch === quote) {
	        closed = true;
	        break;
	      } else if (ch === '\\') {
	        // Check for all of the common escape codes
	        ch = this.expr.charAt(this.index++);
	        switch (ch) {
	          case 'n':
	            str += '\n';
	            break;
	          case 'r':
	            str += '\r';
	            break;
	          case 't':
	            str += '\t';
	            break;
	          case 'b':
	            str += '\b';
	            break;
	          case 'f':
	            str += '\f';
	            break;
	          case 'v':
	            str += '\x0B';
	            break;
	          default:
	            str += ch;
	        }
	      } else {
	        str += ch;
	      }
	    }
	    if (!closed) {
	      this.throwError('Unclosed quote after "' + str + '"');
	    }
	    return {
	      type: Jsep.LITERAL,
	      value: str,
	      raw: this.expr.substring(startIndex, this.index)
	    };
	  }

	  /**
	   * Gobbles only identifiers
	   * e.g.: `foo`, `_value`, `$x1`
	   * Also, this function checks if that identifier is a literal:
	   * (e.g. `true`, `false`, `null`) or `this`
	   * @returns {jsep.Identifier}
	   */
	  gobbleIdentifier() {
	    let ch = this.code,
	      start = this.index;
	    if (Jsep.isIdentifierStart(ch)) {
	      this.index++;
	    } else {
	      this.throwError('Unexpected ' + this.char);
	    }
	    while (this.index < this.expr.length) {
	      ch = this.code;
	      if (Jsep.isIdentifierPart(ch)) {
	        this.index++;
	      } else {
	        break;
	      }
	    }
	    return {
	      type: Jsep.IDENTIFIER,
	      name: this.expr.slice(start, this.index)
	    };
	  }

	  /**
	   * Gobbles a list of arguments within the context of a function call
	   * or array literal. This function also assumes that the opening character
	   * `(` or `[` has already been gobbled, and gobbles expressions and commas
	   * until the terminator character `)` or `]` is encountered.
	   * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
	   * @param {number} termination
	   * @returns {jsep.Expression[]}
	   */
	  gobbleArguments(termination) {
	    const args = [];
	    let closed = false;
	    let separator_count = 0;
	    while (this.index < this.expr.length) {
	      this.gobbleSpaces();
	      let ch_i = this.code;
	      if (ch_i === termination) {
	        // done parsing
	        closed = true;
	        this.index++;
	        if (termination === Jsep.CPAREN_CODE && separator_count && separator_count >= args.length) {
	          this.throwError('Unexpected token ' + String.fromCharCode(termination));
	        }
	        break;
	      } else if (ch_i === Jsep.COMMA_CODE) {
	        // between expressions
	        this.index++;
	        separator_count++;
	        if (separator_count !== args.length) {
	          // missing argument
	          if (termination === Jsep.CPAREN_CODE) {
	            this.throwError('Unexpected token ,');
	          } else if (termination === Jsep.CBRACK_CODE) {
	            for (let arg = args.length; arg < separator_count; arg++) {
	              args.push(null);
	            }
	          }
	        }
	      } else if (args.length !== separator_count && separator_count !== 0) {
	        // NOTE: `&& separator_count !== 0` allows for either all commas, or all spaces as arguments
	        this.throwError('Expected comma');
	      } else {
	        const node = this.gobbleExpression();
	        if (!node || node.type === Jsep.COMPOUND) {
	          this.throwError('Expected comma');
	        }
	        args.push(node);
	      }
	    }
	    if (!closed) {
	      this.throwError('Expected ' + String.fromCharCode(termination));
	    }
	    return args;
	  }

	  /**
	   * Responsible for parsing a group of things within parentheses `()`
	   * that have no identifier in front (so not a function call)
	   * This function assumes that it needs to gobble the opening parenthesis
	   * and then tries to gobble everything within that parenthesis, assuming
	   * that the next thing it should see is the close parenthesis. If not,
	   * then the expression probably doesn't have a `)`
	   * @returns {boolean|jsep.Expression}
	   */
	  gobbleGroup() {
	    this.index++;
	    let nodes = this.gobbleExpressions(Jsep.CPAREN_CODE);
	    if (this.code === Jsep.CPAREN_CODE) {
	      this.index++;
	      if (nodes.length === 1) {
	        return nodes[0];
	      } else if (!nodes.length) {
	        return false;
	      } else {
	        return {
	          type: Jsep.SEQUENCE_EXP,
	          expressions: nodes
	        };
	      }
	    } else {
	      this.throwError('Unclosed (');
	    }
	  }

	  /**
	   * Responsible for parsing Array literals `[1, 2, 3]`
	   * This function assumes that it needs to gobble the opening bracket
	   * and then tries to gobble the expressions as arguments.
	   * @returns {jsep.ArrayExpression}
	   */
	  gobbleArray() {
	    this.index++;
	    return {
	      type: Jsep.ARRAY_EXP,
	      elements: this.gobbleArguments(Jsep.CBRACK_CODE)
	    };
	  }
	}

	// Static fields:
	const hooks = new Hooks();
	Object.assign(Jsep, {
	  hooks,
	  plugins: new Plugins(Jsep),
	  // Node Types
	  // ----------
	  // This is the full set of types that any JSEP node can be.
	  // Store them here to save space when minified
	  COMPOUND: 'Compound',
	  SEQUENCE_EXP: 'SequenceExpression',
	  IDENTIFIER: 'Identifier',
	  MEMBER_EXP: 'MemberExpression',
	  LITERAL: 'Literal',
	  THIS_EXP: 'ThisExpression',
	  CALL_EXP: 'CallExpression',
	  UNARY_EXP: 'UnaryExpression',
	  BINARY_EXP: 'BinaryExpression',
	  ARRAY_EXP: 'ArrayExpression',
	  TAB_CODE: 9,
	  LF_CODE: 10,
	  CR_CODE: 13,
	  SPACE_CODE: 32,
	  PERIOD_CODE: 46,
	  // '.'
	  COMMA_CODE: 44,
	  // ','
	  SQUOTE_CODE: 39,
	  // single quote
	  DQUOTE_CODE: 34,
	  // double quotes
	  OPAREN_CODE: 40,
	  // (
	  CPAREN_CODE: 41,
	  // )
	  OBRACK_CODE: 91,
	  // [
	  CBRACK_CODE: 93,
	  // ]
	  QUMARK_CODE: 63,
	  // ?
	  SEMCOL_CODE: 59,
	  // ;
	  COLON_CODE: 58,
	  // :

	  // Operations
	  // ----------
	  // Use a quickly-accessible map to store all of the unary operators
	  // Values are set to `1` (it really doesn't matter)
	  unary_ops: {
	    '-': 1,
	    '!': 1,
	    '~': 1,
	    '+': 1
	  },
	  // Also use a map for the binary operations but set their values to their
	  // binary precedence for quick reference (higher number = higher precedence)
	  // see [Order of operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
	  binary_ops: {
	    '||': 1,
	    '??': 1,
	    '&&': 2,
	    '|': 3,
	    '^': 4,
	    '&': 5,
	    '==': 6,
	    '!=': 6,
	    '===': 6,
	    '!==': 6,
	    '<': 7,
	    '>': 7,
	    '<=': 7,
	    '>=': 7,
	    '<<': 8,
	    '>>': 8,
	    '>>>': 8,
	    '+': 9,
	    '-': 9,
	    '*': 10,
	    '/': 10,
	    '%': 10,
	    '**': 11
	  },
	  // sets specific binary_ops as right-associative
	  right_associative: new Set(['**']),
	  // Additional valid identifier chars, apart from a-z, A-Z and 0-9 (except on the starting char)
	  additional_identifier_chars: new Set(['$', '_']),
	  // Literals
	  // ----------
	  // Store the values to return for the various literals we may encounter
	  literals: {
	    'true': true,
	    'false': false,
	    'null': null
	  },
	  // Except for `this`, which is special. This could be changed to something like `'self'` as well
	  this_str: 'this'
	});
	Jsep.max_unop_len = Jsep.getMaxKeyLen(Jsep.unary_ops);
	Jsep.max_binop_len = Jsep.getMaxKeyLen(Jsep.binary_ops);

	// Backward Compatibility:
	const jsep = expr => new Jsep(expr).parse();
	const stdClassProps = Object.getOwnPropertyNames(class Test {});
	Object.getOwnPropertyNames(Jsep).filter(prop => !stdClassProps.includes(prop) && jsep[prop] === undefined).forEach(m => {
	  jsep[m] = Jsep[m];
	});
	jsep.Jsep = Jsep; // allows for const { Jsep } = require('jsep');

	const CONDITIONAL_EXP = 'ConditionalExpression';
	var ternary = {
	  name: 'ternary',
	  init(jsep) {
	    // Ternary expression: test ? consequent : alternate
	    jsep.hooks.add('after-expression', function gobbleTernary(env) {
	      if (env.node && this.code === jsep.QUMARK_CODE) {
	        this.index++;
	        const test = env.node;
	        const consequent = this.gobbleExpression();
	        if (!consequent) {
	          this.throwError('Expected expression');
	        }
	        this.gobbleSpaces();
	        if (this.code === jsep.COLON_CODE) {
	          this.index++;
	          const alternate = this.gobbleExpression();
	          if (!alternate) {
	            this.throwError('Expected expression');
	          }
	          env.node = {
	            type: CONDITIONAL_EXP,
	            test,
	            consequent,
	            alternate
	          };

	          // check for operators of higher priority than ternary (i.e. assignment)
	          // jsep sets || at 1, and assignment at 0.9, and conditional should be between them
	          if (test.operator && jsep.binary_ops[test.operator] <= 0.9) {
	            let newTest = test;
	            while (newTest.right.operator && jsep.binary_ops[newTest.right.operator] <= 0.9) {
	              newTest = newTest.right;
	            }
	            env.node.test = newTest.right;
	            newTest.right = env.node;
	            env.node = test;
	          }
	        } else {
	          this.throwError('Expected :');
	        }
	      }
	    });
	  }
	};

	// Add default plugins:

	jsep.plugins.register(ternary);

	const FSLASH_CODE = 47; // '/'
	const BSLASH_CODE = 92; // '\\'

	var index = {
	  name: 'regex',
	  init(jsep) {
	    // Regex literal: /abc123/ig
	    jsep.hooks.add('gobble-token', function gobbleRegexLiteral(env) {
	      if (this.code === FSLASH_CODE) {
	        const patternIndex = ++this.index;
	        let inCharSet = false;
	        while (this.index < this.expr.length) {
	          if (this.code === FSLASH_CODE && !inCharSet) {
	            const pattern = this.expr.slice(patternIndex, this.index);
	            let flags = '';
	            while (++this.index < this.expr.length) {
	              const code = this.code;
	              if (code >= 97 && code <= 122 // a...z
	              || code >= 65 && code <= 90 // A...Z
	              || code >= 48 && code <= 57) {
	                // 0-9
	                flags += this.char;
	              } else {
	                break;
	              }
	            }
	            let value;
	            try {
	              value = new RegExp(pattern, flags);
	            } catch (e) {
	              this.throwError(e.message);
	            }
	            env.node = {
	              type: jsep.LITERAL,
	              value,
	              raw: this.expr.slice(patternIndex - 1, this.index)
	            };

	            // allow . [] and () after regex: /regex/.test(a)
	            env.node = this.gobbleTokenProperty(env.node);
	            return env.node;
	          }
	          if (this.code === jsep.OBRACK_CODE) {
	            inCharSet = true;
	          } else if (inCharSet && this.code === jsep.CBRACK_CODE) {
	            inCharSet = false;
	          }
	          this.index += this.code === BSLASH_CODE ? 2 : 1;
	        }
	        this.throwError('Unclosed Regex');
	      }
	    });
	  }
	};

	const PLUS_CODE = 43; // +
	const MINUS_CODE = 45; // -

	const plugin = {
	  name: 'assignment',
	  assignmentOperators: new Set(['=', '*=', '**=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '||=', '&&=', '??=']),
	  updateOperators: [PLUS_CODE, MINUS_CODE],
	  assignmentPrecedence: 0.9,
	  init(jsep) {
	    const updateNodeTypes = [jsep.IDENTIFIER, jsep.MEMBER_EXP];
	    plugin.assignmentOperators.forEach(op => jsep.addBinaryOp(op, plugin.assignmentPrecedence, true));
	    jsep.hooks.add('gobble-token', function gobbleUpdatePrefix(env) {
	      const code = this.code;
	      if (plugin.updateOperators.some(c => c === code && c === this.expr.charCodeAt(this.index + 1))) {
	        this.index += 2;
	        env.node = {
	          type: 'UpdateExpression',
	          operator: code === PLUS_CODE ? '++' : '--',
	          argument: this.gobbleTokenProperty(this.gobbleIdentifier()),
	          prefix: true
	        };
	        if (!env.node.argument || !updateNodeTypes.includes(env.node.argument.type)) {
	          this.throwError(`Unexpected ${env.node.operator}`);
	        }
	      }
	    });
	    jsep.hooks.add('after-token', function gobbleUpdatePostfix(env) {
	      if (env.node) {
	        const code = this.code;
	        if (plugin.updateOperators.some(c => c === code && c === this.expr.charCodeAt(this.index + 1))) {
	          if (!updateNodeTypes.includes(env.node.type)) {
	            this.throwError(`Unexpected ${env.node.operator}`);
	          }
	          this.index += 2;
	          env.node = {
	            type: 'UpdateExpression',
	            operator: code === PLUS_CODE ? '++' : '--',
	            argument: env.node,
	            prefix: false
	          };
	        }
	      }
	    });
	    jsep.hooks.add('after-expression', function gobbleAssignment(env) {
	      if (env.node) {
	        // Note: Binaries can be chained in a single expression to respect
	        // operator precedence (i.e. a = b = 1 + 2 + 3)
	        // Update all binary assignment nodes in the tree
	        updateBinariesToAssignments(env.node);
	      }
	    });
	    function updateBinariesToAssignments(node) {
	      if (plugin.assignmentOperators.has(node.operator)) {
	        node.type = 'AssignmentExpression';
	        updateBinariesToAssignments(node.left);
	        updateBinariesToAssignments(node.right);
	      } else if (!node.operator) {
	        Object.values(node).forEach(val => {
	          if (val && typeof val === 'object') {
	            updateBinariesToAssignments(val);
	          }
	        });
	      }
	    }
	  }
	};

	/* eslint-disable no-bitwise -- Convenient */

	// register plugins
	jsep.plugins.register(index, plugin);
	jsep.addUnaryOp('typeof');
	jsep.addUnaryOp('void');
	jsep.addLiteral('null', null);
	jsep.addLiteral('undefined', undefined);
	const BLOCKED_PROTO_PROPERTIES = new Set(['constructor', '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__']);
	const SafeEval = {
	  /**
	   * @param {jsep.Expression} ast
	   * @param {Record<string, any>} subs
	   */
	  evalAst(ast, subs) {
	    switch (ast.type) {
	      case 'BinaryExpression':
	      case 'LogicalExpression':
	        return SafeEval.evalBinaryExpression(ast, subs);
	      case 'Compound':
	        return SafeEval.evalCompound(ast, subs);
	      case 'ConditionalExpression':
	        return SafeEval.evalConditionalExpression(ast, subs);
	      case 'Identifier':
	        return SafeEval.evalIdentifier(ast, subs);
	      case 'Literal':
	        return SafeEval.evalLiteral(ast, subs);
	      case 'MemberExpression':
	        return SafeEval.evalMemberExpression(ast, subs);
	      case 'UnaryExpression':
	        return SafeEval.evalUnaryExpression(ast, subs);
	      case 'ArrayExpression':
	        return SafeEval.evalArrayExpression(ast, subs);
	      case 'CallExpression':
	        return SafeEval.evalCallExpression(ast, subs);
	      case 'AssignmentExpression':
	        return SafeEval.evalAssignmentExpression(ast, subs);
	      default:
	        throw SyntaxError('Unexpected expression', ast);
	    }
	  },
	  evalBinaryExpression(ast, subs) {
	    const result = {
	      '||': (a, b) => a || b(),
	      '&&': (a, b) => a && b(),
	      '|': (a, b) => a | b(),
	      '^': (a, b) => a ^ b(),
	      '&': (a, b) => a & b(),
	      // eslint-disable-next-line eqeqeq -- API
	      '==': (a, b) => a == b(),
	      // eslint-disable-next-line eqeqeq -- API
	      '!=': (a, b) => a != b(),
	      '===': (a, b) => a === b(),
	      '!==': (a, b) => a !== b(),
	      '<': (a, b) => a < b(),
	      '>': (a, b) => a > b(),
	      '<=': (a, b) => a <= b(),
	      '>=': (a, b) => a >= b(),
	      '<<': (a, b) => a << b(),
	      '>>': (a, b) => a >> b(),
	      '>>>': (a, b) => a >>> b(),
	      '+': (a, b) => a + b(),
	      '-': (a, b) => a - b(),
	      '*': (a, b) => a * b(),
	      '/': (a, b) => a / b(),
	      '%': (a, b) => a % b()
	    }[ast.operator](SafeEval.evalAst(ast.left, subs), () => SafeEval.evalAst(ast.right, subs));
	    return result;
	  },
	  evalCompound(ast, subs) {
	    let last;
	    for (let i = 0; i < ast.body.length; i++) {
	      if (ast.body[i].type === 'Identifier' && ['var', 'let', 'const'].includes(ast.body[i].name) && ast.body[i + 1] && ast.body[i + 1].type === 'AssignmentExpression') {
	        // var x=2; is detected as
	        // [{Identifier var}, {AssignmentExpression x=2}]
	        // eslint-disable-next-line @stylistic/max-len -- Long
	        // eslint-disable-next-line sonarjs/updated-loop-counter -- Convenient
	        i += 1;
	      }
	      const expr = ast.body[i];
	      last = SafeEval.evalAst(expr, subs);
	    }
	    return last;
	  },
	  evalConditionalExpression(ast, subs) {
	    if (SafeEval.evalAst(ast.test, subs)) {
	      return SafeEval.evalAst(ast.consequent, subs);
	    }
	    return SafeEval.evalAst(ast.alternate, subs);
	  },
	  evalIdentifier(ast, subs) {
	    if (Object.hasOwn(subs, ast.name)) {
	      return subs[ast.name];
	    }
	    throw ReferenceError(`${ast.name} is not defined`);
	  },
	  evalLiteral(ast) {
	    return ast.value;
	  },
	  evalMemberExpression(ast, subs) {
	    const prop = String(
	    // NOTE: `String(value)` throws error when
	    // value has overwritten the toString method to return non-string
	    // i.e. `value = {toString: () => []}`
	    ast.computed ? SafeEval.evalAst(ast.property) // `object[property]`
	    : ast.property.name // `object.property` property is Identifier
	    );
	    const obj = SafeEval.evalAst(ast.object, subs);
	    if (obj === undefined || obj === null) {
	      throw TypeError(`Cannot read properties of ${obj} (reading '${prop}')`);
	    }
	    if (!Object.hasOwn(obj, prop) && BLOCKED_PROTO_PROPERTIES.has(prop)) {
	      throw TypeError(`Cannot read properties of ${obj} (reading '${prop}')`);
	    }
	    const result = obj[prop];
	    if (typeof result === 'function') {
	      return result.bind(obj); // arrow functions aren't affected by bind.
	    }
	    return result;
	  },
	  evalUnaryExpression(ast, subs) {
	    const result = {
	      '-': a => -SafeEval.evalAst(a, subs),
	      '!': a => !SafeEval.evalAst(a, subs),
	      '~': a => ~SafeEval.evalAst(a, subs),
	      // eslint-disable-next-line no-implicit-coercion -- API
	      '+': a => +SafeEval.evalAst(a, subs),
	      typeof: a => typeof SafeEval.evalAst(a, subs),
	      // eslint-disable-next-line no-void, sonarjs/void-use -- feature
	      void: a => void SafeEval.evalAst(a, subs)
	    }[ast.operator](ast.argument);
	    return result;
	  },
	  evalArrayExpression(ast, subs) {
	    return ast.elements.map(el => SafeEval.evalAst(el, subs));
	  },
	  evalCallExpression(ast, subs) {
	    const args = ast.arguments.map(arg => SafeEval.evalAst(arg, subs));
	    const func = SafeEval.evalAst(ast.callee, subs);
	    /* c8 ignore start  */
	    if (func === Function) {
	      // unreachable since BLOCKED_PROTO_PROPERTIES includes 'constructor'
	      throw new Error('Function constructor is disabled');
	    }
	    /* c8 ignore end  */
	    return func(...args);
	  },
	  evalAssignmentExpression(ast, subs) {
	    if (ast.left.type !== 'Identifier') {
	      throw SyntaxError('Invalid left-hand side in assignment');
	    }
	    const id = ast.left.name;
	    const value = SafeEval.evalAst(ast.right, subs);
	    subs[id] = value;
	    return subs[id];
	  }
	};

	/**
	 * A replacement for NodeJS' VM.Script which is also {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP | Content Security Policy} friendly.
	 */
	class SafeScript {
	  /**
	   * @param {string} expr Expression to evaluate
	   */
	  constructor(expr) {
	    this.code = expr;
	    this.ast = jsep(this.code);
	  }

	  /**
	   * @param {object} context Object whose items will be added
	   *   to evaluation
	   * @returns {EvaluatedResult} Result of evaluated code
	   */
	  runInNewContext(context) {
	    // `Object.create(null)` creates a prototypeless object
	    const keyMap = Object.assign(Object.create(null), context);
	    return SafeEval.evalAst(this.ast, keyMap);
	  }
	}

	/* eslint-disable camelcase -- Convenient for escaping */


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
	function push(arr, item) {
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
	function unshift(item, arr) {
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
	  constructor(value) {
	    super('JSONPath should not be called with "new" (it prevents return ' + 'of (unwrapped) scalar values)');
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
	function JSONPath(opts, expr, obj, callback, otherTypeCallback) {
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
	  this.ignoreEvalErrors = typeof opts.ignoreEvalErrors === 'undefined' ? false : opts.ignoreEvalErrors;
	  this.parent = opts.parent || null;
	  this.parentProperty = opts.parentProperty || null;
	  this.callback = opts.callback || callback || null;
	  this.otherTypeCallback = opts.otherTypeCallback || otherTypeCallback || function () {
	    throw new TypeError('You must supply an otherTypeCallback callback option ' + 'with the @other() operator.');
	  };
	  if (opts.autostart !== false) {
	    const args = {
	      path: optObj ? opts.path : expr
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
	JSONPath.prototype.evaluate = function (expr, json, callback, otherTypeCallback) {
	  let currParent = this.parent,
	    currParentProperty = this.parentProperty;
	  let {
	    flatten,
	    wrap
	  } = this;
	  this.currResultType = this.resultType;
	  this.currEval = this.eval;
	  this.currSandbox = this.sandbox;
	  callback = callback || this.callback;
	  this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;
	  json = json || this.json;
	  expr = expr || this.path;
	  if (expr && typeof expr === 'object' && !Array.isArray(expr)) {
	    if (!expr.path && expr.path !== '') {
	      throw new TypeError('You must supply a "path" property when providing an object ' + 'argument to JSONPath.evaluate().');
	    }
	    if (!Object.hasOwn(expr, 'json')) {
	      throw new TypeError('You must supply a "json" property when providing an object ' + 'argument to JSONPath.evaluate().');
	    }
	    ({
	      json
	    } = expr);
	    flatten = Object.hasOwn(expr, 'flatten') ? expr.flatten : flatten;
	    this.currResultType = Object.hasOwn(expr, 'resultType') ? expr.resultType : this.currResultType;
	    this.currSandbox = Object.hasOwn(expr, 'sandbox') ? expr.sandbox : this.currSandbox;
	    wrap = Object.hasOwn(expr, 'wrap') ? expr.wrap : wrap;
	    this.currEval = Object.hasOwn(expr, 'eval') ? expr.eval : this.currEval;
	    callback = Object.hasOwn(expr, 'callback') ? expr.callback : callback;
	    this.currOtherTypeCallback = Object.hasOwn(expr, 'otherTypeCallback') ? expr.otherTypeCallback : this.currOtherTypeCallback;
	    currParent = Object.hasOwn(expr, 'parent') ? expr.parent : currParent;
	    currParentProperty = Object.hasOwn(expr, 'parentProperty') ? expr.parentProperty : currParentProperty;
	    expr = expr.path;
	  }
	  currParent = currParent || null;
	  currParentProperty = currParentProperty || null;
	  if (Array.isArray(expr)) {
	    expr = JSONPath.toPathString(expr);
	  }
	  if (!expr && expr !== '' || !json) {
	    return undefined;
	  }
	  const exprList = JSONPath.toPathParts(expr);
	  if (exprList[0] && exprList[0].type === 'root' && exprList.length > 1) {
	    exprList.shift();
	  }
	  this._hasParentSelector = null;
	  this._json = json; // Store root for parent selector navigation
	  const result = this._trace(exprList, json, ['$'], currParent, currParentProperty, callback).filter(function (ea) {
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
	    case 'all':
	      {
	        const path = Array.isArray(ea.path) ? ea.path : JSONPath.toPathParts(ea.path);
	        ea.pointer = JSONPath.toPointer(path);
	        ea.path = typeof ea.path === 'string' ? ea.path : JSONPath.toPathString(ea.path);
	        return ea;
	      }
	    case 'value':
	    case 'parent':
	    case 'parentProperty':
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
	    fullRetObj.path = typeof fullRetObj.path === 'string' ? fullRetObj.path : JSONPath.toPathString(fullRetObj.path);
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
	JSONPath.prototype._trace = function (expr, val, path, parent, parentPropName, callback, hasArrExpr, literalPriority) {
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
	  const token = expr[0],
	    x = expr.slice(1);

	  // We need to gather the return value of recursive trace calls in order to
	  // do the parent sel computation.
	  const ret = [];
	  /**
	   *
	   * @param {ReturnObject|ReturnObject[]} elems
	   * @returns {void}
	   */
	  function addRet(elems) {
	    if (Array.isArray(elems)) {
	      // This was causing excessive stack size in Node (with or
	      //  without Babel) against our performance test:
	      //  `ret.push(...elems);`
	      elems.forEach(t => {
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
	      addRet(this._trace(x, val[token], push(path, token), val, token, callback, hasArrExpr));
	    }
	  } else if (typeof token === 'number') {
	    // Simple numeric index access
	    if (Array.isArray(val) && token >= 0 && token < val.length) {
	      addRet(this._trace(x, val[token], push(path, token), val, token, callback, hasArrExpr));
	    }
	  } else if (token && typeof token === 'object' && token.type) {
	    // Handle complex token objects
	    switch (token.type) {
	      case 'root':
	        // $
	        addRet(this._trace(x, val, path, null, null, callback, hasArrExpr));
	        break;
	      case 'property':
	        {
	          const propName = token.value;
	          // Check if property exists (escaped flag just means it's not wildcard)
	          if (val && Object.hasOwn(val, propName)) {
	            addRet(this._trace(x, val[propName], push(path, propName), val, propName, callback, hasArrExpr, true));
	          }
	          break;
	        }
	      case 'wildcard':
	        // *
	        this._walk(val, m => {
	          addRet(this._trace(x, val[m], push(path, m), val, m, callback, true, true));
	        });
	        break;
	      case 'descent':
	        // ..
	        // Check remaining expression with val's immediate children
	        addRet(this._trace(x, val, path, parent, parentPropName, callback, hasArrExpr));
	        this._walk(val, m => {
	          // We don't join m and x here because we only want parents,
	          //   not scalar values
	          if (typeof val[m] === 'object') {
	            // Keep going with recursive descent on val's
	            //   object children
	            addRet(this._trace(expr.slice(), val[m], push(path, m), val, m, callback, true));
	          }
	        });
	        break;
	      case 'parent':
	        // ^
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
	      case 'propertyName':
	        // ~
	        retObj = {
	          path: push(path, '~'),
	          value: parentPropName,
	          parent,
	          parentProperty: null
	        };
	        this._handleCallback(retObj, callback, 'property');
	        ret.push(retObj);
	        break;
	      case 'index':
	        {
	          const idx = token.value;
	          if (Array.isArray(val) && idx >= 0 && idx < val.length || val && Object.hasOwn(val, idx)) {
	            addRet(this._trace(x, val[idx], push(path, idx), val, idx, callback, hasArrExpr, true));
	          }
	          break;
	        }
	      case 'slice':
	        addRet(this._slice(token, x, val, path, parent, parentPropName, callback));
	        break;
	      case 'filter':
	        {
	          if (this.currEval === false) {
	            throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
	          }

	          // Quick check: Does this filter have nested paths?
	          const hasNesting = token.expression.includes('[?(');
	          if (!hasNesting) {
	            // Fast path: No nesting, skip extraction
	            this._walk(val, m => {
	              if (this._eval(token.expression, val[m], m, path, parent, parentPropName)) {
	                addRet(this._trace(x, val[m], push(path, m), val, m, callback, true));
	              }
	            });
	          } else {
	            // Slow path: Extract and handle nested filters
	            const {
	              expression: modifiedExpr,
	              nestedPaths
	            } = this._extractNestedFilters(token.expression);

	            // Check if expression is JUST a nested path (no other JavaScript)
	            // If so, we need to check array length for truthiness
	            const isSingleNestedPath = nestedPaths.length === 1 && modifiedExpr.trim() === '_$_jp0';

	            // Evaluate filter for each item
	            this._walk(val, m => {
	              // Evaluate nested paths in context of current item
	              const nestedResults = {};
	              for (const [i, nestedPath] of nestedPaths.entries()) {
	                // Convert @ to $ for parsing (@ means current value)
	                const pathForParsing = nestedPath.replace(/^@/u, '$');
	                try {
	                  const nestedTokens = JSONPath.toPathParts(pathForParsing);
	                  // Evaluate nested path on current item
	                  const nestedResult = this._trace(nestedTokens, val[m], push(path, m), val, m, null,
	                  // no callback for nested evaluation
	                  true);
	                  // Extract values from result objects
	                  nestedResults[`_$_jp${i}`] = nestedResult.map(r => r.value);
	                } catch (e) {
	                  // If nested evaluation fails, treat as no matches
	                  nestedResults[`_$_jp${i}`] = [];
	                }
	              }

	              // Add nested results to sandbox temporarily
	              const originalSandbox = {
	                ...this.currSandbox
	              };
	              Object.assign(this.currSandbox, nestedResults);
	              try {
	                // For single nested path, check if array has elements
	                // (empty arrays are truthy in JS but should be falsy in filter)
	                const matches = isSingleNestedPath ? nestedResults._$_jp0.length > 0 : this._eval(modifiedExpr, val[m], m, path, parent, parentPropName);
	                if (matches) {
	                  addRet(this._trace(x, val[m], push(path, m), val, m, callback, true));
	                }
	              } finally {
	                // Restore original sandbox (remove nested result placeholders)
	                this.currSandbox = originalSandbox;
	              }
	            });
	          }
	          break;
	        }
	      case 'dynamic':
	        {
	          if (this.currEval === false) {
	            throw new Error('Eval [(expr)] prevented in JSONPath expression.');
	          }
	          // As this will resolve to a property name (but we don't know it
	          //  yet), property and parent information is relative to the
	          //  parent of the property to which this expression will resolve
	          addRet(this._trace(unshift(this._eval(token.expression, val, path.at(-1), path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback, hasArrExpr));
	          break;
	        }
	      case 'typeOperator':
	        {
	          let addType = false;
	          const {
	            valueType
	          } = token;
	          switch (valueType) {
	            case 'scalar':
	              if (!val || !['object', 'function'].includes(typeof val)) {
	                addType = true;
	              }
	              break;
	            case 'boolean':
	            case 'string':
	            case 'undefined':
	            case 'function':
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
	              addType = this.currOtherTypeCallback(val, path, parent, parentPropName);
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
	              path,
	              value: val,
	              parent,
	              parentProperty: parentPropName
	            };
	            this._handleCallback(retObj, callback, 'value');
	            ret.push(retObj);
	          }
	          break;
	        }
	      case 'multiProperty':
	        {
	          const parts = token.properties;
	          const escapedFlags = token.escaped || [];
	          for (const [i, part] of parts.entries()) {
	            // Check if part is a number (multi-index) or string (multi-property)
	            let partToken;
	            if (typeof part === 'number') {
	              partToken = {
	                type: 'index',
	                value: part
	              };
	            } else {
	              const isEscaped = escapedFlags[i] || false;
	              partToken = {
	                type: 'property',
	                value: part,
	                escaped: isEscaped
	              };
	            }
	            addRet(this._trace(unshift(partToken, x), val, path, parent, parentPropName, callback, true));
	          }
	          break;
	        }
	    }
	  } else if ((typeof token !== 'string' || literalPriority) && val && Object.hasOwn(val, token)) {
	    // simple case--directly follow property (for object tokens or with literalPriority)
	    addRet(this._trace(x, val[token], push(path, token), val, token, callback, hasArrExpr));
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
	        const tmp = this._trace(rett.expr, resultVal, rett.path, resultParent, resultParentProp, callback, hasArrExpr);
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
	    Object.keys(val).forEach(m => {
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
	  function findNextNestedPath(str, startPos) {
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
	              while (i < str.length && /[gimsuvy]/u.test(str[i])) {
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
	          if (c === '.' || c === '[' || c === '*' || c === '^' || c === '~') {
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
	          } else if (/[\w$]/u.test(c)) {
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
	    const {
	      start,
	      end,
	      placeholder
	    } = replacements[i];
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
	JSONPath.prototype._slice = function (token, expr, val, path, parent, parentPropName, callback) {
	  if (!Array.isArray(val)) {
	    return undefined;
	  }
	  const len = val.length;
	  let start = token.start === null ? 0 : token.start;
	  let end = token.end === null ? len : token.end;
	  const step = token.step === null ? 1 : token.step;
	  start = start < 0 ? Math.max(0, start + len) : Math.min(len, start);
	  end = end < 0 ? Math.max(0, end + len) : Math.min(len, end);
	  const ret = [];
	  for (let i = start; i < end; i += step) {
	    const tmp = this._trace(unshift(i, expr), val, path, parent, parentPropName, callback, true);
	    // Should only be possible to be an array here since first part of
	    //   ``unshift(i, expr)` passed in above would not be empty, nor `~`,
	    //     nor begin with `@` (as could return objects)
	    // This was causing excessive stack size in Node (with or
	    //  without Babel) against our performance test: `ret.push(...tmp);`
	    tmp.forEach(t => {
	      ret.push(t);
	    });
	  }
	  return ret;
	};
	JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
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
	    let script = code.replaceAll('@parentProperty', '_$_parentProperty').replaceAll('@parent', '_$_parent').replaceAll('@property', '_$_property').replaceAll('@root', '_$_root').replaceAll(/@([.\s)[])/gu, '_$_v$1');
	    if (containsPath) {
	      script = script.replaceAll('@path', '_$_path');
	    }
	    if (this.currEval === 'safe' || this.currEval === true || this.currEval === undefined) {
	      JSONPath.cache[scriptCacheKey] = new this.safeVm.Script(script);
	    } else if (this.currEval === 'native') {
	      JSONPath.cache[scriptCacheKey] = new this.vm.Script(script);
	    } else if (typeof this.currEval === 'function' && this.currEval.prototype && Object.hasOwn(this.currEval.prototype, 'runInNewContext')) {
	      const CurrEval = this.currEval;
	      JSONPath.cache[scriptCacheKey] = new CurrEval(script);
	    } else if (typeof this.currEval === 'function') {
	      JSONPath.cache[scriptCacheKey] = {
	        runInNewContext: context => this.currEval(script, context)
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
	  const x = pathArr,
	    n = x.length;
	  let p = '$';
	  for (let i = 1; i < n; i++) {
	    const item = x[i];

	    // Handle both old string format and new token format
	    if (typeof item === 'number') {
	      // Array index
	      p += '[' + item + ']';
	    } else if (typeof item === 'string') {
	      // Legacy path
	      if (!/^(~|\^|@.*?\(\))$/u.test(item)) {
	        p += /^[0-9*]+$/u.test(item) ? '[' + item + ']' : "['" + item + "']";
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
	  const x = pointer,
	    n = x.length;
	  let p = '';
	  for (let i = 1; i < n; i++) {
	    const item = x[i];
	    let value;

	    // Handle different formats
	    if (typeof item === 'number') {
	      value = String(item);
	    } else if (typeof item === 'string') {
	      // Legacy string format or special operators
	      if (/^(~|\^|@.*?\(\))$/u.test(item)) {
	        continue; // Skip special operators
	      }
	      value = item;
	    } else if (item && typeof item === 'object') {
	      // New token format
	      switch (item.type) {
	        case 'property':
	          {
	            const {
	              value: propValue
	            } = item;
	            value = propValue;
	            break;
	          }
	        case 'index':
	          {
	            const {
	              value: indexValue
	            } = item;
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
	    p += '/' + value.replaceAll('~', '~0').replaceAll('/', '~1');
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
	    return cache[expr].map(token => typeof token === 'object' && token !== null ? {
	      ...token
	    } : token);
	  }
	  const tokens = [];
	  let i = 0;

	  // Handle empty path - treat as empty property access
	  if (expr === '') {
	    // Hybrid token: empty property is a string
	    tokens.push('');
	    cache[expr] = tokens;
	    return cache[expr].map(token => typeof token === 'object' && token !== null ? {
	      ...token
	    } : token);
	  }

	  /**
	   * Extract balanced content between delimiters.
	   * @param {number} start - Starting position
	   * @param {string} open - Opening delimiter
	   * @param {string} close - Closing delimiter
	   * @throws {SyntaxError} If delimiters are unbalanced
	   * @returns {{content: string, end: number}} Extracted content and end position
	   */
	  function extractBalanced(start, open, close) {
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
	      throw new SyntaxError(`Unbalanced ${open}${close} in expression at position ${start}`);
	    }
	    return {
	      content: expr.slice(start, j - 1),
	      end: j
	    };
	  }

	  /**
	   * Extract quoted string.
	   * @param {number} start - Starting position (after quote)
	   * @param {string} quote - Quote character
	   * @throws {SyntaxError} If string is unterminated
	   * @returns {{content: string, end: number, escaped: boolean}} Extracted content, end position, and whether it's backtick-escaped
	   */
	  function extractQuoted(start, quote) {
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
	        return {
	          content,
	          end: j + 1,
	          escaped
	        };
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
	  function handleDotNotation() {
	    if (i + 1 < expr.length && expr[i + 1] === '.') {
	      // Descendant (..)
	      tokens.push({
	        type: 'descent'
	      });
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
	          tokens.push({
	            type: 'wildcard'
	          });
	          i++;
	          break;
	        case '`':
	          // Backtick escapes the next character
	          i++; // Skip backtick
	          if (i >= expr.length) {
	            throw new SyntaxError('Unexpected end after backtick at position ' + (i - 1));
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
	          tokens.push({
	            type: 'descent'
	          });
	          break;
	        default:
	          {
	            // Regular property name (until next special char)
	            let propName = '';
	            while (i < expr.length && !/[.[\]^~@*]/u.test(expr[i])) {
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
	  function handleBracketNotation() {
	    i++; // Skip [
	    if (i >= expr.length) {
	      throw new SyntaxError('Unexpected end after [ at position ' + (i - 1));
	    }

	    // Skip whitespace
	    while (i < expr.length && /\s/u.test(expr[i])) {
	      i++;
	    }
	    const ch = expr[i];

	    // Wildcard [*]
	    if (ch === '*') {
	      i++;
	      // Skip whitespace and closing bracket
	      while (i < expr.length && /\s/u.test(expr[i])) {
	        i++;
	      }
	      if (expr[i] !== ']') {
	        throw new SyntaxError('Expected ] after * at position ' + i);
	      }
	      i++;
	      tokens.push({
	        type: 'wildcard'
	      });
	      return;
	    }

	    // Filter [?(expression)]
	    if (ch === '?') {
	      if (i + 1 >= expr.length || expr[i + 1] !== '(') {
	        throw new SyntaxError('Expected ( after ? at position ' + i);
	      }
	      i += 2; // Skip ?(
	      const result = extractBalanced(i, '(', ')');
	      const {
	        content: expression
	      } = result;
	      i = result.end;

	      // Skip whitespace and closing bracket
	      while (i < expr.length && /\s/u.test(expr[i])) {
	        i++;
	      }
	      if (expr[i] !== ']') {
	        throw new SyntaxError('Expected ] after filter at position ' + i);
	      }
	      i++;
	      tokens.push({
	        type: 'filter',
	        expression
	      });
	      return;
	    }

	    // Dynamic [(expression)]
	    if (ch === '(') {
	      i++; // Skip (
	      const result = extractBalanced(i, '(', ')');
	      const {
	        content: expression
	      } = result;
	      i = result.end;

	      // Skip whitespace and closing bracket
	      while (i < expr.length && /\s/u.test(expr[i])) {
	        i++;
	      }
	      if (expr[i] !== ']') {
	        throw new SyntaxError('Expected ] after dynamic expression at position ' + i);
	      }
	      i++;
	      tokens.push({
	        type: 'dynamic',
	        expression
	      });
	      return;
	    }

	    // Quoted property ['name'] or ["name"]
	    if (ch === "'" || ch === '"') {
	      const quote = ch;
	      i++; // Skip opening quote
	      const result = extractQuoted(i, quote);
	      const {
	        content,
	        escaped
	      } = result;
	      i = result.end;

	      // Skip whitespace
	      while (i < expr.length && /\s/u.test(expr[i])) {
	        i++;
	      }

	      // Check for comma (multi-property)
	      if (expr[i] === ',') {
	        const properties = [content];
	        const escapedFlags = [escaped];
	        while (expr[i] === ',') {
	          i++; // Skip comma
	          // Skip whitespace
	          while (i < expr.length && /\s/u.test(expr[i])) {
	            i++;
	          }
	          if (expr[i] !== "'" && expr[i] !== '"') {
	            throw new SyntaxError('Expected quoted property after comma at position ' + i);
	          }
	          const q = expr[i];
	          i++;
	          const r = extractQuoted(i, q);
	          properties.push(r.content);
	          escapedFlags.push(r.escaped);
	          i = r.end;
	          // Skip whitespace
	          while (i < expr.length && /\s/u.test(expr[i])) {
	            i++;
	          }
	        }
	        if (expr[i] !== ']') {
	          throw new SyntaxError('Expected ] after multi-property at position ' + i);
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
	        throw new SyntaxError('Expected ] after quoted property at position ' + i);
	      }
	      i++;
	      // Check if quoted property is wildcard
	      if (content === '*' && !escaped) {
	        tokens.push({
	          type: 'wildcard'
	        });
	      } else if (escaped) {
	        // Keep object for escaped properties (metadata needed)
	        tokens.push({
	          type: 'property',
	          value: content,
	          escaped: true
	        });
	      } else {
	        // Hybrid token: use string for unescaped properties
	        tokens.push(content);
	      }
	      return;
	    }

	    // Number (index, slice, or multi-index)
	    if (/[-\d]/u.test(ch) || ch === ':') {
	      let numStr = '';
	      while (i < expr.length && /[-\d:]/u.test(expr[i])) {
	        numStr += expr[i];
	        i++;
	      }

	      // Skip whitespace
	      while (i < expr.length && /\s/u.test(expr[i])) {
	        i++;
	      }

	      // Check for comma (multi-index like [0,1,2])
	      if (expr[i] === ',') {
	        const indices = [Number.parseInt(numStr)];
	        while (expr[i] === ',') {
	          i++; // Skip comma
	          // Skip whitespace
	          while (i < expr.length && /\s/u.test(expr[i])) {
	            i++;
	          }
	          // Read next number
	          let nextNum = '';
	          while (i < expr.length && /[-\d]/u.test(expr[i])) {
	            nextNum += expr[i];
	            i++;
	          }
	          indices.push(Number.parseInt(nextNum));
	          // Skip whitespace
	          while (i < expr.length && /\s/u.test(expr[i])) {
	            i++;
	          }
	        }
	        if (expr[i] !== ']') {
	          throw new SyntaxError('Expected ] after multi-index at position ' + i);
	        }
	        i++;
	        // Create multiProperty token with numeric properties
	        tokens.push({
	          type: 'multiProperty',
	          properties: indices
	        });
	        return;
	      }
	      if (expr[i] !== ']') {
	        throw new SyntaxError('Expected ] after number at position ' + i);
	      }
	      i++;

	      // Check if it's a slice (contains :)
	      if (numStr.includes(':')) {
	        const parts = numStr.split(':');
	        const start = parts[0] === '' ? null : Number.parseInt(parts[0]);
	        const end = parts[1] === '' ? null : Number.parseInt(parts[1]);
	        const step = parts.length > 2 && parts[2] !== '' ? Number.parseInt(parts[2]) : null;
	        tokens.push({
	          type: 'slice',
	          start,
	          end,
	          step,
	          raw: numStr
	        });
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
	    while (i < expr.length && expr[i] !== ']' && expr[i] !== ',' && !/\s/u.test(expr[i])) {
	      if (expr[i] === '`' && i + 1 < expr.length && expr[i + 1] !== ']' && expr[i + 1] !== ',') {
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
	    while (i < expr.length && /\s/u.test(expr[i])) {
	      i++;
	    }

	    // Check for comma (multi-property with unquoted names)
	    if (expr[i] === ',') {
	      const properties = [propName];
	      const escapedFlags = [escaped];
	      while (expr[i] === ',') {
	        i++; // Skip comma
	        // Skip whitespace
	        while (i < expr.length && /\s/u.test(expr[i])) {
	          i++;
	        }
	        let prop = '';
	        let propEscaped = false;
	        while (i < expr.length && expr[i] !== ']' && expr[i] !== ',' && !/\s/u.test(expr[i])) {
	          if (expr[i] === '`' && i + 1 < expr.length && expr[i + 1] !== ']' && expr[i + 1] !== ',') {
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
	          throw new SyntaxError('Expected property name after comma at position ' + i);
	        }
	        properties.push(prop);
	        escapedFlags.push(propEscaped);
	        // Skip whitespace
	        while (i < expr.length && /\s/u.test(expr[i])) {
	          i++;
	        }
	      }
	      if (expr[i] !== ']') {
	        throw new SyntaxError('Expected ] after multi-property at position ' + i);
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
	      throw new SyntaxError('Expected ] after property at position ' + i);
	    }
	    i++;
	    if (propName) {
	      if (escaped) {
	        // Keep object for escaped properties
	        tokens.push({
	          type: 'property',
	          value: propName,
	          escaped: true
	        });
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
	  function handleTypeOperator() {
	    i++; // Skip @
	    let typeName = '';
	    while (i < expr.length && /[a-z]/ui.test(expr[i])) {
	      typeName += expr[i];
	      i++;
	    }
	    if (i + 1 >= expr.length || expr[i] !== '(' || expr[i + 1] !== ')') {
	      throw new SyntaxError('Expected () after @' + typeName + ' at position ' + i);
	    }
	    i += 2; // Skip ()
	    tokens.push({
	      type: 'typeOperator',
	      valueType: typeName
	    });
	  }

	  // If path doesn't start with $, [, or other special char, add implicit root
	  if (expr.length > 0 && !['$', '[', '.', '^', '~', '@'].includes(expr[0])) {
	    tokens.push({
	      type: 'root'
	    });
	    // Prepend with a dot to make it valid for our parser
	    expr = '.' + expr;
	  }

	  // Main parsing loop
	  while (i < expr.length) {
	    const ch = expr[i];
	    switch (ch) {
	      case '$':
	        tokens.push({
	          type: 'root'
	        });
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
	        tokens.push({
	          type: 'wildcard'
	        });
	        i++;
	        break;
	      case '^':
	        // If parent selector comes right after root (or at start),
	        // add implicit empty string property
	        // This handles cases like "^" or "$^" which should be "['']^"
	        if (tokens.length === 0 || tokens.length === 1 && tokens[0].type === 'root') {
	          // Hybrid token: empty property is a string
	          tokens.push('');
	        }
	        tokens.push({
	          type: 'parent'
	        });
	        i++;
	        break;
	      case '~':
	        tokens.push({
	          type: 'propertyName'
	        });
	        i++;
	        break;
	      case '@':
	        // Check if this is a type operator like @boolean()
	        // Type operators have the pattern: @identifier()
	        if (/^@[a-z]+\(\)/ui.test(expr.slice(i))) {
	          handleTypeOperator();
	        } else {
	          // Treat @ as part of a property name
	          let propName = '';
	          while (i < expr.length && /[\w$@\\]/u.test(expr[i])) {
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
	        if (/[\w$]/u.test(ch)) {
	          let propName = '';
	          while (i < expr.length && /[\w$]/u.test(expr[i])) {
	            propName += expr[i];
	            i++;
	          }
	          // Hybrid token: use string for unescaped properties
	          tokens.push(propName);
	        } else {
	          throw new SyntaxError(`Unexpected character '${ch}' at position ${i}`);
	        }
	    }
	  }
	  cache[expr] = tokens;
	  return tokens.map(token => typeof token === 'object' && token !== null ? {
	    ...token
	  } : token);
	};
	JSONPath.prototype.safeVm = {
	  Script: SafeScript
	};

	/**
	 * @typedef {any} ContextItem
	 */

	/**
	 * @typedef {any} EvaluatedResult
	 */

	/**
	 * @callback ConditionCallback
	 * @param {ContextItem} item
	 * @returns {boolean}
	 */

	/**
	 * Copy items out of one array into another.
	 * @param {GenericArray} source Array with items to copy
	 * @param {GenericArray} target Array to which to copy
	 * @param {ConditionCallback} conditionCb Callback passed the current item;
	 *     will move item if evaluates to `true`
	 * @returns {void}
	 */
	const moveToAnotherArray = function (source, target, conditionCb) {
	  const il = source.length;
	  for (let i = 0; i < il; i++) {
	    const item = source[i];
	    if (conditionCb(item)) {
	      // eslint-disable-next-line @stylistic/max-len -- Long
	      // eslint-disable-next-line sonarjs/updated-loop-counter -- Convenient
	      target.push(source.splice(i--, 1)[0]);
	    }
	  }
	};

	/**
	 * In-browser replacement for NodeJS' VM.Script.
	 */
	class Script {
	  /**
	   * @param {string} expr Expression to evaluate
	   */
	  constructor(expr) {
	    this.code = expr;
	  }

	  /**
	   * @param {object} context Object whose items will be added
	   *   to evaluation
	   * @returns {EvaluatedResult} Result of evaluated code
	   */
	  runInNewContext(context) {
	    let expr = this.code;
	    const keys = Object.keys(context);
	    const funcs = [];
	    moveToAnotherArray(keys, funcs, key => {
	      return typeof context[key] === 'function';
	    });
	    const values = keys.map(vr => {
	      return context[vr];
	    });
	    const funcString = funcs.reduce((s, func) => {
	      let fString = context[func].toString();
	      if (!/function/u.test(fString)) {
	        fString = 'function ' + fString;
	      }
	      return 'var ' + func + '=' + fString + ';' + s;
	    }, '');
	    expr = funcString + expr;

	    // Mitigate http://perfectionkills.com/global-eval-what-are-the-options/#new_function
	    if (!/(['"])use strict\1/u.test(expr) && !keys.includes('arguments')) {
	      expr = 'var arguments = undefined;' + expr;
	    }

	    // Remove last semi so `return` will be inserted before
	    //  the previous one instead, allowing for the return
	    //  of a bare ending expression
	    expr = expr.replace(/;\s*$/u, '');

	    // Insert `return`
	    const lastStatementEnd = expr.lastIndexOf(';');
	    const code = lastStatementEnd !== -1 ? expr.slice(0, lastStatementEnd + 1) + ' return ' + expr.slice(lastStatementEnd + 1) : ' return ' + expr;

	    // eslint-disable-next-line no-new-func -- User's choice
	    return new Function(...keys, code)(...values);
	  }
	}
	JSONPath.prototype.vm = {
	  Script
	};

	exports.JSONPath = JSONPath;

}));
