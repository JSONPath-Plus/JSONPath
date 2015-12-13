## Dec 12, 2014
* Breaking change: For unwrapped results, return undefined instead of false upon failure to find path (to allow distinguishing of undefined--a non-allowed JSON value--from the valid JSON, null or false) and return the exact value upon falsy single results (in order to allow return of null)
* Offer new class-based API and object-based arguments (with option to run new queries via evaluate() method without resupplying config)
* Allow new preventEval=true and autostart=false option
* Allow new callback option to allow a callback function to execute as each final result node is obtained
* Support "parent" and "parentProperty" for resultType along with "all" (which also includes "path" and "value" together)
* Support "." within properties
* Support custom @parent, @parentProperty, @property (in addition to custom property @path) inside evaluations
* Support a custom operator ("~") to allow grabbing of property names
* Fix for @path in index/property evaluations
* Expose cache on JSONPath.cache for those who wish to preserve and reuse it
* Expose class methods `toPathString` for converting a path as array into a (normalized) path as string and `toPathArray` for the reverse (though accepting unnormalized strings as well as normalized)
* Allow ^ as property name
* Version 0.11

## Oct 23, 2013

* Support for parent selection via `^`
* Access current path via `@path` in test statements
* Allowing for multi-statement evals
* Performance improvements
* Version 0.10

## Mar 28, 2012

* Support a sandbox arg to eval
* Use vm.runInNewContext in place of eval
* Version 0.9.0
