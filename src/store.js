import { Map } from 'immutable'
import { toFactory, extend } from './utils'
import { toJS, toImmutable } from './immutable-helpers'

/**
 * Stores define how a certain domain of the application should respond to actions
 * taken on the whole system.  They manage their own section of the entire app state
 * and have no knowledge about the other parts of the application state.
 */
class Store {
  constructor(config) {
    this.__handlers = Map({})

    if (config) {
      // allow `MyStore extends Store` syntax without throwing error
      extend(this, config)
    }

    this.initialize()
  }

  /**
   * This method is overridden by extending classes to setup message handlers
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
    const handler = this.__handlers.get(type)

    if (typeof handler === 'function') {
      return handler.call(this, state, payload, type)
    }

    return state
  }

  /**
   * Pure function taking the current state of store and returning
   * the new state after a NuclearJS reactor has been reset
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
    this.__handlers = this.__handlers.set(actionType, handler)
  }

  /**
   * Serializes store state to plain JSON serializable JavaScript
   * Overridable
   * @param {*}
   * @return {*}
   */
  serialize(state) {
    return toJS(state)
  }

  /**
   * Deserializes plain JavaScript to store state
   * Overridable
   * @param {*}
   * @return {*}
   */
  deserialize(state) {
    return toImmutable(state)
  }
}

export function isStore(toTest) {
  return (toTest instanceof Store)
}

export default toFactory(Store)
