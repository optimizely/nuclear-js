var coerceKeyPath = require('./utils').keyPath
/**
 * Record object of a representing a computed property
 * It holds the keyPath where the computed should be written
 * to in a map, deps - an array of keyPaths that the computed
 * is depended on, and a computeFn that is passed the values
 * of the deps and returns the computed
 */
class ComputedEntry {
  constructor(keyPath, deps, computeFn) {
    this.keyPath = coerceKeyPath(keyPath)
    this.deps = deps.map(coerceKeyPath)
    this.computeFn = computeFn
  }
}

module.exports = ComputedEntry
