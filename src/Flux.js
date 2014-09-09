var through = require('through')
var Store = require('./Store');

class Flux {
  constructor() {
    this.stores = {}
    this.actionGroups = {}
    this.dispatchStream = through()
  }

  registerStore(id, store) {
    if (!(store instanceof Store)) {
      store = new Store()
    }
    // save reference
    this.stores[id] = store
    // pipe all dispatches
    this.dispatchStream.pipe(store.stream)
  }

  unregisterStore(id) {
    var store = this.getStore(id)
    this.dispatchStream.unpipe(store.stream)
  }

  registerActionGroup(id, actionGroup) {
    this.actionGroups[id] = actionGroup
  }

  getStore(id) {
    return this.stores[id]
  }

  getActionGroup(id) {
    return this.actionGroups[id]
  }
}

module.exports = Flux
