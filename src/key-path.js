var isArray = require('./utils').isArray
var isFunction = require('./utils').isFunction

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
exports.isKeyPath = function(toTest) {
  return (
    isArray(toTest) &&
    !isFunction(toTest[toTest.length - 1])
  )
}
