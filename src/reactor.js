var Immutable = require('immutable')
var Map = Immutable.Map
var logging = require('./logging')
var ChangeObserver = require('./change-observer')
var ChangeEmitter = require('./change-emitter')
var evaluate = require('./evaluate')

// helper fns
var toJS = require('./immutable-helpers').toJS
var coerceKeyPath = require('./utils').keyPath
var coerceArray = require('./utils').coerceArray
var each = require('./utils').each
var partial = require('./utils').partial


/**
 * In Nuclear Reactors are where state is stored.  Reactors
 * contain a "state" object which is an Immutable.Map
 *
 * The only way Reactors can change state is by reacting to
 * messages.  To update staet, Reactor's dispatch messages to
 * all registered cores, and the core returns it's new
 * state based on the message
 */
class Reactor {
  constructor(config) {
    if (!(this instanceof Reactor)) {
      return new Reactor(config)
    }
    config = config || {}

    /**
     * The state for the whole cluster
     */
    this.state = Immutable.Map({})
    /**
     * Event bus that emits a change event anytime the state
     * of the system changes
     */
    this.__changeEmitter = new ChangeEmitter()
    /**
     * Change observer interface to observe certain keypaths
     * It gets populated in initialize to capture initial state
     */
    this.__changeObsever
    /**
     * Holds a map of id => reactor instance
     */
    this.__stores = Immutable.Map({})

    this.__initialize(config)
  }

  /**
   * Gets the Immutable state at the keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  get(keyPath) {
    return evaluate(this.state, keyPath, this)
  }

  /**
   * Gets the coerced state (to JS object) of the reactor by keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  getJS(keyPath) {
    return toJS(this.get(keyPath))
  }

  /**
   * Returns a faux-reactor cursor to a specific keyPath
   * This prefixes all `get` and `getJS` operations with a keyPath
   *
   * dispatch still dispatches to the entire reactor
   */
  cursor(keyPath) {
    var reactor = this
    var prefix = coerceKeyPath(keyPath)

    var prefixKeyPath = function(path) {
      path = path || []
      return prefix.concat(coerceKeyPath(path))
    }

    return {
      get: function(keyPath) {
        return evaluate(reactor.get(prefix), keyPath)
      },

      getJS: reactor.getJS,

      dispatch: reactor.dispatch.bind(reactor),

      onChange: function(deps, handler) {
        if (arguments.length === 1) {
          return reactor.onChange([prefix], deps)
        }
        var deps = coerceArray(deps).map(prefixKeyPath)
        return reactor.onChange(deps, handler)
      },

      createChangeObserver: reactor.createChangeObserver.bind(reactor, prefix),

      cursor: function(keyPath) {
        return reactor.cursor.call(reactor, prefixKeyPath(keyPath))
      }
    }
  }

  /**
   * Dispatches a single message
   * @param {string} messageType
   * @param {object|undefined} payload
   */
  dispatch(messageType, payload) {
    var prevState = this.state

    this.state = this.state.withMutations(state => {
      logging.dispatchStart(messageType, payload)

      // let each core handle the message
      this.__stores.forEach((store, id) => {
        var currState = state.get(id)
        var newState = store.handle(currState, messageType, payload)
        state.set(id, newState)

        logging.coreReact(id, currState, newState)
      })

      logging.dispatchEnd(state)
    })

    // write the new state to the output stream if changed
    if (this.state !== prevState) {
      this.__changeEmitter.emitChange(this.state, messageType, payload)
    }
  }

  /**
   * Attachs a store to a non-running or running nuclear reactor.  Will emit change
   * @param {string} id
   * @param {Store} store
   * @param {boolean} silent whether to emit change
   */
  attachStore(id, store, silent) {
    if (this.__stores.get(id)) {
      throw new Error("Store already defined for id=" + id)
    }

    this.__stores = this.__stores.set(id, store)

    this.state = this.state.set(id, store.getInitialStateWithComputeds())

    if (!silent) {
      this.__changeEmitter.emitChange(this.state, 'ATTACH_STORE', {
        id: id,
        store: store
      })
    }
  }

  /**
   * Adds a change handler whenever certain deps change
   * If only one argument is passed invoked the handler whenever
   * the reactor state changes
   *
   * TODO: standardize changeEmitter and changeObserver handler arguments
   * current changeObserver passes applies the values of the keypaths and
   * changeEmitter applies [state, messageType, payload]
   * @param {array<array<string>|string>} deps
   * @param {function} handler
   * @return {function} unwatch function
   */
  onChange(deps, handler) {
    if (arguments.length === 1) {
      return this.__changeEmitter.addChangeListener(deps)
    }
    return this.__changeObsever.onChange(deps, handler)
  }

  /**
   * Creates an instance of the ChangeObserver for this reactor
   *
   * Allows the creation of changeHandlers for a keyPath on this reactor,
   * while providing a single method call to destroy and cleanup
   *
   * @return {ChangeObserver}
   */
  createChangeObserver(prefix) {
    return new ChangeObserver(this.state, this.__changeEmitter, prefix)
  }

  /**
   * Will set the state of a specific store or the entire reactor if storeId isn't present
   * @param {string?} storeId
   * @param {Immutable.Map} state
   */
  loadState(storeId, state) {
    if (arguments.length === 1) {
      // handle the case of loading the entire app state
      state = storeId
      if (!Immutable.Map.isMap(state)) {
        throw new Error("Must pass Immutable.Map to loadState")
      }

      // update each store with the computed state derived from the store state
      // that is being loaded
      this.state = state.withMutations(state => {
        state.forEach((storeState, storeId) => {
          var store = this.__stores.get(storeId)
          if (store) {
            state.set(storeId, store.executeComputeds(Map(), storeState))
          }
        })
      })
    } else {
      // loading a single stores state, execute computeds to ensure syncing
      var store = this.__stores.get(storeId)
      var newState = store.executeComputeds(Map(), state)
      this.state = this.state.set(storeId, newState)
    }

    this.__changeEmitter.emitChange(this.state, 'LOAD_STATE', {
      args: Array.prototype.slice.call(arguments)
    })
  }

  /**
   * Resets the state of a reactor and returns back to initial state
   */
  reset() {
    this.state = Immutable.Map()

    this.state = this.state.withMutations(state => {
      this.__stores.forEach((store, id) => {
        state.set(id, store.getInitialStateWithComputeds())
      })
    })

    this.resetChangeListeners()
  }

  /**
   * Takes an object of action functions that have `reactor` as the first argument
   * and returns an object with all the functions partialed
   * @param {object}
   * @return {object}
   */
  bindActions(actionGroup) {
    var group = {}
    each(actionGroup, (fn, name) => {
      group[name] = partial(fn, this)
    })
    return group
  }

  /**
   * Resets all change listeners and cleans up any straggling event handlers
   */
  resetChangeListeners() {
    this.__changeEmitter.removeAllListeners()
    this.__changeObsever = this.createChangeObserver()
  }

  /**
   * Initializes all stores
   * This method can only be called once per reactor
   * @param {object} config
   */
  __initialize(config) {
    if (config.stores) {
      each(config.stores, (store, id) => {
        this.attachStore(id, store, false)
      })
    }

    /**
     * Change observer interface to observe certain keypaths
     */
    this.__changeObsever = this.createChangeObserver()
  }
}

module.exports = Reactor
