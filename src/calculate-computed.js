var hasChanged = require('./has-changed')

/**
 * Takes a prevState, currState and array of ComputedEntries
 * and returns a new state
 * @param {Immutable.Map} prevState
 * @param {Immutable.Map} currState
 * @param {array<string>} keyPath
 * @param {GetterRecord} getter
 * @return {Immutable.Map} new state
 */
module.exports = function calculateComputed(prevState, currState, keyPath, getter) {
  if (!hasChanged(prevState, currState, getter.flatDeps)) {
    return currState
  }
  return currState.updateIn(keyPath, old => getter.evaluate(currState))
}
