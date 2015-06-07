var Nuclear = require('nuclear-js')

class ItemStore extends Nuclear.Store {
  getInitialState() {
    return toImmutable([
      { type: 'food', name: 'banana', price: 1 },
      { type: 'food', name: 'doritos', price: 4 },
      { type: 'clothes', name: 'shirt', price: 15 },
      { type: 'clothes', name: 'pants', price: 20 },
    ])
  }
}

class FilteredTypeStore extends Nuclear.Store {
  getInitialState() {
    return null;
  }

  initialize() {
    this.on('FILTER_TYPE', (state, type) => type)
  }
}
