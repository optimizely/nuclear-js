var getChanges = require('./get-changes')
var remove = require('./immutable-helpers').remove

/**
 * Takes a prevState, currState and array of ComputedEntries
 * and returns a new state
 * @param {Immutable.Map} prevState
 * @param {Immutable.Map} currState
 * @param {ComputedEntry} entry
 * @return {Immutable.Map} new state
 */
module.exports = function calculateComputed(prevState, currState, entry) {
  var keyPath = entry.keyPath
  var deps = entry.deps
  var computeFn = entry.computeFn
  // check if the concerned paths changed since last update
  var changes = getChanges(prevState, currState, deps)
  if (!changes) {
    return currState
  }

  var isUndefined = changes.some(val => {
    return val === undefined
  })
  if (isUndefined) {
    // if something is now undefined, remove the keyPath
    return remove(currState, keyPath)
  }

  return currState.updateIn(keyPath, x => computeFn.apply(null, changes))
}
