var Getter = require('./getter')
var isArray = require('./utils').isArray
var isNumber = require('./utils').isNumber
var isString = require('./utils').isString
var isFunction = require('./utils').isFunction
var coerceKeyPath = require('./utils').keyPath

/**
 * General purpose getter function
 */

/**
 * Getter forms:
 * 'foo.bar'
 * ['foor', 'bar']
 * ['store1, 'foo', 'bar']
 * ['foo', 'bar', function(fooValue, barValue) {...}]
 * [['foo.bar'], 'baz', function(foobarValue, bazValue) {...}]
 * [['store1', 'foo', 'bar', ['foo.bar'], 'baz', function(Store.foo.bar, foobarValue, bazValue) {...}]
 *
 * @param {Immutable.Map} state
 * @param {string|array} getter
 */
module.exports = function evaluate(state, getter) {
  if (getter == null || getter === false) {
    return state
  }

  if (isKeyPath(getter)) {
    if (state && state.getIn) {
      return state.getIn(coerceKeyPath(getter))
    } else {
      // account for the cases when state is a primitive value
      return state
    }
  } else if (Getter.isGetter(getter)) {
    // its of type Getter
    var values = getter.deps.map(evaluate.bind(null, state))
    return getter.computeFn.apply(null, values)
  } else {
    throw new Error("Evaluate must be passed a keyPath or Getter")
  }
}

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
function isKeyPath(toTest) {
  return (
    isNumber(toTest) ||
    isString(toTest) ||
    (isArray(toTest) && !isFunction(toTest[toTest.length - 1]))
  )
}
