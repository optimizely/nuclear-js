import React from 'react'
import { Reactor, Store, toImmutable } from 'nuclear-js'
import StateViewComponent from '../../components/state-viewer'


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
    if (!filter) {
      return items
    }

    return items.filter(i => i.get('type') === filter)
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
    const stateViewerStyle ={
      position: 'absolute',
      bottom: 0,
      left: 0,
    }
    return (
      <div>
        <div>
          Filter by type:
          <select className="browser-default" onChange={this._onChange}>
            <option value="all">All</option>
            <option value="food">Food</option>
            <option value="clothes">Clothes</option>
          </select>
        </div>
        <ul>
          {this.state.items.map(item => {
            return <li>${item.get('price')} - {item.get('name')}</li>
          })}
        </ul>

        <div className="state-viewer--container" style={stateViewerStyle}>
          <StateViewComponent title="AppState" reactor={reactor} />
          <StateViewComponent title="filteredItems" reactor={reactor} getter={filteredItemsGetter} />
        </div>
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
