var Immutable = require('immutable')
var createReactMixin = require('./create-react-mixin')
var ReactorState = require('./reactor/reactor-state')
var fns = require('./reactor/fns')
var evaluate = require('./reactor/evaluate')
var Getter = require('./getter')
var KeyPath = require('./key-path')

// helper fns
var toJS = require('./immutable-helpers').toJS


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

    var initialReactorState = new ReactorState({
      debug: config.debug
    })
    this.prevReactorState = initialReactorState
    this.reactorState = initialReactorState

    this.ReactMixin = createReactMixin(this)

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
    var evaluateResult = evaluate(this.reactorState, keyPathOrGetter)
    this.__changed(evaluateResult.reactorState)
    return evaluateResult.result
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
    var observeResult = fns.addObserver(this.reactorState, getter, handler)
    this.__changed(observeResult.reactorState)

    return observeResult.unwatchFn
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

    try {
      this.__changed(fns.dispatch(this.reactorState, actionType, payload))
    } catch (e) {
      this.__isDispatching = false
      throw e
    }


    if (this.__batchDepth > 0) {
      this.__batchDispatchCount++
    }

    try {
      this.__notify()
    } finally {
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
    this.batch(() => {
      this.registerStores(stores)
    })
  }

  /**
   * @param {Store[]} stores
   */
  registerStores(stores) {
    this.__changed(fns.registerStores(this.reactorState, stores))
    this.__notify()
  }

  /**
   * Returns a plain object representing the application state
   * @return {Object}
   */
  serialize() {
    return this.reactorState.serialize()
  }

  /**
   * @param {Object} state
   */
  loadState(state) {
    this.__changed(fns.loadState(this.reactorState, state))
    this.__notify()
  }

  /**
   * Resets the state of a reactor and returns back to initial state
   */
  reset() {
    var newState = fns.reset(this.reactorState)
    this.reactorState = newState
    this.prevReactorState = newState
  }

  /**
   * Notifies all change observers with the current state
   * @private
   */
  __notify() {
    if (this.__batchDepth <= 0) {
      // side-effects of notify all observers
      var nextReactorState = fns.notify(this.prevReactorState, this.reactorState)

      this.prevReactorState = nextReactorState
      this.reactorState = nextReactorState
    }
  }

  /**
   * @param {ReactorState} reactorState
   */
  __changed(reactorState) {
    this.reactorState = reactorState
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
