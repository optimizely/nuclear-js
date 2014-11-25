var helpers = require('./immutable-helpers')

/**
 * @return {Reactor}
 */
exports.Reactor = require('./reactor')

/**
 * @return {Store}
 */
exports.Store = require('./store')

/**
 * @return {GetterRecord}
 */
exports.Getter = require('./getter')

exports.KeyPath = require('./key-path')

// export the immutable library
exports.Immutable = require('immutable')

// expose helper functions
exports.toJS = helpers.toJS
exports.toImmutable = helpers.toImmutable
exports.isImmutable = helpers.isImmutable
exports.evaluate = require('./evaluate')
