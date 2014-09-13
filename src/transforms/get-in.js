/**
 * ImmutableJS transform
 * Usage:
 * .transform(getIn(['experiments', 1]))
 * Map {
 *   experiments: Map {
 *     1: Map { id: 1 }
 *   }
 * }
 * into
 * Map { id: 1 }
 */
var coerceKeyPath = require('../utils').keyPath

module.exports = function(keyPath) {
  var keyPath = coerceKeyPath(keyPath)
  return function(data) {
    return data.getIn(keyPath)
  }
}
