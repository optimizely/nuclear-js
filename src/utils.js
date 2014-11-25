var _ = require('lodash');

exports.clone = _.clone

exports.extend = _.extend

exports.each = _.each

exports.partial = _.partial

exports.isArray = _.isArray

exports.isFunction = _.isFunction

exports.isString = _.isString

exports.isNumber = _.isNumber

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
