var ReactorCore = require('./ReactorCore')
var extend = require('./utils').extend
var ComputedReactor = require('./ComputedReactor')

/**
 * @return {Reactor}
 */
exports.createReactor = function() {
  return new ComputedReactor()
}

/**
 * @param {object} spec
 * @return {ReactorCore}
 */
exports.createCore = function(spec) {
  var core = new ReactorCore()
  extend(core, spec)
  return core
}

exports.immutableHelpers = require('./immutable-helpers')
exports.Immutable = require('immutable')