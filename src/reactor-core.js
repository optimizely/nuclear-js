var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var toImmutable = require('./immutable-helpers').toImmutable
var calculateComputed = require('./calculate-computed')
var ComputedEntry = require('./computed-entry')

/**
 * In Nuclear.js ReactorCore's are the only parts of the system
 * that can manipulate state.
 *
 * The react function takes in state, action type and payload
 * and returns a new state
 */
class ReactorCore {
  constructor() {
    this.__handlers = {}
    this.__computeds = {}
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

  getInitialState() {
    return Immutable.Map()
  }

  /**
   * Binds an action type => handler
   */
  on(actionType, handler) {
    this.__handlers[actionType] = handler
  }

  /**
   * Registers a computed with at a certain keyPath
   * @param {array|string} keyPath to register the computed
   * @param {array} deps to calculate the computed
   * @param {function} computeFn handed the deps and returns the computed value
   */
  computed(keyPath, deps, computeFn) {
    var keyPathString = coerceKeyPath(keyPath).join('.')

    if (this.__computeds[keyPathString]) {
      throw new Error("Already a computed at " + keyPathString)
    }

    this.__computeds[keyPathString] = new ComputedEntry(keyPath, deps, computeFn)
  }

  /**
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  react(state, type, payload) {
    var handler = this.__handlers[type];

    if (typeof handler === 'function') {
      var newState = toImmutable(handler.call(this, state, payload, type))
      return this.executeComputeds(state, newState)
    }

    return state
  }

  /**
   * Executes the registered computeds on a passed in state object
   * @param {Immutable.Map}
   * @return {Immutable.Map}
   */
  executeComputeds(prevState, state) {
    return state.withMutations(state => {
      each(this.__computeds, entry => {
        calculateComputed(prevState, state, entry)
      })
      return state
    })
  }
}

module.exports = ReactorCore
