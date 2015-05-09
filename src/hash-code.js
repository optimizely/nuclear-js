var Immutable = require('immutable')
var isGetter = require('./getter').isGetter

/**
 * Takes a getter and returns the hash code value
 *
 * If cache argument is true it will freeze the getter
 * and cache the hashed value
 *
 * @param {Getter} getter
 * @param {boolean} dontCache
 * @return {number}
 */
module.exports = function(getter, dontCache) {
  if (getter.hasOwnProperty('__hashCode')) {
    return getter.__hashCode
  }

  var hashCode = Immutable.fromJS(getter).hashCode()

  if (!dontCache) {
    Object.defineProperty(getter, '__hashCode', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashCode,
    })

    Object.freeze(getter)
  }

  return hashCode
}
