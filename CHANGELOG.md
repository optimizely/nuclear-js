## 1.0.2

- **deprecated** `reactor.registerStore` will be deprecated in 1.1.x - use `reactor.registerStores` instead.  Add deprecation warning.
- **fixed** properly observe getters when passing `silent=true` for `registerStores` - this option no longer makes sense as it makes future observations unreliable.
- **fixed** support `Utils.isFunction` in all browsers (#57)

## 1.0.1

- **added** Expose createReactMixin functionality on Nuclear singleton
- **fixed** Fix new Store() from throwing error when not passed a config object

## 1.0.0
- **Huge optimizations for `Reactor.evaluate` and `Reactor.observe`** - These values are now very efficiently memoized by leveraging that fact that getters are pure functions and are transforming immutable data.  This means that complex transformations wont be reevaluated unless its direct dependencies or underlying state change.
- **Built in support for React** - No need for the NuclearReactMixin, simply use `reactor.ReactMixin`
- **breaking** `Reactor.get( ...getters, transformFn )` -> `Reactor.evaluate( getter )`
- **breaking** `Reactor.getJS( ...getters, transformFn )` -> `Reactor.evaluateToJS( getter )`
- **breaking** keypaths must always be arrays, no more support for 'foo.bar' style keypaths
- **breaking** Getters are no longer a constructor, instead they are plain arrays of the form:
