


/**
 * Gets the state at a keypath
 * @param {string|array} keyPath
 * @return {Immutable.Map}
 */
function get(state, keyPath) {
  return state.getIn(coerceKeyPath(keyPath))
}

/**
 * Removes an item in the map by keyPath
 * @param {array|string} key
 */
function remove(state, key) {
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
function update(state, key, val) {
  var keyPath = coerceKeyPath(key)
  var updateFn = (isFunction(val)) ? val : function(data) {
    return Immutable.fromJS(val)
  }
  return state.updateIn(keyPath, updateFn)
}

/**
 * Helper function to do state.withMutations
 * @param {Immutable.Seq}
 * @param {Function} fn
 */
function mutate(state, fn) {
  return state.withMutations(fn)
}

exports.mutate = mutate
exports.remove = remove
exports.update = update
exports.get = get
