var ReactorCore = require('./reactor-core')
var extend = require('./utils').extend
var Reactor = require('./reactor')

/**
 * @return {Reactor}
 */
exports.createReactor = function() {
  return new Reactor()
}

/**
 * @param {object} spec
 * @return {ReactorCore}
 */
exports.createCore = function(spec) {
  function Core() {
    ReactorCore.call(this)
  }
  Core.prototype = Object.create(ReactorCore.prototype)
  extend(Core.prototype, spec)
  return Core
}

exports.immutableHelpers = require('./immutable-helpers')
