var _ = require('lodash');

exports.clone = _.clone

exports.extend = _.extend

exports.each = _.each

exports.partial = _.partial

exports.isFunction = _.isFunction

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

/**
 * Checks if the passed in value is a number
 * @param {*} val
 * @return {boolean}
 */
exports.isNumber = function(val) {
  return typeof val == 'number' || objectToString(val) === '[object Number]'
}

/**
 * Checks if the passed in value is a string
 * @param {*} val
 * @return {boolean}
 */
exports.isString = function(val) {
  return typeof val == 'string' || objectToString(val) === '[object String]'
}

/**
 * Checks if the passed in value is an array
 * @param {*} val
 * @return {boolean}
 */
exports.isArray = Array.isArray || function(val) {
  return objectToString(val) === '[object Array]'
}

/**
 * Returns the text value representation of an object
 * @private
 * @param {*} obj
 * @return {string}
 */
function objectToString(obj) {
  return obj && typeof obj == 'object' && toString.call(obj)
}
