var Immutable = require('immutable')
var Computed = require('./computed')
var hasChanged = require('./has-changed')

var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var toImmutable = require('./immutable-helpers').toImmutable

/**
 * In Nuclear.js ReactorCore's are the only parts of the system
 * that can manipulate state.
 *
 * The react function takes in state, action type and payload
 * and returns a new state
 */
class ReactiveState {
  constructor(config) {
    if (!(this instanceof ReactiveState)) {
      return new ReactiveState(config)
    }

    this.__handlers = Immutable.Map({})
    this.__computeds = Immutable.Map({})

    // extend the config on the object
    each(config, (fn, prop) => {
      this[prop] = fn
    })
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
   * @param {array<array<string>|string>} deps
   * @param {comptueFn} computeFn
   */
  computed(path, deps, computeFn) {
    var keyPath = coerceKeyPath(path)
    if (this.__computeds.get(keyPath)) {
      throw new Error("Already a computed at " + keyPath)
    }

    var computed = Computed(deps, computeFn)
    this.__computeds = this.__computeds.set(keyPath, computed)
  }

  /**
   * Takes a current reactor state, action type and payload
   * does the reaction and returns the new state
   */
  react(state, type, payload) {
    var handler = this.__handlers.get(type)

    if (typeof handler === 'function') {
      var newState = toImmutable(handler.call(this, state, payload, type))
      return this.executeComputeds(state, newState)
    }

    return state
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
          state.setIn(keyPath, Computed.evaluate(state, computed))
        }
      })
      return state
    })
  }
}

function isReactiveState(toTest) {
  return (toTest instanceof ReactiveState)
}

module.exports = ReactiveState

module.exports.isReactiveState = isReactiveState
