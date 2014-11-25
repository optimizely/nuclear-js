var Immutable = require('immutable')
var Map = require('immutable').Map
var Getter = require('./getter')
var evaluate = require('./evaluate')
var hasChanged = require('./has-changed')

var KeyPath = require('./key-path')
var each = require('./utils').each
var toImmutable = require('./immutable-helpers').toImmutable

/**
 * Stores define how a certain domain of the application should respond to actions
 * taken on the whole system.  They manage their own section of the entire app state
 * and have no knowledge about the other parts of the application state.
 */
class Store {
  constructor(config) {
    if (!(this instanceof Store)) {
      return new Store(config)
    }

    this.__handlers = Map({})
    this.__computeds = Map({})

    // extend the config on the object
    each(config, (fn, prop) => {
      this[prop] = fn
    })

    this.initialize()
  }

  /**
   * This method is overriden by extending classses to setup message handlers
   * via `this.on` and to set up the initial state
   *
   * Anything returned from this function will be coerced into an ImmutableJS value
   * and set as the initial state for the part of the ReactorCore
   */
  initialize() {
    // extending classes implement to setup action handlers
  }

  /**
   * Overridable method to get the initial state for this type of store
   */
  getInitialState() {
    return Map()
  }

  /**
   * Gets the initial state plus executes any registered computeds
   */
  getInitialStateWithComputeds() {
    var initialState = toImmutable(this.getInitialState())
    return this.executeComputeds(Map(), initialState)
  }

  /**
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  handle(state, type, payload) {
    var handler = this.__handlers.get(type)

    if (typeof handler === 'function') {
      var newState = toImmutable(handler.call(this, state, payload, type))
      return this.executeComputeds(state, newState)
    }

    return state
  }

  /**
   * Binds an action type => handler
   */
  on(actionType, handler) {
    this.__handlers = this.__handlers.set(actionType, handler)
  }

  /**
   * Registers a local computed to this component.
   * These computeds are calculated after every react happens on this State.
   *
   * These computeds keyPaths are relative to the local state passed to react,
   * not the entire app state.
   *
   * @param {array|string} path to register the computed
   * @param {Getter|array} getterArgs
   */
  computed(path, getterArgs) {
    var keyPath = KeyPath(path)
    if (this.__computeds.get(keyPath)) {
      throw new Error("Already a computed at " + keyPath)
    }

    var computed = Getter.fromArgs(getterArgs)
    this.__computeds = this.__computeds.set(keyPath, computed)
  }

  /**
   * Executes the registered computeds on a passed in state object
   * @param {Immutable.Map|*} prevState
   * @param {Immutable.Map|*} state
   * @return {Immutable.Map|*}
   */
  executeComputeds(prevState, state) {
    if (this.__computeds.size === 0) {
      return state
    }

    return state.withMutations(state => {
      this.__computeds.forEach((computed, keyPath) => {
        if (hasChanged(prevState, state, computed.flatDeps)) {
          state.setIn(keyPath, evaluate(state, computed))
        }
      })
      return state
    })
  }
}

function isStore(toTest) {
  return (toTest instanceof Store)
}

module.exports = Store

module.exports.isStore = isStore
