import React from 'react'
import { Reactor, Store, toImmutable } from 'nuclear-js'
import StateViewer from '../../components/state-viewer'
import ExampleStep from '../../components/example-step'
import Browser from '../../components/browser'
import BrowserDevPanel from '../../components/browser-dev-panel'


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

const ItemFilterExample = React.createClass({
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
      <div>
        <div className="row example-step">
          <div className="col l4 s12 ">
            <div class="valign-wrapper">
              <h6 className="example-step--title valign">User action updates application state</h6>

            </div>
          </div>

          <div className="col l8 s12">
            <StateViewer title="AppState" reactor={reactor} />
          </div>

        </div>

        <div className="row example-step">
          <div className="col l4 s12 ">
            <div class="valign-wrapper">
            <h6 className="example-step--title">Getter transforms and composes data then notifies component to update</h6>
          </div>
          </div>

          <div className="col l8 s12">
            <StateViewer title="filteredItems Getter" reactor={reactor} getter={filteredItemsGetter} />
          </div>
        </div>
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
          </div>
        </Browser>
      </div>
    )
  }
})

export default function(el) {
  React.render(
    <ItemFilterExample />,
    el
  )
}
