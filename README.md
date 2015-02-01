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
never reference it directly, calling `reactor.dispatch(actionType, payload)` will ensure that all stores receive the action and get a chance to update themselves.  Stores
are self managing state, providing a single canonical place to define the behavior a domain of your application over time.

#### KeyPaths

KeyPaths are a pointer to some piece of your application state.  They can be represented as a `Array<String>`

`['foo', 'bar']` is an example of a valid keypath, analagous to `state['foo']['bar']` in javascript

#### Getters

As described above, the state of a reactor is hidden away internally behind the [Stores](#stores) abstraction.
In order to get a hold of part of that state, you need to ask the [Reactor](#reactor) for it using a simple protocol referred to, informally, as a Getter.

Getters can take 2 forms:

  1. A [KeyPath](#keypaths) as described above
  2. An array with the form `[  [keypath | getter], [keypath | getter], ..., tranformFunction]`
  Note - Often you'll pass the Getter to `reactor.evaluate` to get its value, but we'll touch on the reactor API later.

If you've used [AngularJS](https://angularjs.org/), the 2nd form will seem familiar.  It's essentially a way of specifying
which app values get injected into the transform function at the end.  Here's an example of the form itself,
but keep in mind that it may make more sense in the context of the examples below,

```js
// Our first getter, takes in the `items` portion of the app state and
// returns (presumably) the sum of `item.price * item.quantity` for all the items
var subtotalGetter = [
  // a KeyPath
  ['items'],
  // and a transform function
  function(items) { ... }
]

// This Getter requests 2 values be passed into it's transform function - the result
// of the subtotalGetter and the `taxPercent` value from the app state.
var totalGetter = [
  // A Getter
  subtotalGetter,
  // A KeyPath
  ['taxPercent'],
  // Composition Function
  function(subtotal, taxPercent) {
    return (subtotal * taxPercent) + subtotal
  }
]
```

Notice that you can use getters as dependencies to other getters.  This is an extremely powerful abstraction, and one
that you'll undoubtedly want to become familiar with in your nuclear journey.

But you need to know one thing about getter transform functions - they MUST be pure functions (that is, a given set input values results in a [deterministic](http://en.wikipedia.org/wiki/Deterministic_algorithm) output).
By making the transform functions pure, you can test Getters easier, compose them easier, and nuclear can [memoize](http://en.wikipedia.org/wiki/Memoization)
calls to them, making Getter dependency resolution very performant.

__For the astute reader__ - You probably already noticed if you have experience in functional languages, but because Getters
are simply arrays full of strings and pure functions, they are serializable. Since JS can stringify pure functions,
your getters are nothing more than data that could be stored, sent over the wire, etc.

## Back To Our Example

First lets create the `itemStore` and `taxPercentStore` and hook it up to our reactor.

```js
var Map = require('immutable').Map
var List = require('immutable').List
var Nuclear = require('nuclear-js')

var itemStore = Nuclear.Store({
  // the parameter is optional, if not supplied will default to an `Immutable.Map({})`
  // Store state must be an ImmutableJS data structure or an immutable javascript primitive
  // like Number or String
  getInitialState: function() {
    return Immutable.List()
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

var taxPercentStore = Nuclear.Store({
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

var reactor = Reactor()
reactor.registerStores({
  items: itemStore,
  taxPercent: taxPercentStore,
})

// Let's use a Getter (the first form, a [KeyPath](#keypaths)) to retrieve parts of the app state
console.log(reactor.evaluate(['items'])) // List []
console.log(reactor.evaluate(['taxPercent'])) // 0

reactor.dispatch('addItem', {
  name: 'Soap',
  price: 5,
  quantity: 2,
})

console.log(reactor.evaluate(['items'])) // List [ Map { name: 'Soap', price:5, quantity: 2 } ]
```

### Computing Subtotal, Tax and Total

```js
var subtotalGetter = [
  ['items'],
  function(items) {
    // items is of type `Immutable.List`
    return items.reduce(function(total, items) {
      return total + (item.get('price') * item.get('quantity'))
    }, 0)
  }
]

var taxGetter = [
  subtotalGetter,
  ['taxPercent'],
  function(subtotal, taxPercent) {
    return subtotal * (taxPercent / 100)
  }
]

var totalGetter = [
  subtotalGetter,
  taxGetter,
  function(subtotal, tax) {
    return subtotal + tax
  }
]

console.log(reactor.evaluate(subtotalGetter)) // 10
console.log(reactor.evaluate(taxGetter)) // 0
console.log(reactor.evaluate(totalGetter)) // 10

reactor.dispatch('setTaxPercent', 10)

console.log(reactor.evaluate(subtotalGetter)) // 11
console.log(reactor.evaluate(taxGetter)) // 1
console.log(reactor.evaluate(totalGetter)) // 11
```

### Lets do something more interesting...

Imagine we want to know any time the total is over 100.  Let's use `reactor.observe`

```js
var over100Getter = [
  getTotal,
  function(total) {
    return total > 100
  }
]

reactor.observe(over100Getter, function(isOver100) {
  if (isOver100) {
    alert('Shopping cart over 100!')
  }
})
```

Actually that wasn't that interesting... lets make the threshold dynamic

```js
var budgetStore = Nuclear.Store({
  getInitialState: function() {
    return Infinity
  },
  initialize: function() {
    this.on('setBudget', function(currentBudget, newBudget) {
      return newBudget
    }
  }
})

// stores can be attached at any time
reactor.registerStores({
  budget: budgetStore,
})

var isOverBudget = [
  totalGetter,
  ['budget'],
  function(total, budget) {
    return total > budget
  }
]

reactor.observe(isOverBudget, function(isOver) {
  // this will be automatically re-evaluated only when the total or budget changes
  if (isOver) {
    var budget = reactor.evaluate(['budget'])
    alert("Is over budget of " + budget)
  }
})
```

**By using this pattern of composing Getters together, the majority of your system becomes purely functional transforms.**

### Hooking up a UI: React

Syncing reactor stores and React component state is effortless using the [NuclearReactMixin](https://github.com/jordangarcia/nuclear-react-mixin).

```js
var React = require('react')
var NuclearReactMixin = require('nuclear-react-mixin')

var ShoppingCart = React.createClass({
  mixins: [NuclearReactMixin(reactor)],

  // simply implement this function to keep a components state
  // in sync with a Nuclear Reactor
  getDataBindings() {
    return {
      // can reference a reactor KeyPath
      items: 'items',
      taxPercent: 'taxPercent',
      // or reference a Getter
      subtotal: getSubtotal,
      tax: getTax,
      total: getTotal,
      // or inline a getter
      expensiveItems: ['items', items => {
        return items.filter(item => item > 100)
      }]
    }
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
Thus your React components always stays in sync with your app state!


### Hooking up a UI: VueJS

Syncing reactor stores to VueJS components is simple using the [NuclearVueMixin](https://github.com/jordangarcia/nuclear-vue-mixin).

```js
var Vue = require('vue')
var NuclearVueMixin = require('nuclear-vue-mixin')

var ShoppingCart = new Vue({
  mixins: [NuclearVueMixin(reactor)],

  getDataBindings: function() {
    return {
      // can reference a reactor KeyPath
      items: 'items',
      taxPercent: 'taxPercent',
      // or reference a Getter
      subtotal: getSubtotal,
      tax: getTax,
      total: getTotal,
    }
  },

  template: require('text!./shopping-cart.html'),
})
```

In `shopping-cart.html`

```html
<table>
  <tr>
    <td>Quantity:</td>
    <td>Name:</td>
    <td>Price:</td>
  </tr>
  <tr v-repeat="item: items">
    <td>{{ item.quantity }}</td>
    <td>{{ item.name }}</td>
    <td>{{ item.price | currency }}</td>
  </tr>
  <tr>
    <td colspan=2>subtotal:</td>
    <td>{{ subtotal }}</td>
  </tr>
  <tr>
    <td colspan=2>tax @ {{ taxPercent }}%</td>
    <td>{{ tax }}</td>
  </tr>
  <tr>
    <td colspan=2>total:</td>
    <td>{{ total }}</td>
  </tr>
</table>
```

## Coming soon

- Handle asnychronous data in a NuclearJS system

- A collaborative shopping cart using Websockets

- Structure for very large apps built with NuclearJS modules


## Differences between NuclearJS and Vanilla Flux

First off, NuclearJS is an implementation of Flux Architecture.  It shares many of the same fundamental concepts, such as
unidirectional data flow and a single synchronous dispatcher.  

##### Here is where it differs:

- Stores do not hold their own state, or are accessible by other parts of the system.  They simply model a part of the application domain over time.

- Stores don't mutate themselves, instead each handler is a pure function that transforms the current state into a new state.

- Because Getters are used whenever data from two or more stores needs to be combined there is no need for `dispatcher.waitsFor`

- Reactor.dispatch waits for every Store to receive the action before notifying subscribers, this ensures no renders can happen before all stores have handled the action.

- Immutability allows more granular change observation.  You no longer have to listen for change events at the store level.  Comparing the any part of two
different immutable maps is simply a `===` operation (constant time) and the map lookup itself is `O(log32)`.

## Reactor API

#### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered Store. This process is done synchronously, all registered `Store` are passed this message and all computeds are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

#### `Reactor#evaluate(...keyPath, [transformFn])`

Returns the immutable value for some KeyPath or Getter in the reactor state. Returns `undefined` if a keyPath doesn't have a value.

```js
reactor.evaluate(['users', 'active'])
reactor.evaluate('users.active', 'usernameFilter', function(activeUsers, filter) {
  return activeUsers.filter(function(user) {
    return user.get('username').indexOf(filter) !== -1
  }
})
```

#### `Reactor#evaluateToJS(...keyPath, [transformFn])`

Same as `evaluate` but coerces the value to a plain JS before returning

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
