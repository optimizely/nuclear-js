var Immutable = require('immutable')
var isGetter = require('./getter').isGetter
var isKeyPath = require('./key-path').isKeyPath

/**
 * Takes a getter and returns the hash code value
 *
 * If cache argument is true it will freeze the getter
 * and cache the hashed value
 */
module.exports = function(keyPathOrGetter, dontCache) {
  if (!isGetter(keyPathOrGetter) && !isKeyPath(keyPathOrGetter)) {
    throw new Error("Invalid getter!  Must be of the form: [<KeyPath>, ...<KeyPath>, <function>]")
  }

  if (keyPathOrGetter.hasOwnProperty('__hashCode')) {
    return keyPathOrGetter.__hashCode
  }

  var hashCode = Immutable.fromJS(keyPathOrGetter).hashCode()

  if (!dontCache) {
    Object.defineProperty(keyPathOrGetter, '__hashCode', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashCode,
    })

    Object.freeze(keyPathOrGetter)
  }

  return hashCode
}
