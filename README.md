# NuclearJS

Traditional Flux architecture built with ImmutableJS data structures.

## How NuclearJS differs from other Flux implementations

1.  All app state is in a singular immutable map, think Om.  In development you can see your entire application state at every point in time thanks to awesome
debugging tools built into NuclearJS.

2.  State is not spread out through stores, instead stores are a declarative way of describing some top-level domain of your app state.
  For each key in the app state map a store declares the initial state of that key and how that piece of the app state reacts over time
  to actions dispatched on the flux system.

3.  Stores are not reference-able nor have any `getX` methods on them.  Instead Nuclear uses a functional lens concept called **getters**.
  In fact, the use of getters obviates the need for any store to know about another store, eliminating the confusing `store.waitsFor` method found
  in other flux implementations.

4.  NuclearJS is insanely efficient - change detection granularity is infinitessimal, you can even observe computed state where several pieces of the state
map are combined togther and run through a transform function.  Nuclear is smart enough to know when the value of any computed changes and only call its observer
if and only if its value changed in a way that is orders of magntitude more efficient than traditional dirty checking.  It does this by leveraging ImmutableJS data
structure and using a `state1 !== state2` reference comparison which runs in constant time.

5.  Automatic data observation / rendering -- automatic re-rendering is built in for React in the form a very lightweight mixin.  It is also easily possible to build the
same functionality for any UI framework such as VueJS, AngularJS and even Backbone.

6.  NuclearJS is not a side-project, its used as the defacto Flux implementation that powers all of Optimizely.  It is well tested and will continue to be maintained for the foreseeable future.
  Our current codebase has over dozens of stores, actions and getters, we even share our prescribed method of large scale code organization and testing strategies.

## Design Philosophy

- **Simple over Easy** - The purpose of NuclearJS isn't to write the most expressive TodoMVC anyone's ever seen.  The goal of NuclearJS is to provide a way to model data that is easy to reason about and decouple at very large scale.

- **Immutable** - A means for less defensive programming, more predictability and better performance

- **Functional** - The framework should be implemented functionally wherever appropriate.  This reduces incidental complexity and pairs well with Immutability.

- **Smallest Amount of State Possible** - Using Nuclear should encourage the modelling of your application state in the most minimal way possible.

- **Decoupled** - A NuclearJS system should be able to function without any sort of UI or frontend.  It should be backend/frontend agnostic and be able to run on a NodeJS server.

## Lets see some examples

