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

