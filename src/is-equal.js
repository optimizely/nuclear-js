var Immutable = require('immutable')
/**
 * Is equal by value check
 */
module.exports = function(a, b) {
  return Immutable.is(a, b)
}
