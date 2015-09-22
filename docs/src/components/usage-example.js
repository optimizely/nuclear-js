import React from 'react'
import { Reactor, Store, toImmutable } from 'nuclear-js'
import Code from './code'

const storeCode = `import { Reactor, Store, toImmutable } from 'nuclear-js'
import React from 'react'

const reactor = new Reactor({ debug: true });

reactor.registerStores({
  typeFilter: Store({
    getInitialState() {
      return null;
    },

    initialize() {
      this.on('FILTER_TYPE', (state, type) => type)
    }
  }),

  items: Store({
    getInitialState() {
      return toImmutable([
        { type: 'food', name: 'banana', price: 1 },
        { type: 'food', name: 'doritos', price: 4 },
        { type: 'clothes', name: 'shirt', price: 15 },
        { type: 'clothes', name: 'pants', price: 20 },
      ])
    },

    initialize() {
      this.on('ADD_ITEM', (state, item) => state.push(item))
    }
  })
})`

const getterCode = `const filteredItemsGetter = [
  ['typeFilter'],
  ['items'],
  (filter, items) => {
    return (filter)
      ? items.filter(i => i.get('type') === filter)
      : items
  }
]`

const componentCode = `const ItemViewer = React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return {
      items: filteredItemsGetter
    }
  },

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {this.state.items.map(item => {
            return <tr>
              <td>{item.get('name')}</td>
              <td>{item.get('type')}</td>
              <td>{item.get('price')}</td>
            </tr>
          })}
        </tbody>
      </table>
    )
  }
})`

const dispatchCode = `const actions = {
  setFilter(type) {
    reactor.dispatch('FILTER_TYPE' type)
  },

  addItem(name, type, price) {
    reactor.dispatch('ADD_ITEM', toImmutable({
      name,
      type,
      price
    }))
  }
}

actions.addItem('computer', 'electronics', 1999)
actions.setFilter('electronics')`

const evaluateCode = `// Evaluate by key path
var itemsList = reactor.evaluate(['items'])
var item0Price = reactor.evaluate(['items', 0, 'price'])

// Evaluate by getter
var filteredItems = reactor.evaluate(filteredItemsGetter)

// Evaluate and coerce to plain JavaScript
var itemsPOJO = reactor.evaluateToJS(filteredItemsGetter)

// Observation
reactor.observe(filteredItemsGetter, items => {
  console.log(items)
})
`
export default React.createClass({
  render() {
    return (
      <div>
        <div className="row code-explanation--row">
          <div className="col s12 m12 l7">
            <Code lang="javascript">{storeCode}</Code>
          </div>

          <div className="col s12 m12 l5 code-explanation">
            <h3 className="tour-section--bullet-title">
              Create a <code>Reactor</code>
            </h3>

            <p className="tour-section--bullet-item">
              In NuclearJS the <code>reactor</code> acts as the dispatcher, maintains the application state and provides an API for data access and observation.
            </p>

            <h3 className="tour-section--bullet-title">
              Register stores
            </h3>
            <p className="tour-section--bullet-item">
              Stores determine the shape of your application state.  Stores define two methods:
            </p>

            <p>
              <code>getInitialState()</code> - Returns the initial state for that stores specific key in the application state.
            </p>

            <p>
              <code>initialize()</code> - Sets up any action handlers, by specifying the action type and a function that transforms
              <pre><code>(storeState, actionPayload) => (newStoreState)</code></pre>
            </p>
          </div>
        </div>

        <div className="row code-explanation--row">
          <div className="col s12 m12 l7">
            <Code lang="javascript">
              {getterCode}
            </Code>
          </div>

          <div className="col s12 m12 l5 code-explanation">
            <h3 className="tour-section--bullet-title">
              Accessing your data
            </h3>

            <p>
              Getters allow you to easily compose and transform your application state in a reusable way.
            </p>
            <h3 className="tour-section--bullet-title">
            </h3>
          </div>
        </div>

        <div className="row code-explanation--row">
          <div className="col s12 m12 l7">
            <Code lang="javascript">
              {componentCode}
            </Code>
          </div>

          <div className="col s12 m12 l5 code-explanation">
            <h3 className="tour-section--bullet-title">
              Automatic component data binding
            </h3>

            <p>
              Simply use the <code>reactor.ReactMixin</code> and implement the <code>getDataBindings()</code> function to automatically sync any
              getter to a <code>this.state</code> property on a React component.
            </p>

            <p>
              Since application state can only change after a dispatch then NuclearJS can be intelligent and only call <code>this.setState</code> whenever the actual
              value of the getter changes.  Meaning less pressure on React's DOM diffing.
            </p>

            <h3 className="tour-section--bullet-title">
              Framework agnostic
            </h3>


            <p>
              This example shows how to use NuclearJS with React, however the same concepts can be extended to any reactive UI framework.
              In fact, the ReactMixin code is only about 40 lines.
            </p>
          </div>
        </div>

        <div className="row code-explanation--row">
          <div className="col s12 m12 l7">
            <Code lang="javascript">
              {dispatchCode}
            </Code>
          </div>

          <div className="col s12 m12 l5 code-explanation">
            <h3 className="tour-section--bullet-title">
              Dispatching actions
            </h3>

            <p>
              NuclearJS maintains a very non-magical approach to dispatching actions.  Simply call <code>reactor.dispatch</code> with the <code>actionType</code> and <code>payload</code>.
            </p>

            <p>
              All action handling is done synchronously, leaving the state of the system very predictable after every action.
            </p>

            <p>
              Because actions are simply functions, it is very easy to compose actions together using plain JavaScript.
            </p>
          </div>
        </div>

        <div className="row code-explanation--row">
          <div className="col s12 m12 l7">
            <Code lang="javascript">
              {evaluateCode}
            </Code>
          </div>

          <div className="col s12 m12 l5 code-explanation">
            <h3 className="tour-section--bullet-title">
              Reading application state
            </h3>

            <p>
              NuclearJS also provides imperative mechanisms for evaluating and observing state.
            </p>

            <p>
              In fact any getter can synchronously and imperatively evaluated or observed.  The entire <code>ReactMixin</code> is built using only those two functions.
            </p>
          </div>
        </div>
      </div>
    )
  }
})
