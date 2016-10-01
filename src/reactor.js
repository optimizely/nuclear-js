import Immutable from 'immutable'
import createReactMixin from './create-react-mixin'
import * as fns from './reactor/fns'
import { DefaultCache } from './reactor/cache'
import { ConsoleGroupLogger } from './logging'
import { isKeyPath } from './key-path'
import { isGetter, getCanonicalKeypathDeps } from './getter'
import { toJS } from './immutable-helpers'
import { extend, toFactory } from './utils'
import {
  ReactorState,
  ObserverState,
  DEBUG_OPTIONS,
  PROD_OPTIONS,
} from './reactor/records'

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
  constructor(config = {}) {
    const debug = !!config.debug
    const baseOptions = debug ? DEBUG_OPTIONS : PROD_OPTIONS
    // if defined, merge the custom implementation over the noop logger to avoid undefined lookups,
    // otherwise, just use the built-in console group logger
    let logger = config.logger ? config.logger : {}
    if (!config.logger && debug) {
      logger = ConsoleGroupLogger
    }
    const initialReactorState = new ReactorState({
      debug: debug,
      cache: config.cache || DefaultCache(),
      logger: logger,
      // merge config options with the defaults
      options: baseOptions.merge(config.options || {}),
    })

    this.prevReactorState = initialReactorState
    this.reactorState = initialReactorState
    this.observerState = new ObserverState()

    this.observerState = this.observerState.asMutable()

    this.ReactMixin = createReactMixin(this)

    // keep track of the depth of batch nesting
    this.__batchDepth = 0

    // keep track if we are currently dispatching
    this.__isDispatching = false
  }

  /**
   * Evaluates a KeyPath or Getter in context of the reactor state
   * @param {KeyPath|Getter} keyPathOrGetter
   * @return {*}
   */
  evaluate(keyPathOrGetter) {
    // look through the keypathStates and see if any of the getters dependencies are dirty, if so resolve
    // against the previous reactor state
    let updatedReactorState = this.reactorState
    if (!isKeyPath(keyPathOrGetter)) {
      const maxCacheDepth = fns.getOption(updatedReactorState, 'maxCacheDepth')
      let res = fns.resolveDirtyKeypathStates(
        this.prevReactorState,
        this.reactorState,
        getCanonicalKeypathDeps(keyPathOrGetter, maxCacheDepth)
      )
      updatedReactorState = res.reactorState
    }

    let { result, reactorState } = fns.evaluate(updatedReactorState, keyPathOrGetter)
    this.reactorState = reactorState
    return result
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
      getter = []
    }
    let entry = fns.addObserver(this.reactorState, this.observerState, getter, handler)
    return () => {
      fns.removeObserverByEntry(this.reactorState, this.observerState, entry)
    }
  }

  unobserve(getter, handler) {
    if (arguments.length === 0) {
      throw new Error('Must call unobserve with a Getter')
    }
    if (!isGetter(getter) && !isKeyPath(getter)) {
      throw new Error('Must call unobserve with a Getter')
    }

    fns.removeObserver(this.reactorState, this.observerState, getter, handler)
  }

  /**
   * Dispatches a single message
   * @param {string} actionType
   * @param {object|undefined} payload
   */
  dispatch(actionType, payload) {
    if (this.__batchDepth === 0) {
      if (fns.getOption(this.reactorState, 'throwOnDispatchInDispatch')) {
        if (this.__isDispatching) {
          this.__isDispatching = false
          throw new Error('Dispatch may not be called while a dispatch is in progress')
        }
      }
      this.__isDispatching = true
    }

    try {
      this.prevReactorState = this.reactorState
      this.reactorState = fns.dispatch(this.reactorState, actionType, payload)
    } catch (e) {
      this.__isDispatching = false
      throw e
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
    this.batchStart()
    fn()
    this.batchEnd()
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
    this.registerStores({
      [id]: store,
    })
  }

  /**
   * @param {Object} stores
   */
  registerStores(stores) {
    this.prevReactorState = this.reactorState
    this.reactorState = fns.registerStores(this.reactorState, stores)
    this.__notify()
  }

  /**
   * Replace store implementation (handlers) without modifying the app state or calling getInitialState
   * Useful for hot reloading
   * @param {Object} stores
   */
  replaceStores(stores) {
    this.reactorState = fns.replaceStores(this.reactorState, stores)
  }

  /**
   * Returns a plain object representing the application state
   * @return {Object}
   */
  serialize() {
    return fns.serialize(this.reactorState)
  }

  /**
   * @param {Object} state
   */
  loadState(state) {
    this.prevReactorState = this.reactorState
    this.reactorState = fns.loadState(this.reactorState, state)
    this.__notify()
  }

  /**
   * Resets the state of a reactor and returns back to initial state
   */
  reset() {
    const newState = fns.reset(this.reactorState)
    this.reactorState = newState
    this.prevReactorState = newState
    this.observerState = new ObserverState()
  }

  /**
   * Denotes a new state, via a store registration, dispatch or some other method
   * Resolves any outstanding keypath states and sets a new reactorState
   * @private
   */
  __nextState(newState) {
    // TODO(jordan): determine if this is actually needed
  }

  /**
   * Notifies all change observers with the current state
   * @private
   */
  __notify() {
    if (this.__batchDepth > 0) {
      // in the middle of batch, dont notify
      return
    }

    fns.getLoggerFunction(this.reactorState, 'notifyStart')(this.reactorState, this.observerState)

    const keypathsToResolve = this.observerState.get('trackedKeypaths')
    const { reactorState, changedKeypaths } = fns.resolveDirtyKeypathStates(
      this.prevReactorState,
      this.reactorState,
      keypathsToResolve,
      true // increment all dirty states (this should leave no unknown state in the keypath tracker map):
    )
    this.reactorState = reactorState

    // get observers to notify based on the keypaths that changed
    let observersToNotify = Immutable.Set().withMutations(set => {
      changedKeypaths.forEach(keypath => {
        const entries = this.observerState.getIn(['keypathToEntries', keypath])
        if (entries && entries.size > 0) {
          set.union(entries)
        }
      })
    })

    observersToNotify.forEach((observer) => {
      if (!this.observerState.get('observers').has(observer)) {
        // the observer was removed in a hander function
        return
      }
      let didCall = false

      const getter = observer.get('getter')
      const handler = observer.get('handler')

      fns.getLoggerFunction(this.reactorState, 'notifyEvaluateStart')(this.reactorState, getter)

      const prevEvaluateResult = fns.evaluate(this.prevReactorState, getter)
      const currEvaluateResult = fns.evaluate(this.reactorState, getter)

      this.prevReactorState = prevEvaluateResult.reactorState
      this.reactorState = currEvaluateResult.reactorState

      const prevValue = prevEvaluateResult.result
      const currValue = currEvaluateResult.result

      // TODO pull some comparator function out of the reactorState
      if (!Immutable.is(prevValue, currValue)) {
        handler.call(null, currValue)
        didCall = true
      }
      fns.getLoggerFunction(this.reactorState, 'notifyEvaluateEnd')(this.reactorState, getter, didCall, currValue)
    })

    fns.getLoggerFunction(this.reactorState, 'notifyEnd')(this.reactorState, this.observerState)
  }

  /**
   * Starts batching, ie pausing notifies and batching up changes
   * to be notified when batchEnd() is called
   */
  batchStart() {
    this.__batchDepth++
  }

  /**
   * Ends a batch cycle and will notify obsevers of all changes if
   * the batch depth is back to 0 (outer most batch completed)
   */
  batchEnd() {
    this.__batchDepth--

    if (this.__batchDepth <= 0) {
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
  }
}

export default toFactory(Reactor)
