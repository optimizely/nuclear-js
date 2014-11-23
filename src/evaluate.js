var Getter = require('./getter')
var isArray = require('./utils').isArray
var isNumber = require('./utils').isNumber
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

  if (isNumber(getter)) {
    // is a number lookup, ex: 0
    return state.get(getter)
  } else if (Getter.isGetter(getter)) {
    // its of type Getter
    var values = getter.deps.map(evaluate.bind(null, state))
    return getter.computeFn.apply(null, values)
  } else {
    return state.getIn(coerceKeyPath(getter))
  }
}
