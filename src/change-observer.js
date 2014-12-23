var Immutable = require('immutable')
var Getter = require('./getter')
var hashCode = require('./hash-code')
var clone = require('./utils').clone
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
    this.__prevValues = Immutable.Map({})
    this.__observers = []
  }

  /**
   * @param {Immutable.Map} newState
   */
  notifyObservers(newState) {
    this.__observers.forEach(entry => {
      var getter = entry.getter
      var code = hashCode(getter)
      var prevState = this.__prevState
      var prevValue

      if (this.__prevValues.has(code)) {
        prevValue = this.__prevValues.get(code)
      } else {
        prevValue = this.__evaluator.evaluate(prevState, getter, true)
        this.__prevValues.set(code, prevValue)
      }

      var currValue = this.__evaluator.evaluate(newState, getter, true)

      if (!isEqual(prevValue, currValue)) {
        entry.handler.call(null, currValue)
      }

      this.__prevValues.set(code, currValue)
    })
    this.__prevState = newState
  }

  /**
   * Specify an getter and a change handler fn
   * Handler function is called whenever the value of the getter changes
   * @param {object} options
   * @param {Getter} options.getter
   * @param {function} options.handler
   * @return {function} unwatch function
   */
  onChange(options) {
    var entry = clone(options)
    // TODO make observers a map of <Getter> => { handlers }
    this.__observers.push(entry)
    // return unwatch function
    return () => {
      // TODO untrack from change emitter
      var ind  = this.__observers.indexOf(entry)
      if (ind > -1) {
        this.__observers.splice(ind, 1)
      }
    }
  }

  /**
   * Resets and clears all observers and reinitializes back to the supplied
   * previous state
   * @param {Immutable.Map} prevState
   *
   */
  reset(prevState, evaluator) {
    this.__prevState = prevState
    this.__prevValues = Immutable.Map({})
    this.__evaluator = evaluator
    this.__observers = []
  }
}

module.exports = ChangeObserver
