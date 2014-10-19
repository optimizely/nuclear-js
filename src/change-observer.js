var getChanges = require('./get-changes')
var coerceKeyPath = require('./utils').keyPath
var coerceArray = require('./utils').coerceArray

/**
 * ChangeObserver is an object that contains a set of subscriptions
 * to changes for keyPaths on a reactor
 *
 * Packaging the handlers together allows for easier cleanup
 */
class ChangeObserver {
  /**
   * @param {Immutable.Map} initialState
   * @param {EventEmitter} changeEmitter
   */
  constructor(initialState, changeEmitter) {
    this.__changeHandlers = []
    // cache the current state
    this.__prevState = initialState

    // add the change listener and store the unlisten function
    this.__unlistenFn = changeEmitter.addChangeListener(currState => {
      this.__changeHandlers.forEach(entry => {
        // if any dependency changed getChanges returns
        // an array of values for each keyPath in the map
        var changes = getChanges(
          this.__prevState,
          currState,
          entry.deps
        )
        if (changes) {
          entry.handler.apply(null, changes)
        }
      })
      this.__prevState = currState
    })
  }

  /**
   * Specify an array of keyPaths as dependencies and
   * a changeHandler fn
   * @param {array<string|array>} deps
   * @param {Function} changeHandler
   */
  onChange(deps, changeHandler) {
    deps = coerceArray(deps)
    this.__changeHandlers.push({
      deps: deps.map(coerceKeyPath),
      handler: changeHandler
    })
  }

  /**
   * Clean up
   */
  destroy() {
    this.__unlistenFn()
  }
}

module.exports = ChangeObserver
