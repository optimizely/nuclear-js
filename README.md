# NuclearJS

A framework to decouple app state and UI.

**Define a Core, which describes how a piece of your application state behaves**

```js
var Immutable = require('immutable')
var Nuclear = require('nuclear-js')
var __id = 1;

var todoItems = Nuclear.createCore({
  getInitialState: function() {
    return Immutable.Vector()
  },

  initialize: function() {
    // setup what events this part of the state reacts to

    this.on('addItem', function(state, payload){
      // a handler function is passed the current state
      // and returns a new state
      // push a new item record
      return state.push(Immutable.Map({
        id: __id++,
        title: payload.title,
        isCompleted: false
      }))
    })

    this.on('removeItem', function(state, payload){
      // returns a vector of all items except ones matching payload.id
      return state.filter(function(item) {
        return item.get('id') !== payload.id
      }).toVector()
    })

    this.on('completeItem', function(state, payload) {
      // marks an the item matching payload.is as `isCompleted`
      return state.map(function(item) {
        if (item.get('id') === payload.id) {
          return item.set('isCompleted', true)
        }
        return item
      }).toVector()
    })
  }
})
```

**Register that core as a key on the app state map**

```js
var Nuclear = require('nuclear-js')
var todoItems = require('./todo-items')

var reactor = Nuclear.createReactor()
// bind the todoItems state to the 'items' key in our app state
reactor.defineState('items', todoItems)

// start the reactor
reactor.initialize()

console.log(reactor.get('items'))
// Vector []

// Mutate state by dispatching actions into the reactor
reactor.dispatch('addItem', {
  title: 'hey',
})

console.log(reactor.get('items'))
// Vector [ Map { id: 1, title: 'hey', isCompleted: false }]
```

**Define Computed State**

One of the major sources of complexity in front end development is needed to have your 
application state in a different format to properly display it in the UI. Keeping stateful
instances of your application objects in the UI where it doesn't belong leads to headache.

NuclearJS solves this by allowing you to define computed properties on your app state.  Since
data structure in NuclearJS are immutable, these computeds are lazy and only get evaluated when
another part of the system needs to consume the value.

This allows your to describe the entire logic of your system in a performant manner.

**Lets add another Core to our system**

```js
var Nuclear = require('nuclear-js')
var todoItems = require('./todo-items')

var reactor = Nuclear.createReactor()
// bind the todoItems state to the 'items' key in our app state
reactor.defineState('items', todoItems)

reactor.defineState('filterValue', Nuclear.createCore({
  getInitialState: function() {
    return 'all'
  },

  initialize: function() {
    this.on('changeFilter', function(state, filterValue) {
      // return the new state of `filterValue`
      return filterValue
    })
  },
}))

// A getter defines some array of dependencies (app state keyPaths or other Getters)
// and a compute function that is passed the values of the deps
var shownItems = Nuclear.Getter({
  deps: ['items', 'filterValue'],
  compute: function(items, fitlerValue) {
    var filterFns = {
      'all': function(item) {
        return true
      },
      'active': function(item) {
        return !item.get('isCompleted')
      },
      'completed': function(item) {
        return item.get('isCompleted')
      },
    }
    var filterFn = filterFns[filterValue] || filterFns['all']

    return items.filter(filterFn).toVector()
  }
})

reactor.defineComputed('shownItems', shownItems)

// start the reactor
reactor.initialize()
```

**[Plans for 0.4](./NEXT.md)**

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

- **Convenience APIs** - Provide a framework API that makes building UIs on top of Nuclear seamless and beautiful.

**more documentation coming soon**
