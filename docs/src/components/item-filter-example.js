import React from 'react'
import { Reactor, Store, toImmutable } from 'nuclear-js'
import StateViewer from './state-viewer'
import ExampleStep from './example-step'
import Browser from './browser'

const reactor = new Reactor({
  debug: true,
  expose: 'itemFilterReactor'
});

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
    }
  }),
})

const filteredItemsGetter = [
  ['typeFilter'],
  ['items'],
  (filter, items) => {
    return (filter)
      ? items.filter(i => i.get('type') === filter)
      : items
  }
]

export default React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return {
      items: filteredItemsGetter
    }
  },

  _onChange(e) {
    let type = e.target.value;
    if (type === 'all') {
      type = null
    }
    reactor.dispatch('FILTER_TYPE', type)
  },

  render() {
    return (
      <div id="item-filter-example">
        <Browser>
          <div style={{ minHeight: 200 }}>
            <div className="example-select-wrapper">
              Filter by type: <select className="browser-default" onChange={this._onChange}>
                <option value="all">All</option>
                <option value="food">Food</option>
                <option value="clothes">Clothes</option>
              </select>
            </div>

            <table className="bordered">
              <thead>
                <tr>
                    <th data-field="id">Name</th>
                    <th data-field="name">Type</th>
                    <th data-field="price">Price</th>
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
            <div className="example-step">
              <h6 className="example-step--title valign">User action updates application state</h6>
              <StateViewer title="AppState" reactor={reactor} />
            </div>

            <div className="example-step">
              <h6 className="example-step--title">Getters compose and transform application state reactively notifying components of any changes.</h6>
              <StateViewer title="filteredItems Getter" reactor={reactor} getter={filteredItemsGetter} />
            </div>
          </div>
        </Browser>
      </div>
    )
  }
})
