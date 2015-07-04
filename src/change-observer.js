var Immutable = require('immutable')
var KeyPath = require('./key-path')
var Getter = require('./getter')
var hashCode = require('./hash-code')
var isEqual = require('./is-equal')
var each = require('./utils').each

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
  }

  /**
   * @param {Immutable.Map} newState
   */
  notifyObservers(newState) {
    if (this.__observers.length > 0) {
      var currentValues = Immutable.Map()

      this.__observers.slice(0).forEach(entry => {
        if (entry.unwatched) {
          return
        }
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
      })

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
    var entry
    var unwatch = () => {
      // TODO: untrack from change emitter
      var ind = this.__observers.indexOf(entry)
      if (ind > -1) {
        entry.unwatched = true
        this.__observers.splice(ind, 1)
      }
    }

    // TODO: make observers a map of <Getter> => { handlers }
    entry = {
      getter: getter,
      handler: handler,
      unwatched: false,
      unwatchFn: unwatch,
    }

    this.__observers.push(entry)

    // return unwatch function
    return unwatch
  }

  /**
   * Calls the unwatchFn for each change observer associated with the passed in
   * keypath or getter. If a handler function is passed as well, then the
   * unwatchFn is called only for the change observer that holds that handler.
   *
   * UnwatchFns are called up the dependency chain.
   *
   * @param {KeyPath|Getter} getter
   * @param {function} handler
   */
  unwatch(getter, handler) {

    // Returns unwatchFn if no handler, or if handler is the observer's handler
    // Otherwise returns `null`
    var unwatchIfShould = entry => {
      if (!handler) {
        return entry.unwatchFn
      }

      if (handler === entry.handler) {
        return entry.unwatchFn
      }

      return null
    }

    var isKeyPath = KeyPath.isKeyPath(getter)

    // Collects all the unwatchFns that need to be called, without invoking
    // them, so as to not mutate the observers collection, then invokes each.
    each(this.__observers.map(entry => {
      if (isKeyPath && Getter.wasKeyPath(entry.getter)) {
        if (KeyPath.same(getter, entry.getter[0]) || KeyPath.isUpstream(getter, entry.getter[0])) {
          return unwatchIfShould(entry)
        }
      }

      if (entry.getter === getter) {
        return unwatchIfShould(entry)
      }
    }), unwatchFn => unwatchFn && unwatchFn())
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
