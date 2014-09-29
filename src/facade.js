var ReactorCore = require('./reactor-core')
var extend = require('./utils').extend
var ComputedReactor = require('./computed-reactor')

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
