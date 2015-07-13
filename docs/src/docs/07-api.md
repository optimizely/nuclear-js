---
title: "API"
section: "Guide"
---

# API Documentation

## Reactor

### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered Stores. This process is done synchronously, all registered `Store`s are passed this message and all components are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

### `Reactor#evaluate(Getter | KeyPath)`

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

### `Reactor#evaluateToJS(...keyPath, [transformFn])`

Same as `evaluate` but coerces the value to a plain JS before returning

### `Reactor#observe(keyPathOrGetter, handlerFn)`

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

### `Reactor#registerStores(stores)`

`stores` - an object of storeId => store instance

```javascript
reactor.registerStores({
  'threads': require('./stores/thread-store'),
  'currentThreadID': require('./stores/current-thread-id-store'),
})
```

### `Reactor#reset()`

Causes all stores to be reset to their initial state.  Extremely useful for testing, just put a `reactor.reset()` call in your `afterEach` blocks.

### `Reactor#ReactMixin`

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

## Constructors

### `Nuclear.Reactor`

```javascript
var reactor = new Nuclear.Reactor(config)
```

**Configuration Options**

`config.debug` Boolean - if true it will log the entire app state for every dispatch.

### `Nuclear.Store`

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

## Utilities

NuclearJS comes with several utility functions that are exposed on the `Nuclear` variable.

### `Nuclear.Immutable`

Provides access to the ImmutableJS `Immutable` object.

### `Nuclear.toImmutable(value)`

Coerces a value to its immutable counterpart, can be called on any type safely.  It will convert Objects to `Immutable.Map` and Arrays to `Immutable.List`

### `Nuclear.toJS(value)`

Will coerce an Immutable value to its mutable counterpart.  Can be called on non-immutable values safely.

### `Nuclear.isImmutable(value)` : Boolean

Returns true if the value is an ImmutableJS data structure.

### `Nuclear.isKeyPath(value)` : Boolean

Returns true if the value is the format of a valid keyPath

### `Nuclear.isGetter(value)` : Boolean

Returns true if the value is the format of a valid getter
