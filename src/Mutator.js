var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath
var isFunction = require('./utils').isFunction

class Mutator {
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

  handle(state, type, payload) {
    var handler = this.__handlers[type];

    if (typeof handler === 'function') {
      state = handler.call(this, state, payload, type);
    }

    return state
  }

  /**
   * Gets the state at a keypath
   * @param {string|array} keyPath
   * @return {Immutable.Map}
   */
  get(state, keyPath) {
    return state.getIn(coerceKeyPath(keyPath))
  }

  /**
   * Removes an item in the map by keyPath
   * @param {array|string} key
   */
  remove(state, key) {
    var keyPath = coerceKeyPath(key)
    return state.updateIn(keyPath, toRemove => {
      toRemove.remove()
    })
  }

  /**
   * Sets a property on the state
   * @param {array|string|number} keyPathOrFn
   * @param {any} val
   */
  update(state, key, val) {
    var keyPath = coerceKeyPath(key)
    var updateFn = (isFunction(val)) ? val : function(data) {
      return Immutable.fromJS(val)
    }
    return state.updateIn(keyPath, updateFn)
  }
}

module.exports = Mutator
