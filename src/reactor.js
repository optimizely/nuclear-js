var Immutable = require('immutable')
var logging = require('./logging')
var ChangeObserver = require('./change-observer')
var Getter = require('./getter')
var KeyPath = require('./key-path')
var Evaluator = require('./evaluator')
var createReactMixin = require('./create-react-mixin')

// helper fns
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var isImmutableValue = require('./immutable-helpers').isImmutableValue
var each = require('./utils').each


/**
 * State is stored in NuclearJS Reactors.  Reactors
 * contain a 'state' object which is an Immutable.Map
 *
 * The only way Reactors can change state is by reacting to
 * messages.  To update state, Reactor's dispatch messages to
 * all registered cores, and the core returns it's new
 * state based on the message
 */
class Reactor {
  constructor(config) {
    if (!(this instanceof Reactor)) {
      return new Reactor(config)
    }
    config = config || {}

    this.debug = !!config.debug

    this.ReactMixin = createReactMixin(this)
    /**
     * The state for the whole cluster
     */
    this.state = Immutable.Map({})
    /**
     * Holds a map of id => store instance
     */
    this.__stores = Immutable.Map({})

    this.__evaluator = new Evaluator()
    /**
     * Change observer interface to observe certain keypaths
     * Created after __initialize so it starts with initialState
     */
    this.__changeObserver = new ChangeObserver(this.state, this.__evaluator)

    // keep track of the depth of batch nesting
    this.__batchDepth = 0
    // number of dispatches in the top most batch cycle
    this.__batchDispatchCount = 0

    // keep track if we are currently dispatching
    this.__isDispatching = false
  }

  /**
   * Evaluates a KeyPath or Getter in context of the reactor state
   * @param {KeyPath|Getter} keyPathOrGetter
   * @return {*}
   */
  evaluate(keyPathOrGetter) {
    return this.__evaluator.evaluate(this.state, keyPathOrGetter)
  }

  /**
   * Gets the coerced state (to JS object) of the reactor.evaluate
   * @param {KeyPath|Getter} keyPathOrGetter
   * @return {*}
   */
  evaluateToJS(keyPathOrGetter) {
    return toJS(this.evaluate(keyPathOrGetter))
  }

  /**
   * Adds a change observer whenever a certain part of the reactor state changes
   *
   * 1. observe(handlerFn) - 1 argument, called anytime reactor.state changes
   * 2. observe(keyPath, handlerFn) same as above
   * 3. observe(getter, handlerFn) called whenever any getter dependencies change with
   *    the value of the getter
   *
   * Adds a change handler whenever certain deps change
   * If only one argument is passed invoked the handler whenever
   * the reactor state changes
   *
   * @param {KeyPath|Getter} getter
   * @param {function} handler
   * @return {function} unwatch function
   */
  observe(getter, handler) {
    if (arguments.length === 1) {
      handler = getter
      getter = Getter.fromKeyPath([])
    } else if (KeyPath.isKeyPath(getter)) {
      getter = Getter.fromKeyPath(getter)
    }
    return this.__changeObserver.onChange(getter, handler)
  }

  /**
   * Removes a change observer that has previously been set
   *
   * 1. unobserve(keyPath) Removes all observables for keyPath
   * 2. unobserve(getter) Removes all observables for getter and getter dependencies
   * 3. unobserve(keyPath|getter, handlerFn) Removes the specific handlerFn for
   *    the passed in keyPath or getter.
   *
   * @param {KeyPath|Getter} getter
   * @param {function} handler
   */
  unobserve(getter, handler) {
    this.__changeObserver.unwatch(getter, handler)
  }

  /**
   * Dispatches a single message
   * @param {string} actionType
   * @param {object|undefined} payload
   */
  dispatch(actionType, payload) {
    if (this.__batchDepth === 0) {
      if (this.__isDispatching) {
        this.__isDispatching = false
        throw new Error('Dispatch may not be called while a dispatch is in progress')
      }
      this.__isDispatching = true
    }

    var prevState = this.state

    try {
      this.state = this.__handleAction(prevState, actionType, payload)
    } catch (e) {
      this.__isDispatching = false
      throw e
    }


    if (this.__batchDepth > 0) {
      this.__batchDispatchCount++
    } else {
      if (this.state !== prevState) {
        try {
          this.__notify()
        } catch (e) {
          this.__isDispatching = false
          throw e
        }
      }
      this.__isDispatching = false
    }
  }

