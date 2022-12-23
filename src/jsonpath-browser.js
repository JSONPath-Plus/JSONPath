/* eslint-disable no-bitwise */
import jsep from 'jsep';
import jsepRegex from '@jsep-plugin/regex';
import {JSONPath} from './jsonpath.js';

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
            target.push(source.splice(i--, 1)[0]);
        }
    }
};

// register plugins
jsep.plugins.register(jsepRegex);

const SafeEval = {
    eval (code, substitions = {}) {
        const ast = jsep(code);
        return SafeEval.evalAst(ast, substitions);
    },
    /**
     * @param {jsep.Expression} ast
     * @param {Record<string, any>} subs
     */
    evalAst (ast, subs) {
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
        default:
            throw SyntaxError('Unexpected expression', ast);
        }
    },
    evalBinaryExpression (ast, subs) {
        const result = ({
            '||': (a, b) => a || b(),
            '&&': (a, b) => a && b(),
            '|': (a, b) => a | b(),
            '^': (a, b) => a ^ b(),
            '&': (a, b) => a & b(),
            // eslint-disable-next-line eqeqeq
            '==': (a, b) => a == b(),
            // eslint-disable-next-line eqeqeq
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
        })[ast.operator](SafeEval.evalAst(ast.left, subs), () => SafeEval.evalAst(ast.right, subs));
        return result;
    },
    evalCompound (ast, subs) {
        let last;
        for (const expr of ast.body) {
            last = this.evalAst(expr, subs);
        }
        return last;
    },
    evalConditionalExpression (ast, subs) {
        if (SafeEval.evalAst(ast.test, subs)) {
            return SafeEval.evalAst(ast.consequent, subs);
        }
        return SafeEval.evalAst(ast.alternate, subs);
    },
    evalIdentifier (ast, subs) {
        if (ast.name in subs) {
            return subs[ast.name];
        }
        throw ReferenceError(`${ast.name} is not defined`);
    },
    evalLiteral (ast, subs) {
        return ast.value;
    },
    evalMemberExpression (ast, subs) {
        const prop = ast.computed
            ? SafeEval.evalAst(ast.property) // `object[property]`
            : ast.property.name; // `object.property` property is identifier
        const obj = SafeEval.evalAst(ast.object, subs);
        const result = obj[prop];
        if (typeof result === 'function') {
            return result.bind(obj); // arrow functions aren't affected by bind.
        }
        return result;
    },
    evalUnaryExpression (ast, subs) {
        const result = ({
            '-': (a) => -SafeEval.evalAst(a),
            '!': (a) => !SafeEval.evalAst(a),
            '~': (a) => ~SafeEval.evalAst(a),
            // eslint-disable-next-line no-implicit-coercion
            '+': (a) => +SafeEval.evalAst(a)
        })[ast.operator](ast.argument);
        return result;
    },
    evalArrayExpression (ast, subs) {
        return ast.elements.map((el) => SafeEval.evalAst(el, subs));
    },
    evalCallExpression (ast, subs) {
        const args = ast.arguments.map((arg) => SafeEval.evalAst(arg, subs));
        const func = SafeEval.evalAst(ast.callee, subs);
        return func(...args);
    }
};

/**
 * In-browser replacement for NodeJS' VM.Script.
 */
class SafeScript {
    /**
     * @param {string} expr Expression to evaluate
     */
    constructor (expr) {
        this.code = expr;
    }

    /**
     * @param {PlainObject} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext (context) {
        const keyMap = {...context};
        return SafeEval.eval(this.code, keyMap);
    }
}

/**
 * In-browser replacement for NodeJS' VM.Script.
 */
class Script {
    /**
     * @param {string} expr Expression to evaluate
     */
    constructor (expr) {
        this.code = expr;
    }

    /**
     * @param {PlainObject} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext (context) {
        let expr = this.code;
        const keys = Object.keys(context);
        const funcs = [];
        moveToAnotherArray(keys, funcs, (key) => {
            return typeof context[key] === 'function';
        });
        const values = keys.map((vr, i) => {
            return context[vr];
        });

        const funcString = funcs.reduce((s, func) => {
            let fString = context[func].toString();
            if (!(/function/u).test(fString)) {
                fString = 'function ' + fString;
            }
            return 'var ' + func + '=' + fString + ';' + s;
        }, '');

        expr = funcString + expr;

        // Mitigate http://perfectionkills.com/global-eval-what-are-the-options/#new_function
        if (!(/(['"])use strict\1/u).test(expr) &&
            !keys.includes('arguments')
        ) {
            expr = 'var arguments = undefined;' + expr;
        }

        // Remove last semi so `return` will be inserted before
        //  the previous one instead, allowing for the return
        //  of a bare ending expression
        expr = expr.replace(/;\s*$/u, '');

        // Insert `return`
        const lastStatementEnd = expr.lastIndexOf(';');
        const code = (lastStatementEnd > -1
            ? expr.slice(0, lastStatementEnd + 1) +
                ' return ' + expr.slice(lastStatementEnd + 1)
            : ' return ' + expr);

        // eslint-disable-next-line no-new-func
        return (new Function(...keys, code))(...values);
    }
}

JSONPath.prototype.vm = {
    Script
};

JSONPath.prototype.safeVm = {
    Script: SafeScript
};

export {JSONPath};
