export type AssignmentExpression = any;
export type Substitution = any;
export type AnyParameter = any;
export type Substitutions = Record<string, Substitution>;
export type OperatorTable = Record<string, (a: AnyParameter, b: AnyParameter) => UnknownResult>;
export type UnaryOperatorTable = {
    [key: string]: (a: AnyParameter) => UnknownResult;
};
/**
 * A replacement for NodeJS' VM.Script which is also {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP | Content Security Policy} friendly.
 */
export class SafeScript {
    /**
     * @param {string} expr Expression to evaluate
     */
    constructor(expr: string);
    code: string;
    ast: unknown;
    /**
     * @param {object} context Object whose items will be added
     *   to evaluation
     * @returns {EvaluatedResult} Result of evaluated code
     */
    runInNewContext(context: object): EvaluatedResult;
}
/**
 * Guarded `obj[prop]`, applying the same restrictions as a MemberExpression.
 * @param {UnknownResult} obj
 * @param {string} prop
 * @returns {UnknownResult}
 */
export function getSafeProperty(obj: UnknownResult, prop: string): UnknownResult;
import type { UnknownResult } from './jsonpath.js';
import type { EvaluatedResult } from './jsonpath.js';
