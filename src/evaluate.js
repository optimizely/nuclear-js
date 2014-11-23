var Store = require('./store')
var isArray = require('./utils').isArray
var isString = require('./utils').isString
var isNumber = require('./utils').isNumber
var coerceKeyPath = require('./utils').keyPath

/**
 * General purpose getter function
 */

/**
 * Getter forms:
 * 'foo.bar'
 * ['foor', 'bar']
 * [Store, 'foo', 'bar'] where Store has an `id` property
 * ['foo', 'bar', function(fooValue, barValue) {...}]
 * [['foo.bar'], 'baz', function(foobarValue, bazValue) {...}]
 * [[Store, 'foo', 'bar', ['foo.bar'], 'baz', function(Store.foo.bar, foobarValue, bazValue) {...}]
 *
 * @param {Immutable.Map} state
 * @param {string|array} getter
 */
module.exports = function get(state, getter, reactor) {
  if (getter == null || getter === false) {
    return state
  }

  if (isNumber(getter)) {
    return state.get(getter)
  }

  if (!isArray(getter)) {
    return state.getIn(coerceKeyPath(getter))
  }

  if (isGetter(getter)) {
    return evaluateGetter(state, getter, reactor)
  } else {
    path = normalizeKeyPath(state, getter, reactor)
    if (Store.isStore(path[0])) {
      // deps is just a store, call store.get()
      return path[0].get()
    } else {
      return state.getIn(path)
    }
  }
}


/**
 * Normalizes a keyPath
 * [Store1] => [Store1]
 * ['store1'] => [Store1] // returns reference to store if given a store ID and reactor
 *
 */
function normalizeKeyPath(state, getter, reactor) {
  var store
  if (isArray(getter) && getter.length === 1 && reactor) {
    // special case [Store] and ['store1']
    if (isString(getter[0]) && Store.isStore(reactor[getter[0]])) {
      store = reactor[getter[0]]
    } else if (Store.isStore(getter[0])) {
      store = store
    } else {
      throw new Error("First part of a Getter must reference a Store ID")
    }
    // the getter points to a store need to return the actual store
    // instead of its state value
    return [store]
  } else {
    return getter.map(dep => {
      if (Store.isStore(dep)) {
        if (!dep.id) {
          throw new Error("When supplying Store dep must supply `id`")
        }
        return dep.id
      }
      return dep
    })
  }
}

/**
 * Evaluates a getter array [dep1, dep2, function(dep1Val, dep2Val) {...}]
 * @param {Immutable.Map} state
 * @param {array} getter
 * @param {Reactor?} reactor
 * @return {*}
 */
function evaluateGetter(state, getter, reactor) {
  var len = getter.length
  var deps = getter.slice(0, len - 1)
  var computeFn = getter[len - 1]

  var values = deps.map(dep => {
    var depPath = normalizeKeyPath(dep)

    if (isGetter(dep)) {
      return evaluateGetter(state, dep, reactor)
    } else {
      if (depPath.length === 1 && Store.isStore(depPath[0])) {
        // if its a store return a store
        return depPath[0]
      } else {
        return state.getIn(depPath)
      }
    }
  })

  return computeFn.apply(null, values)
}

/**
 * Check if something is a Getter
 */
function isGetter(getter) {
  return (isArray(getter) && typeof getter[getter.length - 1] === 'function')
}
