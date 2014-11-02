var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath
var toImmutable = require('./immutable-helpers').toImmutable
var isImmutable = require('./immutable-helpers').isImmutable
var calculateComputed = require('./calculate-computed')

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
    this.__computeds = Immutable.Map({})
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
   * Registers a local computed to this component.
   * These computeds are calculated after every react happens on this Core.
   *
   * These computeds keyPaths are relative to the local Core state passed to react,
   * not the entire app state.
   *
   * @param {array|string} path to register the computed
   * @param {GetterRecord} getter to calculate the computed
   */
  computed(path, getter) {
    var keyPath = coerceKeyPath(path)
    if (this.__computeds.get(keyPath)) {
      throw new Error("Already a computed at " + keyPathString)
    }

    this.__computeds = this.__computeds.set(keyPath, getter)
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
    if (isImmutable(state)) {
      return state.withMutations(state => {
        this.__computeds.forEach((getter, keyPath) => {
          calculateComputed(prevState, state, keyPath, getter)
        })
        return state
      })
    } else {
      this.__computeds.forEach((getter, keyPath) => {
        calculateComputed(prevState, state, keyPath, getter)
      })
      return state
    }
  }
}

module.exports = ReactorCore
