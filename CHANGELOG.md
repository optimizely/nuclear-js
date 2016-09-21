## 1.4.0 (September 21, 2015)


- **[NEW]** Added ability to switch out the default caching strategy for caching getter values. Also expose an LRU cache that can be swapped in for the basic cache
- **[NEW]** Add ability to supply your own logger and override the default console group logger in NuclearJS
- **[UPGRADE]** Upgrade `immutable` to `3.8.1`


### Cache Configuration

```
import * as Nuclear from 'nuclear-js';

const MAX_ITEMS = 1000 // (optional, default = 1000) how many items to keep in the LRU cache before evicting
const EVICT_COUNT = 10 // (optional, default = 1) how many items to throw out when the cache fills up

new Nuclear.Reactor({
  debug: false,
  cache: new Nuclear.LRUCache(MAX_ITEMS, EVICT_COUNT),
});
```

### Using your own Logger

```
import * as Nuclear from 'nuclear-js';

new Nuclear.Reactor({
  logger: {
    dispatchStart(reactorState, actionType, payload) {
      console.log(`dispatch: actionType=${actionTypes}`, payload)
    },
    dispatchError(reactorState, error) {
      // useful if you need to close a console.group if an error is thrown during dispatch
    },
    dispatchEnd(reactorState, state, dirtyStores, previousState) {
      const prevStateChanges = previousState.filter((val, key) => dirtyStores.contains(key)).toJS()
      const stateChanges = state.filter((val, key) => dirtyStores.contains(key)).toJS()

      console.log('prev state: ', prevStateChanges)
      console.log('new state: ', stateChanges)
    },
  },
});
```


## 1.3.0 (December 31, 2015)

- **[NEW]** Store hot-reloading via `reactor.replaceStores(stores)` which replaces the implementation of a store without resetting its underlying state value.  See [hot reloading example](https://github.com/optimizely/nuclear-js/tree/master/examples/hot-reloading).
- **[NEW]** Support for more granular options for logging and triggering invariants in the NuclearJS runtime.  See [API Docs](https://github.com/optimizely/nuclear-js/blob/master/docs/src/docs/07-api.md) for details.

## 1.2.1 (November 5, 2015)

- **[FIXED]** Observers of the entire app state not triggering on actions from a late registered store

## 1.2.0 (November 1, 2015)

- **[NEW]** Exposed new API methods: `batchStart` and `batchStop`.
- **[NEW]** Changed the transpiler to Babel.
- **[FIXED]** Completely refactored `Reactor`, `Evaluator` and `ChangeObserver`.
- **[FIXED]** Fixed all issues related to hash code collisions.
- **[FIXED]** Refactored how change observation works to be much more efficient.

## 1.1.2 (October 5, 2015)

- **[FIXED]** Fix for observer iteration when removed during notify. [Issue #151](https://github.com/optimizely/nuclear-js/issues/151)

## 1.1.1 (July 26, 2015)

- **[ADDED]** Bowser support via bower.json

## 1.1.0 (July 23, 2015)

- **[NEW]** added `Reactor#serialize`, `Reactor#loadState`, `Store#serialize` and `Store#deserialize` methods
- **[NEW]** added `Reactor#batch` to allow batch dispatches before notify observers
- **[NEW]** throw error when trying to dispatch within a dispatch
- **[FIXED]** fix Evaluator locking if getter evaluation errors

### API Additions

#### `Reactor#serialize()`

Returns a plain JavaScript object representing the application state.  By default this maps over all stores and returns `toJS(storeState)`.

```js
reactor.loadState(reactor.serialize())
```

#### `Reactor#loadState( state )`

Takes a plain JavaScript object and merges into the reactor state, using `store.deserialize`

This can be useful if you need to load data already on the page.

```js
reactor.loadState({
  stringStore: 'bar',
  listStore: [4,5,6],
})
```

#### `Store#serialize`

Serialization method for the store's data, by default its implemented as `Nuclear.toJS' which converts ImmutableJS objects to plain JavaScript.
This is overridable for your specific data needs.

```js
// serializing an Immutable map while preserving numerical keys
Nuclear.Store({
  // ...
  serialize(state) {
    if (!state) {
      return state;
    }
    return state.entrySeq().toJS()
  },
  // ...
})
```

#### `Store#deserialize`

Serialization method for the store's data, by default its implemented as `Nuclear.toImmutable' which converts plain JavaScript objects to ImmutableJS data structures.
This is overridable for your specific data needs.

```js
// deserializing an array of arrays [[1, 'one'], [2, 'two']] to an Immutable.Map
Nuclear.Store({
  // ...
  deserialize(state) {
    return Immutable.Map(state)
  },
  // ...
})
```

## 1.0.5 (June 4, 2015)

- **[NEW]** Configured linting using [eslint](http://eslint.org/). Linting is now part of the [contributing process](https://github.com/optimizely/nuclear-js/blob/master/CONTRIBUTING.md). Eslint can be run using: `grunt eslint`
- **[NEW]** Implemented new developer docs landing page. This website is still in beta. You can view it here: https://optimizely.github.io/nuclear-js/
- **[FIXED]** Removed accidentally checked in node_modules directory.
- **[FIXED]** Addressed all the lint warnings and errors in the codebase using the new rules in `.eslintrc`
- **[FIXED]** Updated documentation.

## 1.0.2 (May 14, 2015)

- **[DEPRECATED]** `reactor.registerStore` will be deprecated in 1.1.x - use `reactor.registerStores` instead.  Added deprecation warning.
- **[FIXED]** Now properly observing getters when passing `silent=true` for `registerStores` - this option no longer makes sense as it makes future observations unreliable.
- **[FIXED]** Support `Utils.isFunction` in all browsers. [#57](https://github.com/optimizely/nuclear-js/pull/57)
- **[FIXED]** Evaluator now doesn't evaluate getter args twice when there is a stale value.

## 1.0.1 (April 27, 2015)

- **[NEW]** Expose `createReactMixin` functionality on NuclearJS singleton.
- **[FIXED]** Fix `new Store()` from throwing error when not passed a config object.

## 1.0.0 (April 25, 2015)

- **[NEW]** Built in support for React. No need for the `NuclearReactMixin`, simply use `reactor.ReactMixin`
- **[BREAKING]** `Reactor.get( ...getters, transformFn )` -> `Reactor.evaluate( getter )`
- **[BREAKING]** `Reactor.getJS( ...getters, transformFn )` -> `Reactor.evaluateToJS( getter )`
- **[BREAKING]** Keypaths must always be arrays, no more support for 'foo.bar' style keypaths.
- **[BREAKING]** Getters are no longer a constructor, instead they are plain arrays.
- **[FIXED]** Huge optimizations for `Reactor.evaluate` and `Reactor.observe` - These values are now very efficiently memoized by leveraging that fact that getters are pure functions and are transforming immutable data. This means that complex transformations won't be reevaluated unless its direct dependencies or underlying state change.
