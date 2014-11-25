var Iterable = require('immutable').Iterable

/**
 * Takes a prevState and currState and returns true if any
 * of the values at those paths changed
 * @param {Immutable.Map} prevState
 * @param {Immutable.Map} currState
 * @param {Array<Array<String>>} keyPaths
 *
 * @return {boolean}
 */
module.exports = function(prevState, currState, keyPaths) {
  if (!Iterable.isIterable(prevState) || !Iterable.isIterable(currState)) {
    // prev or current state is some primitive
    return prevState !== currState
  }

  return keyPaths.some(function(keyPath) {
    return prevState.getIn(keyPath) !== currState.getIn(keyPath)
  })
}
