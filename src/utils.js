var _ = require('underscore');

exports.extend = _.extend

exports.isArray = _.isArray

/**
 * Coerces a string/array into an array keypath
 */
exports.keyPath = function(val) {
  var res = (exports.isArray(val)) ? val : [val]
  // all keypaths are strings
  return res.map(String)
}
