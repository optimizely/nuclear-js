var through = require('through')
var Store = require('./Store');
var utils = require('./utils')

class Flux {
  constructor() {
    this.stores = {}
    this.actionGroups = {}
    this.dispatchStream = through()
  }

  /**
   * @param {string} actionType
   * @param {object} payload
   */
  dispatch(actionType, payload) {
    this.dispatchStream.write({
      type: actionType,
      payload: payload
    })
  }

  registerStore(id, store) {
    if (!(store instanceof Store)) {
      store = new store()
    }
    // initialize the store's stream
    store.initialize()
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
