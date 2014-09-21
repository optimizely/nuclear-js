var _ = require('underscore');

exports.clone = _.clone

exports.extend = _.extend

exports.each = _.each

exports.isArray = _.isArray

exports.isFunction = _.isFunction

/**
 * Coerces a string/array into an array keypath
 */
exports.keyPath = function(val) {
  if (val === null) {
    // null is a valid keypath, returns whole map/seq
    return val
  }
  if (exports.isArray(val)) {
    return val.map(String)
  } else {
    return val.split('.')
  }
}

/**
 * Ensures that the inputted value is an array
 * @param {*} val
 * @return {array}
 */
exports.coerceArray = function(val) {
  if (!exports.isArray(val)) {
    return [val]
  }
  return val
}
