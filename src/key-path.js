var isArray = require('./utils').isArray
var isFunction = require('./utils').isFunction

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
var isKeyPath = exports.isKeyPath = function isKeyPath(toTest) {
  return (
    isArray(toTest) &&
    !isFunction(toTest[toTest.length - 1])
  )
}

/**
 * Determines if two keyPaths reference the same key
 * @param {array} keyPath
 * @param {array} otherKeyPath
 * @return {boolean}
 * @example
 * same(['some', 'keypath'], ['some', 'keypath']) // => true
 * same(['some', 'keypath'], ['another', 'keypath']) // => false
 */
exports.same = function same(keyPath, otherKeyPath) {
  if (!isKeyPath(keyPath) || !isKeyPath(otherKeyPath)) {
    return false
  }

  var len
  var i = len = keyPath.length

  if (len !== otherKeyPath.length) {
    return false
  }

  while (i--) {
    if (keyPath[i] !== otherKeyPath[i]) {
      return false
    }
  }

  return true
}
