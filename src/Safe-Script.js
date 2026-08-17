/* eslint-disable unicorn/no-top-level-side-effects -- Temporary? */
/* eslint-disable no-bitwise -- Convenient */
import jsep from 'jsep';
import jsepRegex from '@jsep-plugin/regex';
import jsepAssignment from '@jsep-plugin/assignment';

/**
 * @import {EvaluatedResult, UnknownResult} from './jsonpath.js';
 */

/**
 * @typedef {any} AssignmentExpression
 */

/**
 * @typedef {any} Substitution
 */

/**
 * @typedef {any} AnyParameter
 */

/**
 * @typedef {Record<string, Substitution>} Substitutions
 */

// register plugins
jsep.plugins.register(jsepRegex, jsepAssignment);
jsep.addUnaryOp('typeof');
jsep.addUnaryOp('void');
jsep.addLiteral('null', null);
jsep.addLiteral('undefined', undefined);

const BLOCKED_PROTO_PROPERTIES = new Set([
    'constructor',
    '__proto__',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__'
]);

const SafeEval = {
    /**
     * @param {jsep.Expression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalAst (ast, subs) {
        switch (ast.type) {
        case 'BinaryExpression':
        case 'LogicalExpression':
            return SafeEval.evalBinaryExpression(
                /** @type {jsep.BinaryExpression} */ (ast),
                subs
            );
        case 'Compound':
            return SafeEval.evalCompound(
                /** @type {jsep.Compound} */ (ast),
                subs
            );
        case 'ConditionalExpression':
            return SafeEval.evalConditionalExpression(
                /** @type {jsep.ConditionalExpression} */ (ast),
                subs
            );
        case 'Identifier':
            return SafeEval.evalIdentifier(
                /** @type {jsep.Identifier} */ (ast),
                subs
            );
        case 'Literal':
            return SafeEval.evalLiteral(/** @type {jsep.Literal} */ (ast));
        case 'MemberExpression':
            return SafeEval.evalMemberExpression(
                /** @type {jsep.MemberExpression} */ (ast),
                subs
            );
        case 'UnaryExpression':
            return SafeEval.evalUnaryExpression(
                /** @type {jsep.UnaryExpression} */ (ast),
                subs
            );
        case 'ArrayExpression':
            return SafeEval.evalArrayExpression(
                /** @type {jsep.ArrayExpression} */ (ast),
                subs
            );
        case 'CallExpression':
            return SafeEval.evalCallExpression(
                /** @type {jsep.CallExpression} */ (ast),
                subs
            );
        case 'AssignmentExpression':
            return SafeEval.evalAssignmentExpression(
                /** @type {AssignmentExpression} */ (ast),
                subs
            );
        default:
            throw new SyntaxError('Unexpected expression', {
                cause: ast
            });
        }
    },

    /**
     * @param {jsep.BinaryExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalBinaryExpression (ast, subs) {
        /**
         * @typedef {{
         *   [key: string]: (a: AnyParameter, b: AnyParameter) => UnknownResult
         * }} OperatorTable
         */
        const result = /** @type {OperatorTable} */ ({
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
        })[ast.operator](
            SafeEval.evalAst(ast.left, subs),
            () => SafeEval.evalAst(ast.right, subs)
        );
        return result;
    },

    /**
     * @param {jsep.Compound} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalCompound (ast, subs) {
        let last;
        for (let i = 0; i < ast.body.length; i++) {
            if (
                ast.body[i].type === 'Identifier' &&
                ['var', 'let', 'const'].includes(
                    /** @type {jsep.Identifier} */
                    (ast.body[i]).name
                ) &&
                Object.hasOwn(ast.body, i + 1) &&
                ast.body[i + 1].type === 'AssignmentExpression'
            ) {
                // var x=2; is detected as
                // [{Identifier var}, {AssignmentExpression x=2}]
                i += 1;
            }
            const expr = ast.body[i];
            last = SafeEval.evalAst(expr, subs);
        }
        return last;
    },

    /**
     * @param {jsep.ConditionalExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalConditionalExpression (ast, subs) {
        if (SafeEval.evalAst(ast.test, subs)) {
            return SafeEval.evalAst(ast.consequent, subs);
        }
        return SafeEval.evalAst(ast.alternate, subs);
    },

    /**
     * @param {jsep.Identifier} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalIdentifier (ast, subs) {
        if (Object.hasOwn(subs, ast.name)) {
            return subs[ast.name];
        }
        throw new ReferenceError(`${ast.name} is not defined`);
    },

    /**
     * @param {jsep.Literal} ast
     * @returns {UnknownResult}
     */
    evalLiteral (ast) {
        return ast.value;
    },

    /**
     * @param {jsep.MemberExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalMemberExpression (ast, subs) {
        const prop = String(
            // NOTE: `String(value)` throws error when
            // value has overwritten the toString method to return non-string
            // i.e. `value = {toString: () => []}`
            ast.computed
                ? SafeEval.evalAst(ast.property, subs) // `object[property]`
                : ast.property.name // `object.property` property is Identifier
        );
        const obj = SafeEval.evalAst(ast.object, subs);
        if (obj === undefined || obj === null) {
            throw new TypeError(
                `Cannot read properties of ${obj} (reading '${prop}')`
            );
        }
        if (!Object.hasOwn(obj, prop) && BLOCKED_PROTO_PROPERTIES.has(prop)) {
            throw new TypeError(
                `Cannot read properties of ${obj} (reading '${prop}')`
            );
        }
        const result = /** @type {Record<string, UnknownResult>} */ (obj)[prop];
        if (typeof result === 'function' && result !== Function) {
            return result.bind(obj); // arrow functions aren't affected by bind.
        }
        return result;
    },

    /**
     * @param {jsep.UnaryExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalUnaryExpression (ast, subs) {
        /**
         * @typedef {{
         *   [key: string]: (a: AnyParameter) => UnknownResult
         * }} UnaryOperatorTable
         */
        const result = /** @type {UnaryOperatorTable} */ ({
            '-': (a) => -(/** @type {EvaluatedResult} */ (
                SafeEval.evalAst(a, subs))
            ),
            '!': (a) => !SafeEval.evalAst(a, subs),
            '~': (a) => ~(/** @type {EvaluatedResult} */ (
                SafeEval.evalAst(a, subs))
            ),
            // eslint-disable-next-line no-implicit-coercion -- API
            '+': (a) => +(/** @type {EvaluatedResult} */ (
                SafeEval.evalAst(a, subs))
            ),
            typeof: (a) => typeof SafeEval.evalAst(a, subs),
            // eslint-disable-next-line no-void -- Ok
            void: (a) => void SafeEval.evalAst(a, subs)
        })[ast.operator](ast.argument);
        return result;
    },

    /**
     * @param {jsep.ArrayExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalArrayExpression (ast, subs) {
        return ast.elements.map((el) => SafeEval.evalAst(
            /** @type {jsep.Expression} */
            (el),
            subs
        ));
    },

    /**
     * @param {jsep.CallExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalCallExpression (ast, subs) {
        const args = ast.arguments.map((arg) => SafeEval.evalAst(arg, subs));
        const func = SafeEval.evalAst(ast.callee, subs);
        if (func === Function) {
            throw new Error('Function constructor is disabled');
        }
        return (/** @type {(...args: AnyParameter[]) => UnknownResult} */ (
            func
        ))(...args);
    },

    /**
     * @param {AssignmentExpression} ast
     * @param {Substitutions} subs
     * @returns {UnknownResult}
     */
    evalAssignmentExpression (ast, subs) {
        if (ast.left.type !== 'Identifier') {
            throw new SyntaxError('Invalid left-hand side in assignment');
        }
        const id = /** @type {jsep.Identifier} */ (
            ast.left
        ).name;
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
    constructor (expr) {
        this.code = expr;
        this.ast = /** @type {unknown} */ (jsep(this.code));
    }

    /**
     * @param {object} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext (context) {
        // `Object.create(null)` creates a prototypeless object
        const keyMap = Object.assign(Object.create(null), context);
        return SafeEval.evalAst(
            /** @type {jsep.Expression} */ (this.ast),
            keyMap
        );
    }
}

export {SafeScript};
