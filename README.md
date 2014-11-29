# NuclearJS

Reactive, immutable state modelling.

## Introduction

NuclearJS is an Immutable implementation of [Flux Architecture](https://github.com/facebook/flux).
Nuclear provides a very decoupled solution to modelling state in a frontend system, leading to much
thinner UI components, easier testability and more predictability.  In fact, when done right, a Nuclear
powered frontend will have **ZERO** state in UI components.

NuclearJS is UI framework agnostic. It pairs well with almost every popular UI framework, since its only 
concern is state modelling and provides a very pleasant and simple to use API.

Currently there is out of the box support for automatic data syncing to React Components with the [NuclearReactMixin](https://github.com/jordangarcia/nuclear-react-mixin)
and VueJS ViewModels with the [NuclearVueMixin](https://github.com/jordangarcia/nuclear-vue-mixin).  Each mixin is quite simple and expect
support for other library in the near future.


## Core Concepts

The easiest way to think about how NuclearJS is modelling the state of your system is to imagine it all as a single map (or Javascript object).  If you are familiar with Om
then the concept of a singular App State is very familiar already.

Each entry in this top level map contains a portion of the entire app state for a specific domain and are managed by **stores**.

Imagine modelling a shopping cart.  Our app state would look like:

```js
{
  items: [
    { name: 'Soap', price: 5, quantity: 2 },
    { name: 'The Adventures of Pluto Nash DVD', price: 10, quantity: 1 },
    { name: 'Fig Bar', price: 3, quantity: 10 },
  ],

  taxPercent: 5
}
```

In this example we would have a `itemStore` and a `taxPercentStore` to model this state.  Notice a few important things
are left out in this model of our application state, such as the subtotal, the amount of tax and the total.  This doesn't
live in our app state becuase those are all examples of **computable state**, and we have a very elegant solution for calculating them
that we will touch on momentarily.

### But first lets go over some NuclearJS Vocubulary

#### Reactor

In Nuclear a Reactor is the container that holds your app state, it's where you register stores, dispatch actions and read the current
state of your system.  Reactor's are the only stateful part of Nuclear and have only 3 API methods you REALLY need to know: `dispatch`, `get`, and `observe`.
Don't worry extensive API docs will be provided for all of these methods

#### Stores

Stores define how a portion of the application state will behave over time, they also provide the initial state. Once a store has been attached to a Reactor you will
never reference it directly, calling `reactor.dispatch(actionType, payload)` will ensure that all store recieve the action and get a chance to update themselves.  Stores
are self managing state, providing a single canonical place to define the behavior a domain of your application over time.

#### KeyPaths

KeyPaths are a pointer to some piece of your application state.  They can be represented a `String` or `Array`

`'items'` Is a valid keypath that would lookup the items section of your app state, analagous to `state['items']` in javascript.

`'foo.bar'` and `['foo', 'bar']` would be equivalent keypaths. Tip: Use array keypaths when needing a dynamic keypath or
need to reference an numerical key.

#### Getters

Getters are quite possibly the most powerful abstraction in Nuclear and are used everywhere.  They abstract the reading of some piece of app state combined with a
transformation (optional).

**Examples:**

```js
var Getter = require('nuclear-js').Getter

var getItems = Getter('items') // when a function is not supplied simply uses identity function
var items = reactor.get(getItems) // returns a list of items

// optionally a function can be supplied as the last argument to transform the value
var itemSize = Getter('items', items => items.size) // using es6 arrow functions
var moreThanFive = Getter(itemSize, size => size > 5) // getters can be composed together

// Getters can take multiple values and combine + transform
var filteredUsers = Getter(
  'users',
  'userNameFilter',
  (users, username) => {
    users.filter(user => {
      return user.get('username').indexOf(username) > -1
    })
  })
```

Getters can reference any part of the app state, and combine and transform multiple values together.  Because of this there is no need for NuclearJS Store's to know
about any other part of the system (including other Stores). Getters provide a canonical way to reference some state or computable state, they are simply pure functions
with dependency injection thus providing a very simple way to test.

## Back To Our Example

First lets create the `itemStore` and `taxPercentStore` and hook it up to our reactor.

```js
var Map = require('immutable').Map
var Reactor = require('nuclear-js').Reactor
var Store = require('nuclear-js').Store

var itemStore = Store({
  // the parameter is optional, if not supplied will default to `{}`
  // stores can be any data structure including primitives
  getInitialState: function() {
    // any non-primitive value will be coerced into its immutable counterpart
    // so `{}` becomes Immutable.Map({}) and `[]` becomes Immutable.List([])
    return []
  },

  initialize: function() {
    // register a handler for `reactor.dispatch('addItem', payload)`
    this.on('addItem', function(state, payload) {
      // a handler is passed the current state and the action payload
      // it performs an immutable transformation of the store's underlying state
      // in response to the action and returns the new state
      return state.push(Map({
        name: payload.name,
        price: payload.price,
        quantity: payload.quantity || 1,
      }))
    })
  }
})

var taxPercentStore = Store({
  getInitialState: function() {
    return 0
  },

  initialize: function() {
    // this will get called via `reactor.dispatch('setTaxPercent', 10)`
    // where the payload is a primitive value (number)
    this.on('setTaxPercent', function(percent, value) {
      return value
    })
  }
})

var reactor = Reactor({
  stores: {
    items: itemStore,
    taxPercent: taxPercentStore
  }
})

console.log(reactor.get('items')) // List []
console.log(reactor.get('taxPercent')) // 0

reactor.dispatch('addItem', { name: 'Soap', price: 5, quantity: 2 })

console.log(reactor.get('items')) // List [ Map { name: 'Soap', price:5, quantity: 2 } ]
```

### Computing Subtotal, Tax and Total

```js
var Getter = require('nuclear-js').Getter

var getSubtotal = Getter('items', items => {
  return items.reduce((total, item) => {
    return total + (item.get('price') * item.get('quantity'))
  }, 0)
})

var getTax = Getter(getSubtotal, 'taxPercent', (subtotal, taxPercent) => {
  return subtotal * (taxPercent / 100)
})

var getTotal = Getter(getSubtotal, getTax, (subtotal, tax) => subtotal + tax)

console.log(reactor.get(getSubtotal)) // 10
console.log(reactor.get(getTax)) // 0
console.log(reactor.get(getTotal)) // 10

reactor.dispach('setTaxPercent', 10)

console.log(reactor.get(getSubtotal)) // 11
console.log(reactor.get(getTax)) // 1
console.log(reactor.get(getTotal)) // 11
```

### Lets do something more interesting...

Imagine we want to know anything the total is over 100.  Let's use `reactor.observe`

```js
var over100 = Getter(getTotal, total => total > 100)

reactor.observe(getTotal, total => {
  if (total > 100) {
    alert('Shopping cart over 100!')
  }
})
```

Actually that wasn't that interesting... lets make the threshold dynamic

```js
var budgetStore = Store({
  getInitialState: function() {
    return Infinity
  },
  initialize: function() {
    this.on('setBudget', (currentBudget, newBudget) => newBudget)
  }
})

reactor.attachStore('budget', budgetStore) // stores can be attached at any time

var isOverBudget = Getter(getTotal, 'budget', (total, budget) => {
  return total > budget
})

reactor.observe(isOverBudget, isOver => {
  // this will be automatically reevaluated only when the total or budget changes
  if (isOver) {
    var budget = reactor.get('budget')
    alert("Is over budget of " + budget)
  }
})
```

**Using this pattern of composing Getters together the majority of your system becomes purely functional transforms.**

### Hooking up a UI: React

Syncing reactor stores and React component state is effortless using the [NuclearVueMixin](https://github.com/jordangarcia/nuclear-vue-mixin).

```js
var React = require('react')
var NuclearReactMixin = require('nuclear-react-mixin')

var ShoppingCart = react.createClass({
  mixins: [NuclearReactMixin(reactor)],

  // simply implement this function to keep a components state
  // in sync with a Nuclear Reactor
  getDataBindings() {
    // can reference a reactor KeyPath
    items: 'items',
    taxPercent: 'taxPercent',
    // or reference a Getter
    subtotal: getSubtotal,
    tax: getTax,
    total: getTotal,
    // or inline a getter
    expensiveItems: Getter('items', items => {
      return items.filter(item => item > 100)
    })
  },

  render() {
    var itemRows = this.state.items.map(function(item) {
      return (
        <tr>
          <td>{item.get('quantity')}</td>
          <td>{item.get('name')}</td>
          <td>{item.get('price')}</td>
        </tr>
      )
    })
    return (
      <div>
        <AddItemForm />
        <table>
          <tr>
            <td>Quantity:</td>
            <td>Name:</td>
            <td>Price:</td>
          </tr>
          {itemRows}
          <tr>
            <td colspan=2>subtotal:</td>
            <td>{this.state.subtotal}</td>
          </tr>
          <tr>
            <td colspan=2>tax @ {this.state.taxPercent}%</td>
            <td>{this.state.taxPercent}</td>
          </tr>
          <tr>
            <td colspan=2>total:</td>
            <td>{this.state.total}</td>
          </tr>
        </table>
      </div>
    )
  }
})
```

Whenever any of the reactor values being observed from `getDataBindings()` changes then `setState()` will be called with the updated value and the component will be rerendered.
Thus your React components always stay in sync with your app state!


### Hooking up a UI: VueJS

Coming soon...

## Coming soon

- Handle asnychronous data in a NuclearJS system

- A collaborative shopping cart using Websockets

- Structure for very large apps built with NuclearJS modules


## Differences between NuclearJS and Vanilla Flux

First off, NuclearJS is an implementation of Flux Architecture.  It shares many of the same fundamental concepts, such as
unidirectional data flow and a single synchronous dispatcher.  

##### Here is where it differs:

- Stores do not hold their own state, or are accessible by other parts of the system.  They simply model a part of the application domain over time.

- Stores dont mutate themselves, instead each handler is a pure function that transforms the current state into a new state.

- Because Getters are used whenever data from two or more stores needs to be combined there is no need for `dispatcher.waitsFor`

- Reactor.dispatch waits for every Store to receive the action before notifying subscribers, this ensures no renders can happen before all stores have handled the action.

- Immutability allows more granular change observation.  You no longer have to listen for change events at the store level.  Comparing the any part of two
different immutable maps is simply a `===` operation (constant time) and the map lookup itself is `O(log32)`.

## Reactor API

#### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered Store. This process is done syncronously, all registered `Store` are passed this message and all computeds are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

#### `Reactor#get(...keyPath, [transformFn])`

Returns the immutable value for some KeyPath or Getter in the reactor state. Returns `undefined` if a keyPath doesnt have a value.

```js
reactor.get('users.active')
reactor.get(['users', 'active'])
reactor.get('users.active', 'usernameFilter', function(activeUsers, filter) {
  return activeUsers.filter(function(user) {
    return user.get('username').indexOf(filter) !== -1
  }
})
```

#### `Reactor#getJS(...keyPath, [transformFn])`

Same as `get` but coerces the value to a plain JS before returning

#### `Reactor#observe(keyPathOrGetter, handlerFn)`


## Design Philosophy

- **Simple over Easy** - The purpose of NuclearJS isn't to write the most expressive TodoMVC anyone's ever seen.  The goal of NuclearJS is to provide a way to model data that is easy to reason about and decouple at very large scale.

- **Immutable** - A means for less defensive programming, more predictability and better performance

- **Functional** - The framework should be implemented functionally wherever appropriate.  This reduces incidental complexity and pairs well with Immutability

- **Smallest Amount of State Possible** - Using Nuclear should encourage the modelling of your application state in the most minimal way possible.

- **Decoupled** - A NuclearJS system should be able to function without any sort of UI or frontend.  It should be backend/frontend agnostic and be able to run on a NodeJS server.

## Tools / Addons

- [NuclearVueMixin](https://github.com/jordangarcia/nuclear-vue-mixin) Keeps Vue ViewModels data in sync with a reactor.
- [NuclearReactMixin](https://github.com/jordangarcia/nuclear-react-mixin) Keeps React components always in sync with a Nuclear.Reactor.  Uses immutability to call set state only when the data behind a component actually changes (inspired by Om).

## Examples

- [TodoMVC](https://github.com/jordangarcia/todomvc-nuclear-react) **currently out of date**
- [Tetris](https://github.com/jordangarcia/tetris) **currently out of date**
