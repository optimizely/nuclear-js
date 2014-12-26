var Immutable = require('immutable')
var logging = require('./logging')
var ChangeObserver = require('./change-observer')
var Getter = require('./getter')
var KeyPath = require('./key-path')
var Evaluator = require('./evaluator')

// helper fns
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var each = require('./utils').each


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
    this.__state = Immutable.Map({})
    /**
     * Holds a map of id => reactor instance
     */
    this.__stores = Immutable.Map({})

    this.__evaluator = new Evaluator()
    /**
     * Change observer interface to observe certain keypaths
     * Created after __initialize so it starts with initialState
     */
    this.__changeObserver = new ChangeObserver(this.__state, this.__evaluator)
  }

  /**
   * Gets the Immutable state at the keyPath or evaluates a getter
   * @param {KeyPath|Getter} keyPathOrGetter
   * @return {*}
   */
  evaluate(keyPathOrGetter) {
    return this.__evaluator.evaluate(this.__state, keyPathOrGetter)
  }

  /**
   * Gets the coerced state (to JS object) of the reactor by keyPath
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
   * Dispatches a single message
   * @param {string} actionType
   * @param {object|undefined} payload
   */
  dispatch(actionType, payload) {
    var prevState = this.__state

    this.__state = this.__state.withMutations(state => {
      logging.dispatchStart(actionType, payload)

      // let each core handle the message
      this.__stores.forEach((store, id) => {
        var currState = state.get(id)
        var newState = store.handle(currState, actionType, payload)
        state.set(id, newState)

        logging.coreReact(id, currState, newState)
      })

      logging.dispatchEnd(state)
    })

    // write the new state to the output stream if changed
    if (this.__state !== prevState) {
      this.__changeObserver.notifyObservers(this.__state)
    }
  }

  /**
   * Attachs a store to a non-running or running nuclear reactor.  Will emit change
   * @param {string} id
   * @param {Store} store
   * @param {boolean} silent should not notify observers of state change
   */
  attachStore(id, store, silent) {
    if (this.__stores.get(id)) {
      console.warn("Store already defiend for id=" + id)
    }

    this.__stores = this.__stores.set(id, store)
    this.__state = this.__state.set(id, toImmutable(store.getInitialState()))

    if (!silent) {
      this.__changeObserver.notifyObservers(this.__state)
    }
  }

  /**
   * @param {Array.<string, Store>} stores
   * @param {boolean} silent should not notify observers of state change
   */
  attachStores(stores, silent) {
    each(stores, (store, id) => {
      this.attachStore(id, store, true)
    })
    if (!silent) {
      this.__changeObserver.notifyObservers(this.__state)
    }
  }

  /**
   * Resets the state of a reactor and returns back to initial state
   */
  reset() {
    this.__state = Immutable.Map().withMutations(state => {
      this.__stores.forEach((store, id) => {
        state.set(id, toImmutable(store.getInitialState()))
      })
    })

    this.__evaluator.reset()
    this.__changeObserver.reset(this.__state)
  }
}

module.exports = Reactor
