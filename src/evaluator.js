var Immutable = require('immutable')
var helpers = require('./immutable-helpers')
var isImmutable = helpers.isImmutable
var toImmutable = helpers.toImmutable
var hashCode = require('./hash-code')
var unwrapDeps = require('./getter').unwrapDeps
var isEqual = require('./is-equal')
var getComputeFn = require('./getter').getComputeFn
var getDeps = require('./getter').getDeps
var isKeyPath = require('./key-path').isKeyPath
var isGetter = require('./getter').isGetter
var isObject = require('./utils').isObject
var isArray = require('./utils').isArray
var cloneDeep = require('./utils').cloneDeep


/**
 * Dereferences a value, if its a mutable value makes a copy
 */
function deref(val) {
  if (isImmutable(val)) {
    // cache hit
    return val
  } else if (isArray(val) || isObject(val)){
    // its a mutable value so clone it deep
    return cloneDeep(val)
  } else {
    // its a plain JS immutable type, eg: string, number
    return val
  }
}

class Evaluator {
  constructor() {
    /**
     * Mains a list of cached getters
     *
     * {
     *   <hashCode>: {
     *     prevArgs: Immutable.List,
     *     prevValue: any,
     *     currStateHashCode: number,
     *     currArgs: any,
     *     currValue: Immutable.List,
     *   }
     * }
     *
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
   * @param {boolean} track whether the dep should be tracked for caching / performance
   */
  evaluate(state, keyPathOrGetter, track) {
    if (isKeyPath(keyPathOrGetter)) {
      // if its a keyPath simply return
      if (state && state.getIn) {
        return state.getIn(keyPathOrGetter)
      } else {
        // account for the cases when state is a primitive value
        return state
      }
    } else if (isGetter(keyPathOrGetter)) {
      var code = hashCode(keyPathOrGetter)

      // if the value is cached for this dispatch cycle, return the cached value
      if (this.__isCached(state, keyPathOrGetter)) {
        // Cache hit
        return deref(this.__cachedGetters.getIn([code, 'currValue']))

      } else if (this.__cachedGetters.hasIn([code, 'prevValue'])) {
        var prevValue = this.__cachedGetters.getIn([code, 'prevValue'])
        var prevArgs = this.__cachedGetters.getIn([code, 'prevArgs'])
        // getter deps could still be unchanged since we only looked at the unwrapped (keypath, bottom level) deps
        var currArgs = toImmutable(getDeps(getter).every(getter => {
          return this.evaluate(state, getter, track)
        }))

        if (Immutable.is(prevArgs, currArgs)) {
          // the arguments to this getter are current identical
          if (track) {
            this.__cacheValue(state, keyPathOrGetter, prevArgs, prevValue)
          }
          return deref(prevValue)
        }
      }
      // no cache hit evaluate
      var deps = getDeps(keyPathOrGetter)
      var computeFn = getComputeFn(keyPathOrGetter)
      var args = deps.map(dep => {
        return this.evaluate(state, dep, track)
      })
      var evaluatedValue = computeFn.apply(null, args)

      if (track) {
        this.__cacheValue(state, keyPathOrGetter, args, evaluatedValue)
      }

      return evaluatedValue
    } else {
      throw new Error("evaluate must be passed a keyPath or Getter")
    }
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
      currValue: value,
      currArgs: toImmutable(args),
      currStateHashCode: state.hashCode(),
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
      this.__cachedGetters.hasIn([code, 'currValue']) &&
      this.__cachedGetters.getIn([code, 'currStateHashCode']) === state.hashCode()
    )
  }

  afterDispatch() {
    this.__cachedGetters = this.__cachedGetters.map(entry => {
      return Immutable.Map({
        prevValue: entry.get('currValue'),
        prevArgs: entry.get('currArgs'),
      })
    })
  }

  /**
   * Removes all caching about a getter
   * @param {Getter}
   */
  untrack(getter) {
    // TODO
  }

  reset() {
    this.__cachedGetters = Immutable.Map({})
  }
}

module.exports = Evaluator
