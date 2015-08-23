var logging = require('./logging')
var Map = require('immutable').Map
var extend = require('./utils').extend
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable

/**
 * Singular state wrapper for all reactor state
 */
class ReactorState {
  constructor(config) {
    config = config || {}
    this.debug = !!config.debug
    /**
     * The state for the whole cluster
     */
    this.dispatchId = 0
    this.state = Immutable.Map({})
    this.stores = Immutable.Map({})

    this.__evaluator = new Evaluator()
  }

  registerStores() {
    each(stores, (store, id) => {
      if (this.stores.get(id)) {
        /* eslint-disable no-console */
        console.warn('Store already defined for id = ' + id)
        /* eslint-enable no-console */
      }

      var initialState = store.getInitialState()

      if (this.debug && !isImmutableValue(initialState)) {
        throw new Error('Store getInitialState() must return an immutable value, did you forget to call toImmutable')
      }

      this.stores = this.stores.set(id, store)
      this.state = this.state.set(id, initialState)
    })

    this.notify()
  }

  handleDispatch(actionType, payload) {
    var prevState = this.state
    this.state = this.__handleAction(this.state, actionType, payload)
    if (prevState === this.state) {
      this.notify()
    }
  }

  loadState(state) {
    var prevState = this.stat
    var stateToLoad = toImmutable({}).withMutations(stateToLoad => {
      each(state, (serializedStoreState, storeId) => {
        var store = this.stores.get(storeId)
        if (store) {
          var storeState = store.deserialize(serializedStoreState)
          if (storeState !== undefined) {
            stateToLoad.set(storeId, storeState)
          }
        }
      })
    })

    this.state = this.state.merge(stateToLoad)
    if (prevState !== this.state) {
      this.notify()
    }
  }

  /**
   * Returns a plain object representing the application state
   * @return {Object}
   */
  serialize() {
    var serialized = {}
    this.stores.forEach((store, id) => {
      var storeState = this.state.get(id)
      var serializedState = store.serialize(storeState)
      if (serializedState !== undefined) {
        serialized[id] = serializedState
      }
    })
    return serialized
  }

  reset() {
    var debug = this.debug
    var prevState = this.state

    this.state = Immutable.Map().withMutations(state => {
      this.__stores.forEach((store, id) => {
        var storeState = prevState.get(id)
        var resetStoreState = store.handleReset(storeState)
        if (debug && resetStoreState === undefined) {
          throw new Error('Store handleReset() must return a value, did you forget a return statement')
        }
        if (debug && !isImmutableValue(resetStoreState)) {
          throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
        }
        state.set(id, resetStoreState)
      })
    })

    this.notify();
  }

  notify() {
    this.dispatchId++
  }

  /**
   * Reduces the current state to the new state given actionType / message
   * @param {string} actionType
   * @param {object|undefined} payload
   * @return {Immutable.Map}
   */
  __handleAction(state, actionType, payload) {
  }

  
}
