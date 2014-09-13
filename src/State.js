var Immutable = require('immutable')
var isArray = require('./utils').isArray
var isFunction = require('./utils').isFunction
var coerceKeyPath = require('./utils').keyPath


/**
 * Basic state model that Stores inherit from
 */
class State {
  constructor(initialState) {
    this.state = Immutable.fromJS(initialState || {})
  }

  getState() {
    return this.state
  }

  /**
   * Gets the state at a keypath
   * @param {string|array} keyPath
   * @return {Immutable.Map}
   */
  get(keyPath) {
    return this.state.getIn(coerceKeyPath(keyPath))
  }

  /**
   * Removes an item in the map by keyPath
   * @param {array|string} key
   */
  remove(key) {
    var keyPath = coerceKeyPath(key)
    this.state = this.state.updateIn(keyPath, toRemove => {
      toRemove.remove()
    })
  }

  /**
   * Sets a property on the state
   * @param {array|string|number} keyPathOrFn
   * @param {any} val
   */
  update(key, val) {
    var keyPath = coerceKeyPath(key)
    var updateFn = (isFunction(val)) ? val : function(data) {
      return Immutable.fromJS(val)
    }
    this.state = this.state.updateIn(keyPath, updateFn)
  }

  /**
   * Sets the state as mutable and allows batch updates to the state
   * object via this.update/this.remove/this.get etc
   */
  mutate(transformFn) {
    this.state.asMutable()
    transformFn.call(this)
    this.state.asImmutable()
  }
}

module.exports = State
