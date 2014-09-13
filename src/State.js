var Immutable = require('immutable')
var isArray = require('./utils').isArray
var coerceKeyPath = require('./utils').keyPath


class State {
  constructor(initialState) {
    this.state = Immutable.fromJS(initialState || {})
  }

  /**
   * Gets the state at a keypath
   * @param {string|array} keyPath
   * @return {Immutable.Map}
   */
  get(keyPath) {
    if (
      keyPath === undefined ||
      (isArray(keyPath) && keyPath.length === 0)
    ) {
      return this.state;
    }
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
    this.state = this.state.updateIn(coerceKeyPath(key), _ => {
      return Immutable.fromJS(val)
    })
  }

  mutate(transformFn) {
    this.state.asMutable()
    transformFn.call(this)
    this.state.asImmutable()
  }
}

module.exports = State
