# NuclearJS

Reactive, immutable state modelling.

## Example: Modeling the state of a shopping cart

Require Library Dependencies

```js
var Immutable = require('immutable')
var Nuclear = require('nuclear-js')
```

Model the state the shopping cart as `ReactiveState`

```js
var itemList = Nuclear.ReactiveState({
  getInitialState: function() {
    return Immutable.List()
  },

  initialize: function() {
    this.on('addItem', function(state, item) {
      // the current state of the itemList is passed
      // to this handler function whenever addItem message
      return state.push(Immutable.Map(item))
    })
  }
})

var taxPercent = Nuclear.ReactiveState({
  getInitialState: function() {
    return 0
  },

  initialize: function() {
    this.on('setTaxPercent', function(state, percent) {
      return percent
    })
  }
})

```

`subtotal`, `tax` and `total` are all computable from `items` and `taxPercent`

```js
var subtotal = Nuclear.Computed(
  // dependencies
  ['items'],
  // this function is called whenever any dependency
  //is updated with the dependency's value
  function(items) {
    return items.reduce(function(total, item) {
      total + item.get('price')
    }, 0)
  }
)

var tax = Nuclear.Computed(
  // computeds can have other computeds as dependencies
  [subtotal, 'taxPercent'],
  function(subtotal, taxPercent) {
    return (subtotal * (taxPercent / 100))
  }
)

var total = Nuclear.Computed(
  [subtotal, tax],
  function(subtotal, tax) {
    return subtotal + tax
  }
)
```

Putting it all together.

```js
var shoppingCart = Nuclear.Reactor({
  // define the system state as a mapping of
  // keys to ReactiveState or Computeds
  state: {
    items: itemList,
    taxPercent: taxPercent,
    subtotal: subtotal,
    tax: tax,
    total: total,
  }
})

shoppingCart.initialize()

shoppingCart.get('total') // 0
shoppingCart.get('items') // Vector []

shoppingCart.dispatch('addItem', {
  name: 'sandwhich',
  price: 10
})

shoppingCart.get('items') // Vector [ Map { name: 'sandwhich' price: 10 }]
shoppingCart.get('subtotal') // 10
shoppingCart.get('tax') // 0
shoppingCart.get('total') // 10

shoppingCart.dispatch('setTaxPercent', 5)

shoppingCart.get('subtotal') // 10
shoppingCart.get('tax') // 0.5
shoppingCart.get('total') // 10.5
```

# API Documentation

## `Nuclear.Reactor(config)`

Reactors model your application state in NuclearJS.  Writes are down via message passing to the `dispatch` function and reads are done via `get(keyPath)`

#### `Reactor#initialize(initialState)`

Initializes a Reactor by either loading the `initialState` passed in or generating initial state from the registered `ReactiveState`.  

#### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered ReactiveState. This process is done syncronously, all registered `ReactiveState` are passed this message and all computeds are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

#### `Reactor#get(keyPath)`

Gets a read-only value for some keyPath in the reactor state. Returns `undefined` if a keyPath doesnt have a value.

ex: `reactor.get('users.active')` or `reactor.get(['users', 'active'])`

#### `Reactor#actions(actionGroup)`

Returns an action group that was registered on `groupName`

ex: `reactor.actions('users').createUser({ name: 'jordan' })`


## `Nuclear.ReactiveState(config)`

```js
var itemList = Nuclear.ReactiveState({
  getInitialState: function() {
    return Immutable.Map({
      items: Immutable.List(),
    })
  },
  
  initialize() {
    this.on('addItem', function(state, item) {
      return state.update('items', function(items) {
        return items.push(item)
      })
    }
    this.computed('active', ['items'], function(items) {
      return items.filter(function(item) {
        return item.get('isActive')
      })
    })
  }
})
```

ReactiveState is the basic building block in NuclearJS.  Anything stateful must be represented as `ReactiveState`

#### `getInitialState()`

Use this function to declare what the structure of the initial state should be.  This should be a pure function, referencing no ouside values or making any sort of AJAX calls.  A Nuclear.Reactor will coerce the return value of `getInitialState` into an ImmutableJS data structure.

#### `initialize()`

Override this function to set up message handlers and computeds.

### The following functions can be used within `initialize`

#### `this.on(messageType, handlerFn)`

Adds a message handler for a specific `messageType`.  There can only be one handler per message type per ReactiveState.  The `handlerFn` is passed three arguments `state` `messagePayload` and `messageType` and must return the new state of the `ReactiveState`

```js
Nuclear.ReactiveState({
  getInitialState: function() {
    return Immutable.List()
  },
  initialize: function() {
    this.on('addItem', function(state, payload, messageType) {
      console.log('handling', messageType)
      // returned state becomes the new app state for this ReactiveState
      return state.push(payload.item)
    })
  }
})
```

#### `this.computed(keyPath, deps, computeFn)`

Sets a computed property at `keyPath` (relative to the ReactiveState).  This computed is re-evaluated anytime any of its `deps` change.  

## `Reactor.Computed(deps, computeFn)`

Defines a computed unit, where the `deps` are an array of keyPaths on a Nuclear.Reactor or other Nuclear.Computed instances (that's right Computeds can be composed of other Computeds). The `computeFn` takes the value of each dependency as arguments.

Computed by themselves are immutable, stateless and simply describe some sort of computed data in your system.  The real power is when you hook them up to a Nuclear.Reactor and compose them togehter.

```js
var subtotal = Nuclear.Computed(
  ['items'],
  function(items) {
    return items.reduce(function(total, item) {
      return total + item.get('price')
    }, 0)
  })
var total = Nuclear.Computed(
  [subtotal, 'taxPercent'],
  function(subtotal, taxPercent) {
    return subtotal + (subtotal * (taxPercent / 100))
  })
```
  

## Design Philosophy

- **Simple over Easy** - The purpose of NuclearJS isn't to write the most expressive TodoMVC anyone's ever seen.  The goal of NuclearJS is to provide a way to model data that is easy to reason and decouple at very large scale.

- **Immutable** - A means for less defensive programming, more predictability and better performance

- **Functional** - The framework should be implemented functionally wherever appropriate.  This reduces incidental complexity and pairs well with Immutability

- **Smallest Amount of State Possible** - Using Nuclear should encourage the modelling of your application state in the most minimal way possible.

- **Decoupled** - A NuclearJS system should be able to function without any sort of UI or frontend.  It should be backend/frontend agnostic and be able to run on a NodeJS server.

## Examples

- [TodoMVC](https://github.com/jordangarcia/todomvc-nuclear-react)
- [Tetris](https://github.com/jordangarcia/tetris)

## Tools / Addons

- [NuclearReactMixin](https://github.com/jordangarcia/nuclear-react-mixin) Keeps React components always in sync with a Nuclear.Reactor.  Uses immutability to call set state only when the data behind a component actually changes (inspired by Om).