  /**
   * Allows batching of dispatches before notifying change observers
   * @param {Function} fn
   */
  batch(fn) {
    this.__batchStart()
    fn()
    this.__batchEnd()
  }

  /**
   * @deprecated
   * @param {String} id
   * @param {Store} store
   */
  registerStore(id, store) {
    /* eslint-disable no-console */
    console.warn('Deprecation warning: `registerStore` will no longer be supported in 1.1, use `registerStores` instead')
    /* eslint-enable no-console */
    var stores = {}
    stores[id] = store
    this.registerStores(stores)
  }

  /**
   * @param {Store[]} stores
   */
  registerStores(stores) {
    each(stores, (store, id) => {
      if (this.__stores.get(id)) {
        /* eslint-disable no-console */
        console.warn('Store already defined for id = ' + id)
        /* eslint-enable no-console */
      }

      var initialState = store.getInitialState()

      if (this.debug && !isImmutableValue(initialState)) {
        throw new Error('Store getInitialState() must return an immutable value, did you forget to call toImmutable')
      }

      this.__stores = this.__stores.set(id, store)
      this.state = this.state.set(id, initialState)
    })

    this.__notify()
  }

  /**
   * Returns a plain object representing the application state
   * @return {Object}
   */
  serialize() {
    var serialized = {}
    this.__stores.forEach((store, id) => {
      var storeState = this.state.get(id)
      var serializedState = store.serialize(storeState)
      if (serializedState !== undefined) {
        serialized[id] = serializedState
      }
    })
    return serialized
  }

  /**
   * @param {Object} state
   */
  loadState(state) {
    var stateToLoad = toImmutable({}).withMutations(stateToLoad => {
      each(state, (serializedStoreState, storeId) => {
        var store = this.__stores.get(storeId)
        if (store) {
          var storeState = store.deserialize(serializedStoreState)
          if (storeState !== undefined) {
            stateToLoad.set(storeId, storeState)
          }
        }
      })
    })

    this.state = this.state.merge(stateToLoad)
    this.__notify()
  }

  /**
   * Resets the state of a reactor and returns back to initial state
   */
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

    this.__evaluator.reset()
    this.__changeObserver.reset(this.state)
  }

  /**
   * Notifies all change observers with the current state
   * @private
   */
  __notify() {
    this.__changeObserver.notifyObservers(this.state)
  }

  /**
   * Reduces the current state to the new state given actionType / message
   * @param {string} actionType
   * @param {object|undefined} payload
   * @return {Immutable.Map}
   */
  __handleAction(state, actionType, payload) {
    return state.withMutations(state => {
      if (this.debug) {
        logging.dispatchStart(actionType, payload)
      }

      // let each store handle the message
      this.__stores.forEach((store, id) => {
        var currState = state.get(id)
        var newState

        try {
          newState = store.handle(currState, actionType, payload)
        } catch(e) {
          // ensure console.group is properly closed
          logging.dispatchError(e.message)
          throw e
        }

        if (this.debug && newState === undefined) {
          var errorMsg = 'Store handler must return a value, did you forget a return statement'
          logging.dispatchError(errorMsg)
          throw new Error(errorMsg)
        }

        state.set(id, newState)

        if (this.debug) {
          logging.storeHandled(id, currState, newState)
        }
      })

      if (this.debug) {
        logging.dispatchEnd(state)
      }
    })
  }

  __batchStart() {
    this.__batchDepth++
  }

  __batchEnd() {
    this.__batchDepth--

    if (this.__batchDepth <= 0) {
      if (this.__batchDispatchCount > 0) {
        // set to true to catch if dispatch called from observer
        this.__isDispatching = true
        try {
          this.__notify()
        } catch (e) {
          this.__isDispatching = false
          throw e
        }
        this.__isDispatching = false
      }
      this.__batchDispatchCount = 0
    }
  }
}

module.exports = Reactor
