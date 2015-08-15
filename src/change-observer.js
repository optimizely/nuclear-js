var Immutable = require('immutable')
var hashCode = require('./hash-code')
var isEqual = require('./is-equal')

/**
 * ChangeObserver is an object that contains a set of subscriptions
 * to changes for keyPaths on a reactor
 *
 * Packaging the handlers together allows for easier cleanup
 */
class ChangeObserver {
  /**
   * @param {Immutable.Map} initialState
   * @param {Evaluator} evaluator
   */
  constructor(initialState, evaluator) {
    this.__prevState = initialState
    this.__evaluator = evaluator
    this.__prevValues = Immutable.Map()
    this.__observers = []
    this.__notifyIndex = -1
  }

  /**
   * @param {Immutable.Map} newState
   */
  notifyObservers(newState) {
    if (this.__observers.length > 0) {
      var currentValues = Immutable.Map()

      // The unwatch function needs to read and modify where in the
      // iteration we are, so that removing the current or previous
      // observers does not cause us to skip observers.
      for (this.__notifyIndex = 0;
           this.__notifyIndex < this.__observers.length;
           ++this.__notifyIndex) {
        var entry = this.__observers[this.__notifyIndex]
        var getter = entry.getter
        var code = hashCode(getter)
        var prevState = this.__prevState
        var prevValue

        if (this.__prevValues.has(code)) {
          prevValue = this.__prevValues.get(code)
        } else {
          prevValue = this.__evaluator.evaluate(prevState, getter)
          this.__prevValues = this.__prevValues.set(code, prevValue)
        }

        var currValue = this.__evaluator.evaluate(newState, getter)

        if (!isEqual(prevValue, currValue)) {
          entry.handler.call(null, currValue)
          currentValues = currentValues.set(code, currValue)
        }
      }

      this.__notifyIndex = -1
      this.__prevValues = currentValues
    }
    this.__prevState = newState
  }

  /**
   * Specify a getter and a change handler function
   * Handler function is called whenever the value of the getter changes
   * @param {Getter} getter
   * @param {function} handler
   * @return {function} unwatch function
   */
  onChange(getter, handler) {
    // TODO: make observers a map of <Getter> => { handlers }
    var entry = {
      getter: getter,
      handler: handler,
    }
    this.__observers.push(entry)
    // return unwatch function
    return () => {
      // TODO: untrack from change emitter
      var ind = this.__observers.indexOf(entry)
      if (ind > -1) {
        this.__observers.splice(ind, 1)
        // If we are at or before the current notifyIndex, decrement it.
        if (ind <= this.__notifyIndex) {
          this.__notifyIndex -= 1
        }
      }
    }
  }

  /**
   * Resets and clears all observers and reinitializes back to the supplied
   * previous state
   * @param {Immutable.Map} prevState
   *
   */
  reset(prevState) {
    this.__prevState = prevState
    this.__prevValues = Immutable.Map()
    this.__observers = []
  }
}

module.exports = ChangeObserver
