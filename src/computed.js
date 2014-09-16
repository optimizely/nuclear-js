var coerceKeyPath = require('./utils').keyPath
var getChanges = require('./get-changes')
var remove = require('./immutable-helpers').remove

class ComputedEntry {
  constructor(keyPath, deps, computeFn) {
    this.keyPath = coerceKeyPath(keyPath)
    this.deps = deps.map(coerceKeyPath)
    this.computeFn = computeFn
  }
}

/**
 * Takes a prevState, currState and array of ComputedEntries
 * and returns a new state
 * @param {Immutable.Map} prevState
 * @param {Immutable.Map} currState
 * @param {ComputedEntry} entry
 * @return {Immutable.Map} new state
 */
function calculateComputed(prevState, currState, entry) {
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

  currState.cursor(keyPath, (newValue, oldValue, path) => {
    newState = newValue
    //console.log('changs', newValue.toString(), oldValue.toString(), path)
    // update function
  }).update(x => {
    return computeFn.apply(null, changes)
  })
  return newState
}

exports.calculate = calculateComputed

exports.ComputedEntry = ComputedEntry
