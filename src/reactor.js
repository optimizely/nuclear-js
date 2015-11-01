import Immutable from 'immutable'
import createReactMixin from './create-react-mixin'
import fns from './reactor/fns'
import { isKeyPath } from './key-path'
import { isGetter } from './getter'
import { toJS } from './immutable-helpers'
import { toFactory } from './utils'
import { ReactorState, ObserverState } from './reactor/records'

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
    const initialReactorState = new ReactorState({
      debug: config.debug,
    })

    this.prevReactorState = initialReactorState
    this.reactorState = initialReactorState
    this.observerState = new ObserverState()

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
    let { result, reactorState } = fns.evaluate(this.reactorState, keyPathOrGetter)
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
    let { observerState, entry } = fns.addObserver(this.observerState, getter, handler)
    this.observerState = observerState
    return () => {
      this.observerState = fns.removeObserverByEntry(this.observerState, entry)
    }
  }

  unobserve(getter, handler) {
    if (arguments.length === 0) {
      throw new Error('Must call unobserve with a Getter')
    }
    if (!isGetter(getter) && !isKeyPath(getter)) {
      throw new Error('Must call unobserve with a Getter')
    }

    this.observerState = fns.removeObserver(this.observerState, getter, handler)
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
   * @param {Store[]} stores
   */
  registerStores(stores) {
    this.reactorState = fns.registerStores(this.reactorState, stores)
    this.__notify()
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
   * Notifies all change observers with the current state
   * @private
   */
  __notify() {
    if (this.__batchDepth > 0) {
      // in the middle of batch, dont notify
      return
    }

    const dirtyStores = this.reactorState.get('dirtyStores')
    if (dirtyStores.size === 0) {
      return
    }

    let observerIdsToNotify = Immutable.Set().withMutations(set => {
      // notify all observers
      set.union(this.observerState.get('any'))

      dirtyStores.forEach(id => {
        const entries = this.observerState.getIn(['stores', id])
        if (!entries) {
          return
        }
        set.union(entries)
      })
    })

    observerIdsToNotify.forEach((observerId) => {
      const entry = this.observerState.getIn(['observersMap', observerId])
      if (!entry) {
        // don't notify here in the case a handler called unobserve on another observer
        return
      }

      const getter = entry.get('getter')
      const handler = entry.get('handler')

      const prevEvaluateResult = fns.evaluate(this.prevReactorState, getter)
      const currEvaluateResult = fns.evaluate(this.reactorState, getter)

      this.prevReactorState = prevEvaluateResult.reactorState
      this.reactorState = currEvaluateResult.reactorState

      const prevValue = prevEvaluateResult.result
      const currValue = currEvaluateResult.result

      if (!Immutable.is(prevValue, currValue)) {
        handler.call(null, currValue)
      }
    })

    const nextReactorState = fns.resetDirtyStores(this.reactorState)

    this.prevReactorState = nextReactorState
    this.reactorState = nextReactorState
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
