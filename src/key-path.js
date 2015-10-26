import Immutable from 'immutable'
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

/**
 * Checks if two keypaths are equal by value
 * @param {KeyPath} a
 * @param {KeyPath} a
 * @return {Boolean}
 */
exports.isEqual = function(a, b) {
  const iA = Immutable.List(a)
  const iB = Immutable.List(b)

  return Immutable.is(iA, iB)
}
