var Immutable = require('immutable')
var toImmutable = require('./immutable-helpers').toImmutable
var hashCode = require('./hash-code')
var isEqual = require('./is-equal')
var getComputeFn = require('./getter').getComputeFn
var getDeps = require('./getter').getDeps
var isKeyPath = require('./key-path').isKeyPath
var isGetter = require('./getter').isGetter

// Keep track of whether we are currently executing a Getter's computeFn
var __applyingComputeFn = false

class Evaluator {
  constructor() {
    /**
     * {
     *   <hashCode>: {
     *     stateHashCode: number,
     *     args: Immutable.List,
     *     value: any,
     *   }
     * }
     */
    this.__cachedGetters = Immutable.Map({})
  }

  /**
   * Takes either a KeyPath or Getter and evaluates
   *
   * KeyPath form:
   * ['foo', 'bar'] => state.getIn(['foo', 'bar'])
   *
   * Getter form:
   * [<KeyPath>, <KeyPath>, ..., <function>]
   *
   * @param {Immutable.Map} state
   * @param {string|array} getter
   * @return {any}
   */
  evaluate(state, keyPathOrGetter) {
    if (isKeyPath(keyPathOrGetter)) {
      // if its a keyPath simply return
      return state.getIn(keyPathOrGetter)
    } else if (!isGetter(keyPathOrGetter)) {
      throw new Error('evaluate must be passed a keyPath or Getter')
    }

    // Must be a Getter
    var code = hashCode(keyPathOrGetter)

    // if the value is cached for this dispatch cycle, return the cached value
    if (this.__isCached(state, keyPathOrGetter)) {
      // Cache hit
      return this.__cachedGetters.getIn([code, 'value'])

    }

    // evaluate dependencies
    var args = getDeps(keyPathOrGetter).map(dep => this.evaluate(state, dep))

    if (this.__hasStaleValue(state, keyPathOrGetter)) {
      // getter deps could still be unchanged since we only looked at the unwrapped (keypath, bottom level) deps
      var prevArgs = this.__cachedGetters.getIn([code, 'args'])

      // since Getter is a pure functions if the args are the same its a cache hit
      if (isEqual(prevArgs, toImmutable(args))) {
        var prevValue = this.__cachedGetters.getIn([code, 'value'])
        this.__cacheValue(state, keyPathOrGetter, prevArgs, prevValue)
        return prevValue
      }
    }

    // This indicates that we have called evaluate within the body of a computeFn.
    // Throw an error as this will lead to inconsistent caching
    if (__applyingComputeFn === true) {
      __applyingComputeFn = false
      throw new Error('Evaluate may not be called within a Getters computeFn')
    }

    __applyingComputeFn = true
    var evaluatedValue = getComputeFn(keyPathOrGetter).apply(null, args)
    __applyingComputeFn = false

    this.__cacheValue(state, keyPathOrGetter, args, evaluatedValue)

    return evaluatedValue
  }

  /**
   * @param {Immutable.Map} state
   * @param {Getter} getter
   */
  __hasStaleValue(state, getter) {
    var code = hashCode(getter)
    var cache = this.__cachedGetters
    return (
      cache.has(code) &&
      cache.getIn([code, 'stateHashCode']) !== state.hashCode()
    )
  }

  /**
   * Caches the value of a getter given state, getter, args, value
   * @param {Immutable.Map} state
   * @param {Getter} getter
   * @param {Array} args
   * @param {any} value
   */
  __cacheValue(state, getter, args, value) {
    var code = hashCode(getter)
    this.__cachedGetters = this.__cachedGetters.set(code, Immutable.Map({
      value: value,
      args: toImmutable(args),
      stateHashCode: state.hashCode(),
    }))
  }

  /**
   * Returns boolean whether the supplied getter is cached for a given state
   * @param {Immutable.Map} state
   * @param {Getter} getter
   * @return {boolean}
   */
  __isCached(state, getter) {
    var code = hashCode(getter)
    return (
      this.__cachedGetters.hasIn([code, 'value']) &&
      this.__cachedGetters.getIn([code, 'stateHashCode']) === state.hashCode()
    )
  }

  /**
   * Removes all caching about a getter
   * @param {Getter}
   */
  untrack(getter) {
    // TODO untrack all depedencies
  }

  reset() {
    this.__cachedGetters = Immutable.Map({})
  }
}

module.exports = Evaluator