Lets see what the original [Flux Chat Example](https://github.com/facebook/flux/tree/master/examples/flux-chat) looks like in NuclearJS.

All of the above code lives in [examples/flux-chat](./examples/flux-chat)

##### `flux.js`

```js
// create the Nuclear reactor instance, this will act as our dispatcher and interface for data fetching
var Nuclear = require('nuclear-js')

module.exports = new Nuclear.Reactor({
  debug: true,
})
```

### Modules

The prescribed way of code organization in NuclearJS is to group all stores, actions and getters of the same domain in a module.

##### Example Module File Structure

For the flux-chat example we will create a chat module that holds all of the domain logic for the chat aspect.  For smaller projects
there may only need to be one module, but for larger projects using many modules makes your codebase very decoupled and much easier to manage.

```js
modules/chat
├── stores/
    └── thread-store.js
    └── current-thread-id-store.js
├── actions.js // exports functions that call flux.dispatch
├── action-types.js // constants for the flux action types
├── getters.js // getters exposed by the module providing read access to module's stores
├── index.js // MAIN ENTRY POINT - facade that exposes a public api for the module
└── tests.js // module unit tests that test the modules stores, getters, and actions
```

##### `modules/chat/index.js`

```js
var flux = require('../../flux')

flux.registerStores({
  currentThreadID: require('./stores/current-thread-id-store'),
  threads: require('./stores/thread-store'),
})

module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),
}
```

- Modules expose single public API, the `index.js` file.  It is improper for an outside piece of code to a require any file within the module
except the `index.js` file.

- Stores are registered lazily through the module's index.js.  This may seem weird at first, but in NuclearJS stores are more of an implementation detail
and not ever directly referenceable.

- Data access to the module's store values is done entire through the getters it exposes.  This provides a decoupling between the store implementation and how
the outside world references the state that a module manages.  A getter is a contract between the outside world and the module that a particular piece of information
is accessible.  The evaluator of a getter does not care about the underyling store representation.

### Stores

##### `modules/chat/stores/thread-store.js`

```js
var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // for Nuclear to be so efficient all state must be immutable data
    // mapping of threadID => Thread
    return toImmutable({})
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.ADD_MESSAGE, addMessage)
    this.on(actionTypes.CLICK_THREAD, setMessagesRead)
  }
})

/**
 * @type Message
 * id {GUID}
 * threadID {GUID}
 * threadName {GUID}
 * authorName {String}
 * text {String}
 * isRead {Boolean}
 * timestamp {Timestamp}
 */

/**
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {Message} payload.message
 */
function addMessage(state, { message }) {
  var msg = toImmutable(message)
  var threadID = msg.get('threadID')

  return state.withMutations(threads => {
    // use standard ImmutableJS methods to transform state when handling an action
    if (!threads.has(threadID)) {
      threads.set(threadID, toImmutable({
        threadID: threadID,
        threadName: msg.get('threadName'),
        messages: toImmutable([]),
      }))
    }

    // push new message into thread and sort by message timestamp
    threads.update(threadID, thread => {
      var sortedMessages = thread.get('messages')
        .push(msg)
        .sortBy(msg => msg.get('timestamp'))

      return thread.set('messages', sortedMessages)
    })
  })
}

/**
 * Mark all messages for a thread as "read"
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {GUID} payload.threadID
 */
function setMessagesRead(state, { threadID }) {
  return state.updateIn([threadID, 'messages'], messages => {
    return messages.map(msg => msg.set('isRead', true))
  })
}
```

##### `modules/message/stores/current-thread-id-store.js`

```js
var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // only keeps track of the current threadID
    return null
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.CLICK_THREAD, setCurrentThreadID)
  }
})

function setCurrentThreadID(state, { threadID }) {
  // return the new value of the store's state
  return threadID
}
```

At this point defined how our application manages state over time by creating and registering the thread store and currentThreadID store.
When defining stores there is no need to worry about computable state like the most recent message in each thread, this is all handled through getters.

### Getters

Getters can take 2 forms:

  1. A KeyPath such as `['messages']` which equates to a `state.getIn(['messages'])` on the app state `Immutable.Map`.  
  2. An array with the form `[  [keypath | getter], [keypath | getter], ..., tranformFunction]`

##### `modules/chat/getters.js`

```js
// it is idiomatic to facade all data access through getters, that way a component only has to subscribe to a getter making it agnostic
// to the underyling stores / data transformation that is taking place
exports.threadsMap = ['threads']

exports.threads = [
  exports.threadsMap,
  threadsMap => threadsMap.toList()
]

exports.currentThread = [
  ['currentThreadID'],
  exports.threadsMap,
  (currentThreadID, threadsMap) => threadsMap.get(currentThreadID)
]

exports.latestThread = [
  exports.threads,
  threads => {
    return threads
      .sortBy(thread => {
        thread.get('messages').last().get('timestamp')
      })
      .last()
  }
]


exports.currentThreadID = [
  exports.currentThread,
  thread => thread ? thread.get('threadID') : null
]

exports.unreadCount = [
  exports.threads,
  threads => {
    return threads.reduce((accum, thread) => {
      if (!thread.get('messages').last().get('isRead')) {
        accum++
      }
      return accum
    }, 0)
  }
]
```

Since stores are registered on the Nuclear Reactor by the module's index file, then a module is the only part of the system that knows the
store ids, if this information need to be made public, the module will export a getter of the form `[<storeId>]`


### Actions

##### `module/chat/actions.js`

```js
var flux = require('../../flux')
var actionTypes = require('./action-types')
var getters = require('./getters')

/**
 * Handles the receiving of messages into the flux system
 * @param {Message[]} messages
 */
exports.receiveAll = function(messages) {
  messages.forEach(message => {
    flux.dispatch(actionTypes.ADD_MESSAGE, { message })
  })
}

/**
 * Creates a message
 * @param {String} text
 * @param {GUID} threadName
 */
exports.createMessage = function(text, threadID) {
  var timestamp = Date.now()
  var id = 'm_' + timestamp
  var threadName = flux.evaluate([
    getters.threadsMap,
    threadsMap => threadsMap.getIn([threadID, 'threadName'])
  ])
  var authorName = 'Jordan'

  flux.dispatch(actionTypes.ADD_MESSAGE, {
    message: { id, threadID, threadName, authorName, timestamp, text }
  })
}

exports.clickThread = function(threadID) {
  flux.dispatch(actionTypes.CLICK_THREAD, { threadID })
}
```

### Hooking it up to a component

###### `components/ThreadSection.react.js`

```js
var React = require('react');
var flux = require('../flux');
var Chat = require('../modules/chat');

var ThreadListItem = require('./ThreadListItem.react');

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

module.exports = ThreadSection;
```

`flux.ReactMixin` handles all of the pub/sub between the flux system and component and will only render the component via a `setState`
call whenever any of the subscribed getters' value changes.  The mixin will also automatically unsubscribe from observation when the
component is unmounted.

##### `ThreadListItem.react.js`

```js
var React = require('react');
var Chat = require('../modules/chat');
var cx = require('react/lib/cx');

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
    var lastMessage = thread.get('messages').last();
    var dateString = (new Date(lastMessage.get('timestamp'))).toLocaleTimeString()
    return (
      <li
        className={cx({
          'thread-list-item': true,
          'active': thread.get('threadID') === this.props.currentThreadID
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.get('threadName')}</h5>
        <div className="thread-time">
          {dateString}
        </div>
        <div className="thread-last-message">
          {lastMessage.get('text')}
        </div>
      </li>
    );
  },

  _onClick: function() {
    var threadID = this.props.thread.get('threadID')
    if (this.props.currentThreadID !== threadID) {
      Chat.actions.clickThread(threadID);
    }
  }

});

module.exports = ThreadListItem;
```


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

var itemStore = new Nuclear.Store({
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

var taxPercentStore = new Nuclear.Store({
  getInitialState: function() {
    return 0
  },

  initialize: function() {
    // this will get called via `reactor.dispatch('setTaxPercent', 10)`
    // where the payload is a primitive value (number)
    this.on('setTaxPercent', function(oldPercent, newPercent) {
      return newPercent
    })
  }
})

var reactor = new Nuclear.Reactor()
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
  totalGetter,
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

Syncing reactor stores and React component state is effortless using `reactor.ReactMixin`

```js
var React = require('react')

var ShoppingCart = React.createClass({
  mixins: [reactor.ReactMixin],

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

## API Documentation

### Reactor

#### `Reactor#dispatch(messageType, messagePayload)`

Dispatches a message to all registered Stores. This process is done synchronously, all registered `Store`s are passed this message and all computeds are re-evaluated (efficiently).  After a dispatch, a Reactor will emit the new state on the `reactor.changeEmitter`

ex: `reactor.dispatch('addUser', { name: 'jordan' })`

#### `Reactor#evaluate(Getter | KeyPath)`

Returns the immutable value for some KeyPath or Getter in the reactor state. Returns `undefined` if a keyPath doesn't have a value.

```js
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

Same as `evaluate` but coerces the value to a plain JS before returning

#### `Reactor#observe(keyPathOrGetter, handlerFn)`

Takes a getter or keyPath and calls the handlerFn with the evaluated value whenever the getter or keyPath changes.

**Note**:  You cannot call `flux.dispatch` within the handle function of a `flux.observe`.  This violates one of the fundamental
design patterns in Flux architecture, which forbids cascading dispatches on the system which cause highly unpredictive systems.

```js
reactor.observe([
  ['items']
  function(items) {
    console.log('items changed');
  }
])
```

#### `Reactor#registerStores(stores, silent)`

`stores` - an object of storeId => store instance

`silent` (optional) a boolean that if true, will not cause any observers to be evaluated if the newly added stores change a getter value.

```js
reactor.registerStores({
  'threads': require('./stores/thread-store'),
  'currentThreadID': require('./stores/current-thread-id-store'),
})
```

#### `Reactor#reset()`

Causes all stores to be reset to their initial state.  Extremely useful for testing, just put a `reactor.reset()` call in your `afterEach` blocks.

#### `Reactor#ReactMixin`

Exposes the ReactMixin to do automatic data binding.

```js
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

### Constructors

#### `Nuclear.Reactor`

```js
var reactor = new Nuclear.Reactor(config)
```

**Configuration Options**

`config.debug` Boolean - if true it will log the entire app state for every dispatch.

#### `Nuclear.Store`

```js
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

### Utilities

NuclearJS comes with several utility functions that are exposed on the `Nuclear` variable.

#### `Nuclear.Immutable`

Provides access to the ImmutableJS `Immutable` object.

#### `Nuclear.toImmutable(value)`

Coerces a value to its immutable counterpart, can be called on any type safely.  It will convert Objects to `Immutable.Map` and Arrays to `Immutable.List`

#### `Nuclear.toJS(value)`

Will coerce an Immutable value to its mutable counterpart.  Can be called on non immutable values safely.

#### `Nuclear.isImmutable(value)` : Boolean

Returns true if the value is an ImmutableJS data structure.

#### `Nuclear.isKeyPath(value)` : Boolean

Returns true if the value is the format of a valid keyPath

#### `Nuclear.isGetter(value)` : Boolean

Returns true if the value is the format of a valid getter
