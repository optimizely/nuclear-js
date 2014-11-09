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

#### Nuclear.Reactor(config: object) : Reactor

Reactors models your application state in NuclearJS.  Reactors utilize message passing to update state.

**initialize(initialState : Immutable.Map?) : void**

Initializes a Reactor by either loading the `initialState` passed in or generating initial state from the registered `ReactiveState`.  

**dispatch(messageType : string, payload : any) : void**

Dispatches a message to all registered ReactiveState. Dispatches happen syncronously, and once it is done the Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

**get(keyPath : string|array) : any**

Gets a read-only value for some keyPath in the reactor state. Returns `undefined` if a keyPath doesnt have a value.

ex: `reactor.get('users.active')` or `reactor.get(['users', 'active'])`

**actions(groupName : string) : any**

Returns an action group that was registered on `groupName`

ex: `reactor.actions('users').createUser({ name: 'jordan' })`


#### Nuclear.ReactiveState(config: object) : ReactiveState

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

ReactiveState is the basic building block of state modelling in NuclearJS.  All state should be described as ReactiveState.

**getInitialState() : any**

Use this function to declare what the structure of the initial state should be.  This should be a pure function, referencing no ouside values or making any sort of AJAX calls.  A Nuclear.Reactor will coerce the return value of `getInitialState` into an ImmutableJS data structure.

**initialize() : void**

Function is called when during `Reactor.initialize()`, it sets up all of the message listeners and any computed state.

The following functions can be used within `initialize` 

`this.on(messageType : string, handler(state : any, payload: any) : function)` - Adds a message handler for a specific `messageType`.  There can only be one handler per message type per ReactiveState.

`this.computed(keyPath : string, deps : array, computeFn : function)` - Sets up a computed value that whose dependencies are 
relative keyPaths to the ReactiveState.  Any time any dependency value changes after a dispatch the computed is re-evaluated.

#### Nuclear.Computed(deps : array, computeFn : function) : Computed

Defines a computed unit, where the `deps` are an array of keyPaths on a Nuclear.Reactor or other Nuclear.Computed instances (that's right Computeds can be composed of other Computeds).

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
  

#### Connecting all the pieces

```js
var reactor = Nuclear.Reactor({
  state: {
    items: itemList, // of type ReactiveState
    subtotal: subtotal,
    total: total
  },
  actions: {
    items: {
      addItem: function(reactor, item) {
        reactor.dispatch('addItem', item)
      }
    }
  }
})

// invoking actions
reactor.actions('items').addItem({ name: 'banana', price: 1 })
```





#### The following prinicples drive its development

- **Immutability** - A means for safety, predictability and performance.

- **Implement functionally** - This reduces state, improves testability and allows composability.

- **Keep state minimal** - build a framework that encourages state of an application to be represented
in the simplest form possible.  Use computeds to transform pure state into something consummable by the
UI layer

- **UI Interchangable** - NuclearJS should compliment, not replace existing UI frameworks as a way to model state.


