# NuclearJS

One-way, immutable state modelling.

**Example: Modeling the state of a shopping cart**

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

## API Documentation

**Nuclear.Reactor(config: object)**
Returns a `Reactor` instance for the specified config.

Config Schema:

**config.state** - a mapping of state key paths to either a ReactiveState or Computed instance
```js
{
  items: itemList, // of type ReactiveState
  subtotal: subtotalComputed // of type Computed

  // the state map can be arbitraliy deep
  users: {
    active: activeUsers
  }
}
```

**Getting state value**

```js
var reactor = Nuclear.Reactor({
  state: {
    users: {
      active: activeUsers
    }
  }
})
var activeUsers = reactor.get('users.active')
// or
var activeUsers = reactor.get(['users', 'active'])
```

**config.actions** - a mapping of action names => actions

```js
var reactor = Nuclear.Reactor({
  state: {
    users: {
      active: activeUsers
    }
  },

  actions: {
    user: {
      addUser: function(reactor, user) {
        reactor.dispatch('addUser', user)
      }
    }
  }
})
```

Actions are simply objects of functions that are passed a reactor instance as the
first argument.  Actions are used as semantic methods for doing some write or state
change to the system.

#### TL;DR

- **Flux-like** - One-way data flow, state can only be read, and actions are the only things
that are allowed to change the state of the system

- **Self-managing state** - State objects (**cores**) react to messages passed to them, they are the only ones
that know how to react to that message.  Cores do not know about any

- **UI Agnostic** - Completely abstract all business logic and state into **Cores** and **Actions**.  This makes
the UI layer simply a representation of the state and binds UI events to Nuclear Actions


#### The following prinicples drive its development

- **Immutability** - A means for safety, predictability and performance.

- **Implement functionally** - This reduces state, improves testability and allows composability.

- **Keep state minimal** - build a framework that encourages state of an application to be represented
in the simplest form possible.  Use computeds to transform pure state into something consummable by the
UI layer

- **UI Interchangable** - NuclearJS should compliment, not replace existing UI frameworks as a way to model state.

**more documentation coming soon**
