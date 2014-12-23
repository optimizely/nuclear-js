var KeyPath = require('./key-path')
var Getter = require('./getter')

/**
 * General purpose getter function
 */

/**
 * Takes eithe a KeyPath or Getter and evaluates
 *
 * KeyPath Forms:
 * ['foo', 'bar'] => state.getIn(['foo', 'bar'])
 *
 * Getter forms:
 * [<KeyPath>, <KeyPath>, ..., <function?>]
 * ['foo', 'bar', function(fooValue, barValue) {...}] => 
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

  if (KeyPath.isKeyPath(getter)) {
    if (state && state.getIn) {
      return state.getIn(KeyPath(getter))
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
