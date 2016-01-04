---
title: "API"
section: "Guide"
---

# API Documentation

### Reactor

#### Constructor

#### `Nuclear.Reactor`

```javascript
var reactor = new Nuclear.Reactor(config)
// or
var reactor = Nuclear.Reactor(config)
```

**Configuration Options**

`config.debug` Boolean - if true it will enabled logging for dispatches and throw Errors in various circumstances described below.

**config.options** (added in 1.3)

If `config.debug` is true then all of the options below will be enabled.

`logDispatches` (default=`false`) console.logs for every action. If disabled `logAppState` and `logDirtyStores` will be ignored, as no dispatch logging is occurring.

`logAppState` (default=`false`) console.logs a snapshot of the entire app state after every dispatch.  Disabling this can improve performance.

`logDirtyStores` (default=`false`) console.logs what stores have changed after each dispatched action.

`throwOnUndefinedActionType` (default=`false`) if true, throws an Error when dispatch is called with an undefined action type.

`throwOnUndefinedStoreReturnValue` (default=`false`) if true, throws an Error if a store handler or `getInitialState()` ever returns `undefined`.

`throwOnNonImmutableStore` (default=`false`) if true, throws an Error if a store returns a non-immutable value. Javascript primitive such as `String`, `Boolean` and `Number` count as immutable.

`throwOnDispatchInDispatch` (default=`false`) if true, throws an Error if a dispatch occurs in a change observer.

**Example**

```javascript
var reactor = new Nuclear.Reactor({
  debug: true,
  options: {
    // do not log entire app state
    logAppState: false,
    // allow dispatch in dispatch
    throwOnDispatchInDispatch: false,
  },
})
```


#### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered Stores. This process is done synchronously, all registered `Store`s are passed this message and all components are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

```javascript
reactor.dispatch('addUser', { name: 'jordan' })
```

#### `Reactor#evaluate(Getter | KeyPath)`

Returns the immutable value for some KeyPath or Getter in the reactor state. Returns `undefined` if a keyPath doesn't have a value.

```javascript
reactor.evaluate(['users', 'active'])
reactor.evaluate([
  ['users', 'active'],
  ['filters', 'username'],
  /**
   * @param {Immutable.List} activeUsers
   * @param {String} usernameFilter
   * @return {Immutable.List}
   */
  function(activeUsers, usernameFilter) {
    return activeUsers.filter(function(user) {
      return user.get('username').indexOf(usernameFilter) !== -1
    }
  },
])
```

#### `Reactor#evaluateToJS(...keyPath, [transformFn])`

Same as `evaluate` but coerces the value to a plain JS before returning.

#### `Reactor#observe(keyPathOrGetter, handlerFn)`

Takes a getter or keyPath and calls the handlerFn with the evaluated value whenever the getter or keyPath changes.

**Note**:  You cannot call `flux.dispatch` within the handle function of a `flux.observe`.  This violates one of the fundamental design patterns in Flux architecture, which forbids cascading dispatches on the system which cause highly unpredictive systems.

```javascript
reactor.observe([
  ['items']
  function(items) {
    console.log('items changed');
  }
])
```

#### `Reactor#batch(fn)`

_added in 1.1_

Allows multiple dispatches within the `fn` function before notifying any observers.

```javascript
reactor.batch(function() {
  reactor.dispatch('addUser', { name: 'jordan' })
  reactor.dispatch('addUser', { name: 'james' })
})

// does a single notify to all observers
```

#### `Reactor#batchStart()`

_added in 1.2_

Sets the reactor in batch mode, where dispatches don't cause observer notification until `batchEnd()` is called.

```javascript
// the following is equivalent to the `reactor.batch` example
reactor.batchStart()
reactor.dispatch('addUser', { name: 'jordan' })
reactor.dispatch('addUser', { name: 'james' })
reactor.batchEnd()
```

#### `Reactor#batchEnd()`

_added in 1.2_

Signifies the end of reactor batching and will notify all observers of the changes that happened since `batchStart`

#### `Reactor#serialize()`

_added in 1.1_

Returns a plain JavaScript object representing the application state.  By default this maps over all stores and returns `toJS(storeState)`.

