var coerceKeyPath = require('./utils').keyPath
var isFunction = require('./utils').isFunction
var Immutable = require('immutable')

/**
 * A collection of helpers for the ImmutableJS library
 */

/**
 * @param {*} obj
 * @return {boolean}
 */
function isImmutable(obj) {
  return (obj instanceof Immutable.Sequence)
}

/**
 * Removes an item in the map by keyPath
 * @param {array|string} key
 */
function remove(state, key) {
  var keyPath = coerceKeyPath(key)
  var removeKey = keyPath.splice(keyPath.length - 1, 1)[0]
  //console.log('removing', state.toString(), keyPath, removeKey)
  return state.updateIn(keyPath, toRemove => {
    return toRemove.remove(removeKey)
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
 * Converts an Immutable Sequence to JS object
 * Can be called on any type
 */
function toJS(arg) {
  // arg instanceof Immutable.Sequence is unreleable
  return (isImmutable(arg))
    ? arg.toJS()
    : arg;
}

/**
 * Converts a JS object to an Immutable object, if it's
 * already Immutable its a no-op
 */
function toImmutable(arg) {
  return (isImmutable(arg))
    ? arg
    : Immutable.fromJS(arg)
}

exports.remove = remove
exports.update = update
exports.toJS = toJS
exports.toImmutable = toImmutable
exports.isImmutable = isImmutable
