var Immutable = require('immutable')
var toImmutable = require('../immutable-helpers').toImmutable
var isEqual = require('../is-equal')
var getComputeFn = require('../getter').getComputeFn
var getDeps = require('../getter').getDeps
var isKeyPath = require('../key-path').isKeyPath
var isGetter = require('../getter').isGetter

var EvaluateResult = Immutable.Record({ result: null, reactorState: null})

function evaluateResult(result, reactorState) {
  return new EvaluateResult({
    result: result,
    reactorState: reactorState,
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {EvaluateResult}
 */
module.exports = function evaluate(reactorState, keyPathOrGetter) {
  var state = reactorState.get('state')

  if (isKeyPath(keyPathOrGetter)) {
    // if its a keyPath simply return
    return evaluateResult(
      state.getIn(keyPathOrGetter),
      reactorState
    )
  } else if (!isGetter(keyPathOrGetter)) {
    throw new Error('evaluate must be passed a keyPath or Getter')
  }

  // Must be a Getter
  // if the value is cached for this dispatch cycle, return the cached value
  if (isCached(reactorState, keyPathOrGetter)) {
    // Cache hit
    return evaluateResult(
      reactorState.getIn(['cache', keyPathOrGetter, 'value']),
      reactorState
    )
  }

  // evaluate dependencies
  var args = getDeps(keyPathOrGetter).map(dep => evaluate(reactorState, dep).result)

  if (hasStaleValue(reactorState, keyPathOrGetter)) {
    // getter deps could still be unchanged since we only looked at the unwrapped (keypath, bottom level) deps
    var prevArgs = reactorState.getIn(['cache', keyPathOrGetter, 'args'])

    // since Getter is a pure functions if the args are the same its a cache hit
    if (Immutable.is(prevArgs, toImmutable(args))) {
      var prevValue = reactorState.getIn(['cache', keyPathOrGetter, 'value'])
      return evaluateResult(
        prevValue,
        cacheValue(reactorState, keyPathOrGetter, args, prevValue)
      )
    }
  }

  evaluatedValue = getComputeFn(keyPathOrGetter).apply(null, args)

  return evaluateResult(
    evaluatedValue,
    cacheValue(reactorState, keyPathOrGetter, args, evaluatedValue)
  )
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {Boolean}
 */
function isCached(reactorState, keyPathOrGetter) {
  return (
    reactorState.hasIn(['cache', keyPathOrGetter, 'value']) &&
    reactorState.getIn(['cache', keyPathOrGetter, 'dispatchId']) === reactorState.get('dispatchId')
  )
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {Boolean}
 */
function hasStaleValue(reactorState, getter) {
  var cache = reactorState.get('cache')
  var dispatchId = reactorState.get('dispatchId')
  return (
    cache.has(getter) &&
    cache.getIn([getter, 'dispatchId']) === dispatchId
  )
}

/**
 * Caches the value of a getter given state, getter, args, value
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @param {Array} args
 * @param {any} value
 * @return {ReactorState}
 */
function cacheValue(reactorState, getter, args, value) {
  var dispatchId = reactorState.get('dispatchId')
  return reactorState.setIn(['cache', getter], Immutable.Map({
    value: value,
    args: toImmutable(args),
    dispatchId: dispatchId,
  }));
}
