## 1.0.5 (June 4, 2015)

- **[NEW]** Configured linting using [eslint](http://eslint.org/). Linting is now part of the [contributing process](https://github.com/optimizely/nuclear-js/blob/master/CONTRIBUTING.md). Eslint can be run using: `grunt eslint`
- **[NEW]** Implemented new developer docs landing page. This website is still in beta. You can view it here: http://optimizely.github.io/nuclear-js/
- **[FIXED]** Removed accidentally checked in node_modules directory.
- **[FIXED]** Addressed all the lint warnings and errors in the codebase using the new rules in `.eslintrc`
- **[FIXED]** Updated documentation.

## 1.0.2 (May 14, 2015)

- **[DEPRECATED]** `reactor.registerStore` will be deprecated in 1.1.x - use `reactor.registerStores` instead.  Added deprecation warning.
- **[FIXED]** Now properly observing getters when passing `silent=true` for `registerStores` - this option no longer makes sense as it makes future observations unreliable.
- **[FIXED]** Support `Utils.isFunction` in all browsers. [#57](https://github.com/optimizely/nuclear-js/pull/57)
- **[FIXED]** Evaluator now doesn't evaluate getter args twice when there is a stale value.

## 1.0.1 (April 27, 2015)

- **[NEW]** Expose `createReactMixin` functionality on Nuclear singleton.
- **[FIXED]** Fix `new Store()` from throwing error when not passed a config object.

## 1.0.0 (April 25, 2015)

- **[NEW]** Built in support for React. No need for the `NuclearReactMixin`, simply use `reactor.ReactMixin`
- **[BREAKING]** `Reactor.get( ...getters, transformFn )` -> `Reactor.evaluate( getter )`
- **[BREAKING]** `Reactor.getJS( ...getters, transformFn )` -> `Reactor.evaluateToJS( getter )`
- **[BREAKING]** Keypaths must always be arrays, no more support for 'foo.bar' style keypaths.
- **[BREAKING]** Getters are no longer a constructor, instead they are plain arrays.
- **[FIXED]** Huge optimizations for `Reactor.evaluate` and `Reactor.observe` - These values are now very efficiently memoized by leveraging that fact that getters are pure functions and are transforming immutable data. This means that complex transformations won't be reevaluated unless its direct dependencies or underlying state change.
