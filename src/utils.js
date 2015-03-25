var _ = require('lodash');

exports.each = _.each

exports.partial = _.partial

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
 * Checks if the passed in value is a function
 * @param {*} val
 * @return {boolean}
 */
exports.isFunction = function(val) {
  return toString.call(val) === '[object Function]'
}

/**
 * Checks if the passed in value is af type Object
 * @param {*} val
 * @return {boolean}
 */
exports.isObject = function(obj) {
  var type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

/**
 * Extends an object with the properties of additional objects
 * @param {object} obj
 * @param {object} objects
 * @return {object}
 */
exports.extend = function(obj) {
  var length = arguments.length

  if (!obj || length < 2) return obj || {}

  for (var index = 1; index < length; index++) {
    var source = arguments[index]
    var keys = Object.keys(source)
    var l = keys.length

    for (var i = 0; i < l; i++) {
      var key = keys[i]
      obj[key] = source[key]
    }
  }

  return obj
}

/**
 * Creates a shallow clone of an object
 * @param {object} obj
 * @return {object}
 */
exports.clone = function(obj) {
  if (!exports.isObject(obj)) return obj
  return exports.isArray(obj) ? obj.slice() : exports.extend({}, obj)
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
