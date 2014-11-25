var isArray = require('./utils').isArray
var isNumber = require('./utils').isNumber
var isString = require('./utils').isString
var isFunction = require('./utils').isFunction
/**
 * Coerces a string/array into an array keypath
 */
module.exports = function(val) {
  if (val == null || val === false) {
    // null is a valid keypath, returns whole map/seq
    return []
  }
  if (isNumber(val)) {
    return [val]
  }
  if (!isArray(val)) {
    return val.split('.')
  }
  return val
}

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
module.exports.isKeyPath = function(toTest) {
  return (
    toTest == null ||
    isNumber(toTest) ||
    isString(toTest) ||
    (isArray(toTest) && !isFunction(toTest[toTest.length - 1]))
  )
}
