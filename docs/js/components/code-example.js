require('highlight.js/styles/github.css')

import React from 'react'
import { Reactor, Store, toImmutable } from 'nuclear-js'
import Code from './code'

const storeCode = `const reactor = new Reactor({ debug: true });

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

export default React.createClass({
  render() {
    return (
      <div>
        <Code lang="javascript">
          {storeCode}
        </Code>
        <Code lang="javascript">
          {getterCode}
        </Code>
        <Code lang="javascript">
          {componentCode}
        </Code>
      </div>
    )
  }
})
