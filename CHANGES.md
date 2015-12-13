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
