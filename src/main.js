var helpers = require('./immutable-helpers')

/**
 * @return {Reactor}
 */
exports.Reactor = require('./reactor')

/**
 * @return {Store}
 */
exports.Store = require('./store')

// export the immutable library
exports.Immutable = require('immutable')

/**
 * @return {boolean}
 */
exports.isKeyPath = require('./key-path').isKeyPath

/**
 * @return {boolean}
 */
exports.isGetter = require('./getter').isGetter

// expose helper functions
exports.toJS = helpers.toJS
exports.toImmutable = helpers.toImmutable
exports.isImmutable = helpers.isImmutable
