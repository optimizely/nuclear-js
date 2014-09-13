var through = require('through')
var Store = require('./Store');
var utils = require('./utils')
var StoreWatcher = require('./StoreWatcher')

class Flux {
  constructor() {
    this.stores = {}
    this.actionGroups = {}
    this.dispatchStream = through()

    this.watcher = new StoreWatcher(this)
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
    store.id = id;
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

  /**
   * @param {array<string>} storePaths
   * @return {ComputedStream}
   */
  createComputedStream(...storePaths) {
    return this.watcher.createComputed(storePaths)
  }

  /**
   * Gets the state from the corresponding store
   * storePath 'Entity.experiments.1' corresponds to EntityStore.getState(['experiments'], 1])
   * @param {string} storePath
   * @return {*}
   */
  getState(storePath) {
    var exploded = storePath.split('.')
    var storeId = exploded[0]
    if (exploded.length === 1) {
      return this.getStore(storeId).get()
    } else {
      return this.getStore(storeId).get(exploded.slice(1))
    }
  }

  getStore(id) {
    return this.stores[id]
  }

  getActionGroup(id) {
    return this.actionGroups[id]
  }
}

module.exports = Flux