```javascript
reactor.loadState(reactor.serialize())
```

#### `Reactor#loadState( state )`

_added in 1.1_

Takes a plain JavaScript object and merges into the reactor state, using `store.deserialize`

This can be useful if you need to load data already on the page.

```javascript
reactor.loadState({
  stringStore: 'bar',
  listStore: [4,5,6],
})
```

#### `Reactor#registerStores(stores)`

`stores` - an object of storeId => store instance

```javascript
reactor.registerStores({
  'threads': require('./stores/thread-store'),
  'currentThreadID': require('./stores/current-thread-id-store'),
})
```

#### `Reactor#replaceStores(stores)`

`stores` - an object of storeId => store instance

Replace the implementation only of specified stores without resetting to their initial state.  This is useful when doing store hot reloading.

```javascript
reactor.replaceStores({
  'threads': require('./stores/thread-store'),
  'currentThreadID': require('./stores/current-thread-id-store'),
})
```

#### `Reactor#reset()`

Causes all stores to be reset to their initial state.  Extremely useful for testing, just put a `reactor.reset()` call in your `afterEach` blocks.

#### `Reactor#ReactMixin`

Exposes the ReactMixin to do automatic data binding.

```javascript
var ThreadSection = React.createClass({
  mixins: [flux.ReactMixin],

  getDataBindings() {
    return {
      threads: Chat.getters.threads,
      unreadCount: Chat.getters.unreadCount,
      currentThreadID: Chat.getters.currentThreadID,
    }
  },

  render: function() {
    var threadListItems = this.state.threads.map(thread => {
      return (
        <ThreadListItem
          key={thread.get('threadID')}
          thread={thread}
          currentThreadID={this.state.currentThreadID}
        />
      );
    }, this);
    var unread =
      this.state.unreadCount === 0 ?
      null :
      <span>Unread threads: {this.state.unreadCount}</span>;
    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems}
        </ul>
      </div>
    );
  },
});
```

### Store

#### Constructor

```javascript
module.exports = new Nuclear.Store({
  getInitialState: function() {
    // method must return an immutable value for NuclearJS to take advantage of efficient equality checks
    return toImmutable({})
  },

  initialize: function() {
    // sets up action handlers via `this.on`
    this.on('SOME_ACTION', function(state, payload) {
      // action handler takes state + payload and returns new state
    })
  },
})
```

#### `Store#getInitialState`

Defines the starting state for a store.  Must return an immutable value.  By default it returns an `Immutable.Map`

#### `Store#initialize`

Responsible for setting up action handlers for the store using `this.on(actionTypes, handlerFn)`

#### `Store#serialize`

_added in 1.1_

Serialization method for the store's data, by default its implemented as `Nuclear.toJS' which converts ImmutableJS objects to plain JavaScript.
This is overridable for your specific data needs.

```javascript
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

_added in 1.1_

Serialization method for the store's data, by default its implemented as `Nuclear.toImmutable' which converts plain JavaScript objects to ImmutableJS data structures.
This is overridable for your specific data needs.

```javascript
// deserializing an array of arrays [[1, 'one'], [2, 'two']] to an Immutable.Map
Nuclear.Store({
  // ...
  deserialize(state) {
    return Immutable.Map(state)
  },
  // ...
})
```

### Utilities

NuclearJS comes with several utility functions that are exposed on the `Nuclear` variable.

#### `Nuclear.Immutable`

Provides access to the ImmutableJS `Immutable` object.

#### `Nuclear.toImmutable(value)`

Coerces a value to its immutable counterpart, can be called on any type safely.  It will convert Objects to `Immutable.Map` and Arrays to `Immutable.List`.

#### `Nuclear.toJS(value)`

Will coerce an Immutable value to its mutable counterpart.  Can be called on non-immutable values safely.

#### `Nuclear.isImmutable(value)` : Boolean

Returns true if the value is an ImmutableJS data structure.

#### `Nuclear.isKeyPath(value)` : Boolean

Returns true if the value is the format of a valid keyPath.

#### `Nuclear.isGetter(value)` : Boolean

Returns true if the value is the format of a valid getter.
