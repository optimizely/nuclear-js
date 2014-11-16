var hasChanged = require('./has-changed')
var coerceArray = require('./utils').coerceArray
var coerceKeyPath = require('./utils').keyPath

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
  constructor(initialState, changeEmitter, prefix) {
    this.__prefix = (prefix) ? coerceKeyPath(prefix) : null;

    this.__changeHandlers = []
    // cache the current state
    this.__prevState = initialState

    // add the change listener and store the unlisten function
    this.__unlistenFn = changeEmitter.addChangeListener(currState => {
      this.__changeHandlers.forEach(entry => {
        if (hasChanged(this.__prevState, currState, entry.deps)) {
          var args = entry.deps.map(function(dep) {
            return currState.getIn(dep)
          })
          entry.handler.apply(null, args)
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
    var prefix = this.__prefix

    var deps = coerceArray(deps).map(dep => {
      var dep = coerceKeyPath(dep)
      if (prefix) {
        return prefix.concat(dep)
      }
      return dep
    })
    this.__changeHandlers.push({
      deps: deps,
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

