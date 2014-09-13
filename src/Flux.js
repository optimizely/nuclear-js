var through = require('through')
var Store = require('./Store');
var utils = require('./utils')
var StoreWatcher = require('./StoreWatcher')
var createTransformStream = require('./create-transform-stream')

class Flux {
  constructor() {
    this.__computeds = {}
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

  /**
   * Hooks a Store up to receive all actions dispatched on the system
   */
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
   * Registers a computed stream on the flux instance
   * by a transform function that accepts an input stream
   * and must pipe to an output stream
   * @param {string} id
   * @param {array<string>} storePaths
   * @param {function(inputStream, outputStream)} transform
   */
  registerComputed(id, storePaths, transform) {
    var outputStream = createTransformStream()
    this.__computeds[id] = outputStream
    var inputStream = this.createComputedStream.apply(this, storePaths)
    transform(inputStream, outputStream)
  }

  /**
   * Gets a computed stream
   * @param {string} id
   */
  computed(id) {
    return this.__computeds[id]
  }

  /**
   * Gets the state from the corresponding store
   * storePath 'Entity.experiments.1' corresponds to EntityStore.getState(['experiments'], 1])
   * @param {string} storePath
   * @return {*}
   */
  getState(storePath) {
    var path = utils.keyPath(storePath)
    if (path.length === 1) {
      return this.getStore(path[0]).getState()
    } else {
      return this.getStore(path[0]).get(path.slice(1))
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
