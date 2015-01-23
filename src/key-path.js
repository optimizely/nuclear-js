var isFunction = require('./utils').isFunction
var flatten = require('lodash').flatten

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
exports.isKeyPath = function(toTest) {

  // make sure it's an array
  toTest = flatten([toTest])

  return (
    toTest.length &&
    !isFunction(toTest[toTest.length - 1])
  )
}
