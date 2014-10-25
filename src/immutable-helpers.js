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

exports.toJS = toJS
exports.toImmutable = toImmutable
exports.isImmutable = isImmutable
