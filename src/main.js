var helpers = require('./immutable-helpers')

/**
 * @return {Reactor}
 */
exports.Reactor = require('./reactor')

/**
 * @return {ReactorState}
 */
exports.ReactiveState = require('./reactive-state')

/**
 * @return {ComputedRecord}
 */
exports.Computed = require('./computed')

// export the immutable library
exports.Immutable = require('immutable')

// expose helper functions
exports.toJS = helpers.toJS
exports.toImmutable = helpers.toImmutable
exports.isImmutable = helpers.isImmutable
