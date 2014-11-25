var Getter = require('./getter')
var evaluate = require('./evaluate')
var hasChanged = require('./has-changed')
var coerceArray = require('./utils').coerceArray
var KeyPath = require('./key-path')
var clone = require('./utils').clone

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
    this.__prevState = initialState

    // add the change listener and store the unlisten function
    this.__unlistenFn = changeEmitter.addChangeListener(currState => {
      this.__changeHandlers.forEach(entry => {
        var prev = (entry.prefix) ? evaluate(this.__prevState, entry.prefix) : this.__prevState
        var curr = (entry.prefix) ? evaluate(currState, entry.prefix) : currState

        if (hasChanged(prev, curr, entry.getter.flatDeps)) {
          var newValue = evaluate(curr, entry.getter)
          entry.handler.call(null, newValue)
        }
      })
      this.__prevState = currState
    })
  }

  /**
   * Specify an array of keyPaths as dependencies and
   * a changeHandler fn
   *
   * options.getter
   * options.handler
   * options.prefix
   * @param {object} options
   * @return {function} unwatch function
   */
  onChange(options) {
    var entry = clone(options)
    this.__changeHandlers.push(entry)
    // return unwatch function
    return () => {
      var ind  = this.__changeHandlers.indexOf(entry)
      if (ind > -1) {
        this.__changeHandlers.splice(ind, 1)
      }
    }
  }

  /**
   * Clean up
   */
  destroy() {
    this.__unlistenFn()
  }
}

module.exports = ChangeObserver
