# JSONPath changes

## Jan 10, 2016
- Add `@scalar()` type operator (in JavaScript mode, will also include)
- Version 0.14.0

## Jan 5, 2016
- Avoid double-encoding path in results
- Version 0.13.1

## Dec 13, 2015
- Breaking change (from version 0.11): Silently strip `~` and `^` operators and type operators such as `@string()` in `JSONPath.toPathString()` calls.
- Breaking change: Remove `Array.isArray` polyfill as no longer supporting IE <= 8
- Feature: Allow omission of options first argument to `JSONPath`
- Feature: Add `JSONPath.toPointer()` and "pointer" `resultType` option.
- Fix: Correctly support `callback` and `otherTypeCallback` as numbered arguments to `JSONPath`.
- Fix: Enhance Node checking to avoid issue reported with angular-mock
- Fix: Allow for `@` or other special characters in at-sign-prefixed property names (by use of `[?(@['...'])]` or  `[(@['...'])]`).
- Version 0.13.0

## Dec 12, 2015 10:39pm
- Breaking change: Problems with upper-case letters in npm is causing us to rename the package, so have renamed package to "jsonpath-plus" (there are already package with lower-case "jsonpath" or "json-path"). The new name also reflects that
there have been changes to the original spec.
- Version 0.12.0

## Dec 12, 2015 10:36pm
- Actually add the warning in the README that problems in npm with upper-case letters is causing us to rename to "jsonpath-plus" (next version will actually apply the change).
- Version 0.11.2

## Dec 12, 2015 10:11pm
- Give warning in README that problems in npm with upper-case letters is causing us to rename to "jsonpath-plus" (next version will actually apply the change).
- Version 0.11.1

## Dec 12, 2015
- Breaking change: For unwrapped results, return `undefined` instead of `false` upon failure to find path (to allow distinguishing of `undefined`--a non-allowed JSON value--from the valid JSON values, `null` or `false`) and return the exact value upon falsy single results (in order to allow return of `null`)
- Deprecated: Use of `jsonPath.eval()`; use new class-based API instead
- Feature: AMD export
- Feature: By using `self` instead of `window` export, allow JSONPath to be trivially imported into web workers, without breaking compatibility in normal scenarios. See [MDN on self](https://developer.mozilla.org/en-US/docs/Web/API/Window/self)
- Feature: Offer new class-based API and object-based arguments (with option to run new queries via `evaluate()` method without resupplying config)
- Feature: Allow new `preventEval=true` and `autostart=false` option
- Feature: Allow new callback option to allow a callback function to execute as each final result node is obtained
- Feature: Allow type operators: JavaScript types (`@boolean()`, `@number()`, `@string()`), other fundamental JavaScript types (`@null()`, `@object()`, `@array()`), the JSONSchema-added type, `@integer()`, and the following non-JSON types that can nevertheless be used with JSONPath when querying non-JSON JavaScript objects (`@undefined()`, `@function()`, `@nonFinite()`). Finally, `@other()` is made available in conjunction with a new callback option, `otherTypeCallback`, can be used to allow user-defined type detection (at least until JSON Schema awareness may be provided).
- Feature: Support "parent" and "parentProperty" for resultType along with "all" (which also includes "path" and "value" together)
- Feature: Support custom `@parent`, `@parentProperty`, `@property` (in addition to custom property `@path`) inside evaluations
- Feature: Support a custom operator (`~`) to allow grabbing of property names
- Feature: Support `$` for retrieval of root, and document this as well as `$..` behavior
- Feature: Expose cache on `JSONPath.cache` for those who wish to preserve and reuse it
- Feature: Expose class methods `toPathString` for converting a path as array into a (normalized) path as string and `toPathArray` for the reverse (though accepting unnormalized strings as well as normalized)
- Fix: Allow `^` as property name
- Fix: Support `.` within properties
- Fix: `@path` in index/property evaluations
- Version 0.11

## Oct 23, 2013

- Support for parent selection via `^`
- Access current path via `@path` in test statements
- Allowing for multi-statement evals
- Performance improvements
- Version 0.10

## Mar 28, 2012

- Support a sandbox arg to eval
- Use vm.runInNewContext in place of eval
- Version 0.9.0
