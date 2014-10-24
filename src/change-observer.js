var Getter = require('./getter')
var hasChanged = require('./has-changed')
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
      this.__changeHandlers.forEach(getter => {
        // use a getter here to store dependencies and the evaluate function
        // takes the values dep values and calls a function that causes side effects
        if (hasChanged(this.__prevState, currState, getter.deps)) {
          getter.evaluate(currState)
        }
      })
      this.__prevState = currState
    })
  }

  /**
   * Specify an array of keyPaths as dependencies and
   * a changeHandler fn
   * @param {array<array<string>|string>} deps
   * @param {Function} changeHandler
   */
  onChange(deps, changeHandler) {
    deps = coerceArray(deps)
    this.__changeHandlers.push(Getter({
      deps: deps,
      compute: changeHandler
    }))
  }

  /**
   * Clean up
   */
  destroy() {
    this.__unlistenFn()
  }
}

module.exports = ChangeObserver
