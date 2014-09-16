var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var calculateComputeds = require('./computed').calculate
var ComputedEntry = require('./computed').ComputedEntry

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
    this.__changeObserver = null
  }

  initialize() {
    // extending classes implement to setup action handlers
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
   *
   * @return {Immutable.Map}
   */
  computed(keyPath, deps, computeFn) {
    var keyPathString = coerceKeyPath(keyPath).join('.')

    if (this.__computeds[keyPathString]) {
      throw new Error("Already a computed at " + keyPathString)
    }

    this.__computeds[keyPathString] = new ComputedEntry(keyPaths, deps, computeFn)
  }

  /**
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  react(state, type, payload) {
    var handler = this.__handlers[type];

    if (typeof handler === 'function') {
      newState = handler.call(this, state, payload, type);
    }

    // calculate computeds
    each(this.__computeds, (entry) => {
      newState = computed.calculate(state, newState, entry)
    })

    return newState
  }
}

module.exports = Reactor
