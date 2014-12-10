## Dec 9, 2014
* Offer new class-based API and object-based arguments (with option to run new queries without resupplying config)
* Fix bug preventing an unwrapped null from being returned
* For unwrapped results, return undefined instead of false upon failure to find path (since undefined is not a possible JSON value) and return the exact value upon falsy single results (in order to allow return of null)
* Support "all" for resultType ("path" and "value" together)
* Support "." within properties
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
