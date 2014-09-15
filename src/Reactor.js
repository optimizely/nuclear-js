var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath
var isFunction = require('./utils').isFunction

/**
 * In Nuclear.js reactors are the only parts of the system
 * that can manipulate state.
 *
 * The react function takes in state, action type and payload
 * and returns a new state
 */
class Reactor {
  constructor() {
    this.__handlers = {}
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
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  react(state, type, payload) {
    var handler = this.__handlers[type];

    if (typeof handler === 'function') {
      state = handler.call(this, state, payload, type);
    }

    return state
  }
}

module.exports = Reactor
