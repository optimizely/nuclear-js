NuclearJS: A framework to decouple app state and UI.

#### Define what your app state looks like and how it reacts to events over time.

```js
var Immutable = require('immutable')
var Nuclear = require('nuclear-js')
var uuid = require('uuid')

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
        id: uuid(),
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


var reactor = Nuclear.createReactor()
// bind a section of your app state `'items'` to the `todoItems` ReactorCore
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
