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

/**
 * Determines if a keyPath references a key that is upstream to another keyPath
 * @param {array} keyPath
 * @param {array} downstreamKeyPath
 * @return {boolean}
 * @example
 * isUpstream(['some', 'keypath'], ['some', 'keypath', 'with depth']) // => true
 * isUpstream(['some', 'keypath'], ['some', 'other', 'keypath']) // => false
 */
exports.isUpstream = function isUpstream(keyPath, downstreamKeyPath) {
  if (!isKeyPath(keyPath) || !isKeyPath(downstreamKeyPath)) {
    return false
  }

  var i = 0
  var len = keyPath.length

  if (len >= downstreamKeyPath.length) {
    return false
  }

  while (i < len) {
    if (keyPath[i] !== downstreamKeyPath[i]) {
      return false
    }

    i++
  }

  return true
}
