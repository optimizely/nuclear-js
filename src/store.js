var Map = require('immutable').Map
var extend = require('./utils').extend

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

    if (config) {
      // allow `MyStore extends Store` syntax without throwing error
      extend(this, config)
    }

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
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  handle(state, type, payload) {
    var result = state
    var handler = this.__handlers.get(type)

    if (typeof handler === 'function') {
      result = handler.call(this, state, payload, type)

      if (result === undefined) {
        throw new Error("Store handler must return a value, did you forget a return statement")
      }
    }

    return result
  }

  /**
   * Pure function taking the current state of store and returning
   * the new state after a Nuclear reactor has been reset
   *
   * Overridable
   */
  handleReset(state) {
    return this.getInitialState()
  }

  /**
   * Binds an action type => handler
   */
  on(actionType, handler) {
    if (!actionType) {
      throw new Error("Store.on called without a value for actionType.")
    }

    this.__handlers = this.__handlers.set(actionType, handler)
  }
}

function isStore(toTest) {
  return (toTest instanceof Store)
}

module.exports = Store

module.exports.isStore = isStore
